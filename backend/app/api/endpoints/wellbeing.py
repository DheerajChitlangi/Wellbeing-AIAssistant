from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.wellbeing import MoodEntry, Activity, SleepEntry, Goal
from app.schemas.wellbeing import (
    MoodEntryCreate,
    MoodEntryResponse,
    ActivityCreate,
    ActivityResponse,
    SleepEntryCreate,
    SleepEntryResponse,
    GoalCreate,
    GoalUpdate,
    GoalResponse,
)
from app.api.deps import get_current_active_user

router = APIRouter()


@router.post("/mood", response_model=MoodEntryResponse, status_code=status.HTTP_201_CREATED)
def create_mood_entry(
    mood_data: MoodEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    mood_entry = MoodEntry(**mood_data.model_dump(), user_id=current_user.id)
    db.add(mood_entry)
    db.commit()
    db.refresh(mood_entry)
    return mood_entry


@router.get("/mood", response_model=List[MoodEntryResponse])
def get_mood_entries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    mood_entries = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id)
        .order_by(MoodEntry.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return mood_entries


@router.post("/activity", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity_data: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    activity = Activity(**activity_data.model_dump(), user_id=current_user.id)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.get("/activity", response_model=List[ActivityResponse])
def get_activities(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    activities = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .order_by(Activity.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return activities


@router.post("/sleep", response_model=SleepEntryResponse, status_code=status.HTTP_201_CREATED)
def create_sleep_entry(
    sleep_data: SleepEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    sleep_entry = SleepEntry(**sleep_data.model_dump(), user_id=current_user.id)
    db.add(sleep_entry)
    db.commit()
    db.refresh(sleep_entry)
    return sleep_entry


@router.get("/sleep", response_model=List[SleepEntryResponse])
def get_sleep_entries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    sleep_entries = (
        db.query(SleepEntry)
        .filter(SleepEntry.user_id == current_user.id)
        .order_by(SleepEntry.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return sleep_entries


@router.post("/goals", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    goal = Goal(**goal_data.model_dump(), user_id=current_user.id)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.get("/goals", response_model=List[GoalResponse])
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .order_by(Goal.created_at.desc())
        .all()
    )
    return goals


@router.put("/goals/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    goal = (
        db.query(Goal)
        .filter(Goal.id == goal_id, Goal.user_id == current_user.id)
        .first()
    )
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found"
        )

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
    goal = (
        db.query(Goal)
        .filter(Goal.id == goal_id, Goal.user_id == current_user.id)
        .first()
    )
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found"
        )

    db.delete(goal)
    db.commit()
    return None
