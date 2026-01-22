from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, timedelta
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.work_life import (
    WorkSession,
    Meeting,
    EnergyLevel,
    SocialActivity,
    Boundary,
    BoundaryViolation,
)
from app.schemas.work_life import (
    WorkSessionCreate,
    WorkSessionResponse,
    MeetingCreate,
    MeetingResponse,
    EnergyLevelCreate,
    EnergyLevelResponse,
    SocialActivityCreate,
    SocialActivityResponse,
    BoundaryCreate,
    BoundaryUpdate,
    BoundaryResponse,
    BoundaryViolationCreate,
    BoundaryViolationResponse,
)

router = APIRouter()


# ============== Work Hours Tracker ==============


@router.post("/hours", response_model=WorkSessionResponse)
def create_work_session(
    session_data: WorkSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a work session with automatic boundary violation detection"""

    # Check for boundary violations
    violations = check_work_boundary_violations(
        db, current_user.id, session_data.start_time, session_data.end_time
    )

    work_session = WorkSession(**session_data.dict(), user_id=current_user.id)
    db.add(work_session)
    db.commit()
    db.refresh(work_session)

    # Log boundary violations if any
    if violations:
        for violation in violations:
            log_boundary_violation(db, violation["boundary_id"], violation["message"])

    return work_session


@router.get("/hours", response_model=List[WorkSessionResponse])
def get_work_sessions(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve work sessions for a date range"""
    query = db.query(WorkSession).filter(WorkSession.user_id == current_user.id)

    if start_date:
        query = query.filter(WorkSession.start_time >= start_date)
    if end_date:
        query = query.filter(WorkSession.end_time <= end_date)

    sessions = query.order_by(WorkSession.start_time.desc()).offset(skip).limit(limit).all()
    return sessions


# ============== Meeting Logger ==============


@router.post("/meetings", response_model=MeetingResponse)
def create_meeting(
    meeting_data: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a meeting with duration and energy drain rating"""
    meeting = Meeting(**meeting_data.dict(), user_id=current_user.id)
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("/meetings", response_model=List[MeetingResponse])
def get_meetings(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve meetings for a date range"""
    query = db.query(Meeting).filter(Meeting.user_id == current_user.id)

    if start_date:
        query = query.filter(Meeting.start_time >= start_date)
    if end_date:
        query = query.filter(Meeting.end_time <= end_date)

    meetings = query.order_by(Meeting.start_time.desc()).offset(skip).limit(limit).all()
    return meetings


# ============== Energy Levels ==============


@router.post("/energy", response_model=EnergyLevelResponse)
def create_energy_level(
    energy_data: EnergyLevelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log an energy level check-in"""
    energy_level = EnergyLevel(**energy_data.dict(), user_id=current_user.id)
    db.add(energy_level)
    db.commit()
    db.refresh(energy_level)
    return energy_level


@router.get("/energy", response_model=List[EnergyLevelResponse])
def get_energy_levels(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve energy levels with pattern identification"""
    query = db.query(EnergyLevel).filter(EnergyLevel.user_id == current_user.id)

    if start_date:
        query = query.filter(EnergyLevel.timestamp >= start_date)
    if end_date:
        query = query.filter(EnergyLevel.timestamp <= end_date)

    levels = query.order_by(EnergyLevel.timestamp.desc()).offset(skip).limit(limit).all()
    return levels


@router.get("/energy/patterns")
def get_energy_patterns(
    days: int = Query(30, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Identify energy patterns over time"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    energy_levels = (
        db.query(EnergyLevel)
        .filter(
            and_(
                EnergyLevel.user_id == current_user.id,
                EnergyLevel.timestamp >= start_date,
                EnergyLevel.timestamp <= end_date,
            )
        )
        .order_by(EnergyLevel.timestamp)
        .all()
    )

    if not energy_levels:
        return {
            "message": "Not enough data to identify patterns",
            "patterns": [],
        }

    patterns = identify_energy_patterns(energy_levels)
    return patterns


# ============== Social Time Tracker ==============


@router.post("/social", response_model=SocialActivityResponse)
def create_social_activity(
    activity_data: SocialActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log social time (family, friends, solo)"""
    activity = SocialActivity(**activity_data.dict(), user_id=current_user.id)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.get("/social", response_model=List[SocialActivityResponse])
def get_social_activities(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve social activities"""
    query = db.query(SocialActivity).filter(SocialActivity.user_id == current_user.id)

    if start_date:
        query = query.filter(SocialActivity.start_time >= start_date)
    if end_date:
        query = query.filter(SocialActivity.end_time <= end_date)

    activities = (
        query.order_by(SocialActivity.start_time.desc()).offset(skip).limit(limit).all()
    )
    return activities


# ============== Boundaries ==============


@router.post("/boundaries", response_model=BoundaryResponse)
def create_boundary(
    boundary_data: BoundaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a work-life boundary"""
    boundary = Boundary(**boundary_data.dict(), user_id=current_user.id)
    db.add(boundary)
    db.commit()
    db.refresh(boundary)
    return boundary


@router.get("/boundaries", response_model=List[BoundaryResponse])
def get_boundaries(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve user's boundaries"""
    query = db.query(Boundary).filter(Boundary.user_id == current_user.id)

    if active_only:
        query = query.filter(Boundary.is_active == True)

    boundaries = query.order_by(Boundary.importance.desc()).all()
    return boundaries


@router.patch("/boundaries/{boundary_id}", response_model=BoundaryResponse)
def update_boundary(
    boundary_id: int,
    boundary_data: BoundaryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a boundary"""
    boundary = (
        db.query(Boundary)
        .filter(
            and_(Boundary.id == boundary_id, Boundary.user_id == current_user.id)
        )
        .first()
    )

    if not boundary:
        raise HTTPException(status_code=404, detail="Boundary not found")

    update_data = boundary_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(boundary, field, value)

    db.commit()
    db.refresh(boundary)
    return boundary


# ============== Life Quality Dashboard ==============


@router.get("/dashboard")
def get_dashboard(
    days: int = Query(30, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Life Quality Dashboard with:
    - Work-life balance score (0-100)
    - Meeting load analysis
    - Always-on patterns
    - Vacation utilization
    - Burnout risk score
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    # Get work sessions
    work_sessions = (
        db.query(WorkSession)
        .filter(
            and_(
                WorkSession.user_id == current_user.id,
                WorkSession.start_time >= start_date,
                WorkSession.end_time <= end_date,
            )
        )
        .all()
    )

    # Get meetings
    meetings = (
        db.query(Meeting)
        .filter(
            and_(
                Meeting.user_id == current_user.id,
                Meeting.start_time >= start_date,
                Meeting.end_time <= end_date,
            )
        )
        .all()
    )

    # Get energy levels
    energy_levels = (
        db.query(EnergyLevel)
        .filter(
            and_(
                EnergyLevel.user_id == current_user.id,
                EnergyLevel.timestamp >= start_date,
                EnergyLevel.timestamp <= end_date,
            )
        )
        .all()
    )

    # Get social activities
    social_activities = (
        db.query(SocialActivity)
        .filter(
            and_(
                SocialActivity.user_id == current_user.id,
                SocialActivity.start_time >= start_date,
                SocialActivity.end_time <= end_date,
            )
        )
        .all()
    )

    # Get boundaries and violations
    boundaries = (
        db.query(Boundary)
        .filter(
            and_(Boundary.user_id == current_user.id, Boundary.is_active == True)
        )
        .all()
    )

    # Calculate metrics
    balance_score = calculate_balance_score(
        work_sessions, social_activities, energy_levels
    )
    meeting_load = analyze_meeting_load(meetings)
    always_on_patterns = detect_always_on_patterns(work_sessions)
    burnout_risk = calculate_burnout_risk(
        work_sessions, meetings, energy_levels, boundaries
    )

    return {
        "period_days": days,
        "balance_score": balance_score,
        "meeting_analysis": meeting_load,
        "always_on_patterns": always_on_patterns,
        "burnout_risk": burnout_risk,
        "total_work_hours": sum(s.duration_hours for s in work_sessions),
        "total_meetings": len(meetings),
        "total_meeting_hours": sum(m.duration_minutes for m in meetings) / 60,
        "total_social_hours": sum(a.duration_hours for a in social_activities),
        "active_boundaries": len(boundaries),
        "boundary_violations": sum(b.violation_count for b in boundaries),
    }


# ============== Helper Functions ==============


def check_work_boundary_violations(
    db: Session, user_id: int, start_time: datetime, end_time: datetime
):
    """Check if a work session violates any active boundaries"""
    violations = []

    boundaries = (
        db.query(Boundary)
        .filter(and_(Boundary.user_id == user_id, Boundary.is_active == True))
        .all()
    )

    for boundary in boundaries:
        # Check work hours boundary (e.g., no work after 6 PM)
        if boundary.boundary_type == "work_hours":
            if start_time.hour >= 18 or end_time.hour >= 22:
                violations.append(
                    {
                        "boundary_id": boundary.id,
                        "message": f"Work session violates '{boundary.title}' boundary",
                    }
                )

    return violations


def log_boundary_violation(db: Session, boundary_id: int, message: str):
    """Log a boundary violation"""
    boundary = db.query(Boundary).filter(Boundary.id == boundary_id).first()
    if boundary:
        boundary.violation_count += 1
        db.commit()


def calculate_balance_score(work_sessions, social_activities, energy_levels):
    """
    Calculate work-life balance score (0-100)
    Higher score = better balance
    """
    if not work_sessions:
        return 50  # Neutral score if no data

    total_work_hours = sum(s.duration_hours for s in work_sessions)
    total_social_hours = sum(a.duration_hours for a in social_activities)

    # Ideal ratio is 1:0.5 (work:personal)
    if total_work_hours == 0:
        ratio_score = 100
    else:
        ratio = total_social_hours / total_work_hours
        ideal_ratio = 0.5
        ratio_score = max(0, 100 - abs(ratio - ideal_ratio) * 100)

    # Energy score component
    if energy_levels:
        avg_energy = sum(e.energy_score for e in energy_levels) / len(energy_levels)
        energy_score = (avg_energy / 10) * 100
    else:
        energy_score = 50

    # Overtime penalty
    overtime_sessions = [s for s in work_sessions if s.is_overtime]
    overtime_penalty = min(20, len(overtime_sessions) * 2)

    balance_score = (ratio_score * 0.5 + energy_score * 0.5) - overtime_penalty
    return max(0, min(100, round(balance_score)))


def analyze_meeting_load(meetings):
    """Analyze meeting load and efficiency"""
    if not meetings:
        return {
            "total_meetings": 0,
            "total_hours": 0,
            "avg_duration_minutes": 0,
            "unproductive_meetings": 0,
            "could_be_emails": 0,
            "energy_drain_avg": 0,
        }

    total_minutes = sum(m.duration_minutes for m in meetings)
    unproductive = len([m for m in meetings if m.was_productive == False])
    could_be_emails = len([m for m in meetings if m.could_have_been_email == True])

    # Calculate energy drain
    energy_drains = []
    for m in meetings:
        if m.energy_before and m.energy_after:
            drain = m.energy_before - m.energy_after
            energy_drains.append(drain)

    avg_energy_drain = sum(energy_drains) / len(energy_drains) if energy_drains else 0

    return {
        "total_meetings": len(meetings),
        "total_hours": round(total_minutes / 60, 1),
        "avg_duration_minutes": round(total_minutes / len(meetings)),
        "unproductive_meetings": unproductive,
        "could_be_emails": could_be_emails,
        "energy_drain_avg": round(avg_energy_drain, 1),
        "efficiency_score": round(
            ((len(meetings) - unproductive - could_be_emails) / len(meetings)) * 100
        ),
    }


def detect_always_on_patterns(work_sessions):
    """Detect if user is working at unusual hours"""
    if not work_sessions:
        return {"detected": False, "patterns": []}

    patterns = []
    evening_sessions = []
    weekend_sessions = []
    early_morning_sessions = []

    for session in work_sessions:
        # Evening work (after 8 PM)
        if session.start_time.hour >= 20:
            evening_sessions.append(session)

        # Weekend work
        if session.start_time.weekday() >= 5:
            weekend_sessions.append(session)

        # Early morning (before 6 AM)
        if session.start_time.hour < 6:
            early_morning_sessions.append(session)

    if evening_sessions:
        patterns.append(
            {
                "type": "evening_work",
                "count": len(evening_sessions),
                "severity": "high" if len(evening_sessions) > 5 else "medium",
            }
        )

    if weekend_sessions:
        patterns.append(
            {
                "type": "weekend_work",
                "count": len(weekend_sessions),
                "severity": "high" if len(weekend_sessions) > 3 else "low",
            }
        )

    if early_morning_sessions:
        patterns.append(
            {
                "type": "early_morning_work",
                "count": len(early_morning_sessions),
                "severity": "medium" if len(early_morning_sessions) > 3 else "low",
            }
        )

    return {
        "detected": len(patterns) > 0,
        "patterns": patterns,
        "total_unusual_sessions": len(evening_sessions)
        + len(weekend_sessions)
        + len(early_morning_sessions),
    }


def calculate_burnout_risk(work_sessions, meetings, energy_levels, boundaries):
    """
    Calculate burnout risk score (0-100)
    Higher score = higher risk
    """
    risk_factors = []
    total_score = 0

    # 1. Long work hours (>50 hours/week)
    if work_sessions:
        total_hours = sum(s.duration_hours for s in work_sessions)
        weeks = len(set(s.start_time.isocalendar()[1] for s in work_sessions))
        avg_weekly_hours = total_hours / max(1, weeks)

        if avg_weekly_hours > 50:
            risk_factors.append("excessive_hours")
            total_score += 25
        elif avg_weekly_hours > 45:
            total_score += 15

    # 2. High meeting load
    if meetings:
        total_meeting_hours = sum(m.duration_minutes for m in meetings) / 60
        if total_meeting_hours > 20:
            risk_factors.append("meeting_overload")
            total_score += 20

    # 3. Low energy levels
    if energy_levels:
        avg_energy = sum(e.energy_score for e in energy_levels) / len(energy_levels)
        if avg_energy < 5:
            risk_factors.append("low_energy")
            total_score += 25
        elif avg_energy < 6:
            total_score += 15

    # 4. High stress levels
    high_stress_sessions = [s for s in work_sessions if s.stress_level and s.stress_level > 7]
    if len(high_stress_sessions) > len(work_sessions) * 0.5:
        risk_factors.append("high_stress")
        total_score += 20

    # 5. Boundary violations
    if boundaries:
        total_violations = sum(b.violation_count for b in boundaries)
        if total_violations > 10:
            risk_factors.append("boundary_violations")
            total_score += 15

    # 6. Always-on pattern
    always_on = detect_always_on_patterns(work_sessions)
    if always_on["detected"]:
        risk_factors.append("always_on_pattern")
        total_score += 15

    # Determine risk level
    if total_score >= 70:
        risk_level = "critical"
    elif total_score >= 50:
        risk_level = "high"
    elif total_score >= 30:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {
        "score": min(100, total_score),
        "level": risk_level,
        "risk_factors": risk_factors,
        "recommendations": generate_burnout_recommendations(risk_factors),
    }


def generate_burnout_recommendations(risk_factors):
    """Generate recommendations based on risk factors"""
    recommendations = []

    if "excessive_hours" in risk_factors:
        recommendations.append("Reduce working hours to 40-45 hours per week")

    if "meeting_overload" in risk_factors:
        recommendations.append(
            "Audit meetings - decline unnecessary ones and batch similar meetings"
        )

    if "low_energy" in risk_factors:
        recommendations.append(
            "Prioritize sleep, exercise, and take regular breaks during the day"
        )

    if "high_stress" in risk_factors:
        recommendations.append(
            "Practice stress management techniques and consider talking to a professional"
        )

    if "boundary_violations" in risk_factors:
        recommendations.append("Strengthen and enforce your work-life boundaries")

    if "always_on_pattern" in risk_factors:
        recommendations.append(
            "Set clear work hours and disconnect from work communications after hours"
        )

    if not recommendations:
        recommendations.append("Continue maintaining healthy work-life balance!")

    return recommendations


def identify_energy_patterns(energy_levels):
    """Identify energy patterns throughout the day/week"""
    if not energy_levels:
        return {"message": "Not enough data", "patterns": []}

    # Group by hour of day
    hourly_energy = {}
    for level in energy_levels:
        hour = level.timestamp.hour
        if hour not in hourly_energy:
            hourly_energy[hour] = []
        hourly_energy[hour].append(level.energy_score)

    # Calculate average energy per hour
    hourly_avg = {
        hour: sum(scores) / len(scores) for hour, scores in hourly_energy.items()
    }

    # Find peak and low energy hours
    if hourly_avg:
        peak_hour = max(hourly_avg, key=hourly_avg.get)
        low_hour = min(hourly_avg, key=hourly_avg.get)

        return {
            "peak_energy_hour": peak_hour,
            "peak_energy_score": round(hourly_avg[peak_hour], 1),
            "low_energy_hour": low_hour,
            "low_energy_score": round(hourly_avg[low_hour], 1),
            "hourly_averages": {
                hour: round(avg, 1) for hour, avg in sorted(hourly_avg.items())
            },
            "recommendation": f"Schedule important tasks around {peak_hour}:00 when your energy is highest",
        }

    return {"message": "Not enough data to identify patterns", "patterns": []}
