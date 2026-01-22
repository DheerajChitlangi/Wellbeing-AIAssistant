from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, or_, desc
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.user import User
from app.models.productivity import (
    Task,
    DeepWorkSession,
    ProductivityGoal,
    Distraction,
    FlowState,
    Pomodoro,
    TaskStatus,
    TaskPriority,
)
from app.schemas.productivity import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    DeepWorkSessionCreate,
    DeepWorkSessionResponse,
    ProductivityGoalCreate,
    ProductivityGoalUpdate,
    ProductivityGoalResponse,
    DistractionCreate,
    DistractionResponse,
    FlowStateCreate,
    FlowStateResponse,
    PomodoroCreate,
    PomodoroResponse,
)
from app.api.deps import get_current_active_user

router = APIRouter()


# ==================== TASKS ====================

@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new task"""
    task = Task(
        **task_data.model_dump(),
        user_id=current_user.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/tasks", response_model=List[TaskResponse])
def get_tasks(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    project: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get user's tasks with optional filters"""
    query = db.query(Task).filter(Task.user_id == current_user.id)

    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if project:
        query = query.filter(Task.project == project)

    tasks = query.order_by(desc(Task.created_at)).offset(skip).limit(limit).all()
    return tasks


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific task"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a task"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_data.model_dump(exclude_unset=True)

    if update_data.get('status') == TaskStatus.COMPLETED and not task.completed_at:
        update_data['completed_at'] = datetime.utcnow()

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a task"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()


# ==================== DEEP WORK SESSIONS ====================

@router.post("/deepwork", response_model=DeepWorkSessionResponse, status_code=status.HTTP_201_CREATED)
def create_deep_work_session(
    session_data: DeepWorkSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new deep work session"""
    session = DeepWorkSession(
        **session_data.model_dump(),
        user_id=current_user.id
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/deepwork", response_model=List[DeepWorkSessionResponse])
def get_deep_work_sessions(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get user's deep work sessions"""
    sessions = db.query(DeepWorkSession).filter(
        DeepWorkSession.user_id == current_user.id
    ).order_by(desc(DeepWorkSession.start_time)).offset(skip).limit(limit).all()
    return sessions


# ==================== DISTRACTIONS ====================

@router.post("/distractions", response_model=DistractionResponse, status_code=status.HTTP_201_CREATED)
def create_distraction(
    distraction_data: DistractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Log a distraction"""
    distraction = Distraction(
        **distraction_data.model_dump(),
        user_id=current_user.id
    )
    db.add(distraction)
    db.commit()
    db.refresh(distraction)
    return distraction


@router.get("/distractions", response_model=List[DistractionResponse])
def get_distractions(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get user's distractions"""
    distractions = db.query(Distraction).filter(
        Distraction.user_id == current_user.id
    ).order_by(desc(Distraction.timestamp)).offset(skip).limit(limit).all()
    return distractions


@router.delete("/distractions/{distraction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_distraction(
    distraction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a distraction"""
    distraction = db.query(Distraction).filter(
        Distraction.id == distraction_id,
        Distraction.user_id == current_user.id
    ).first()

    if not distraction:
        raise HTTPException(status_code=404, detail="Distraction not found")

    db.delete(distraction)
    db.commit()


# ==================== GOALS ====================

@router.post("/goals", response_model=ProductivityGoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: ProductivityGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a productivity goal"""
    goal = ProductivityGoal(
        **goal_data.model_dump(),
        user_id=current_user.id
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.get("/goals", response_model=List[ProductivityGoalResponse])
def get_goals(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    active_only: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get user's productivity goals"""
    query = db.query(ProductivityGoal).filter(ProductivityGoal.user_id == current_user.id)

    if active_only:
        query = query.filter(ProductivityGoal.is_active == True)

    goals = query.order_by(desc(ProductivityGoal.created_at)).offset(skip).limit(limit).all()
    return goals


@router.put("/goals/{goal_id}", response_model=ProductivityGoalResponse)
def update_goal(
    goal_id: int,
    goal_data: ProductivityGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a productivity goal"""
    goal = db.query(ProductivityGoal).filter(
        ProductivityGoal.id == goal_id,
        ProductivityGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_data = goal_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)

    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a productivity goal"""
    goal = db.query(ProductivityGoal).filter(
        ProductivityGoal.id == goal_id,
        ProductivityGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal)
    db.commit()


# ==================== DASHBOARD ====================

@router.get("/dashboard")
def get_productivity_dashboard(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get comprehensive productivity dashboard data"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)

    # Task statistics
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.created_at >= cutoff_date
    ).all()

    completed_tasks = [t for t in tasks if t.status == TaskStatus.COMPLETED]
    completion_rate = len(completed_tasks) / len(tasks) * 100 if tasks else 0

    # Deep work statistics
    deep_work = db.query(DeepWorkSession).filter(
        DeepWorkSession.user_id == current_user.id,
        DeepWorkSession.start_time >= cutoff_date
    ).all()

    total_deep_work_hours = sum(s.duration_minutes for s in deep_work) / 60
    avg_focus_score = sum(s.focus_score for s in deep_work) / len(deep_work) if deep_work else 0

    # Distraction statistics
    distractions = db.query(Distraction).filter(
        Distraction.user_id == current_user.id,
        Distraction.timestamp >= cutoff_date
    ).all()

    context_switches = len(distractions)
    avg_distraction_impact = sum(d.impact for d in distractions) / len(distractions) if distractions else 0

    # Calculate peak productivity hours
    hourly_focus = {}
    for session in deep_work:
        hour = session.start_time.hour
        if hour not in hourly_focus:
            hourly_focus[hour] = []
        hourly_focus[hour].append(session.focus_score)

    peak_hours = sorted(
        [(hour, sum(scores)/len(scores)) for hour, scores in hourly_focus.items()],
        key=lambda x: x[1],
        reverse=True
    )[:3]

    # Calculate productivity score (0-100)
    productivity_score = min(100, int(
        (completion_rate * 0.3) +
        (avg_focus_score * 10 * 0.3) +
        ((1 - min(context_switches / (days * 10), 1)) * 100 * 0.2) +
        (min(total_deep_work_hours / (days * 4), 1) * 100 * 0.2)
    ))

    return {
        "productivity_score": productivity_score,
        "tasks_completed": len(completed_tasks),
        "tasks_total": len(tasks),
        "completion_rate": round(completion_rate, 1),
        "deep_work_hours": round(total_deep_work_hours, 1),
        "avg_focus_score": round(avg_focus_score, 1),
        "context_switches": context_switches,
        "avg_distraction_impact": round(avg_distraction_impact, 1),
        "peak_hours": [{"hour": h, "score": round(s, 1)} for h, s in peak_hours],
        "days_analyzed": days,
    }
