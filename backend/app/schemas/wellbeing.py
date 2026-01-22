from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MoodEntryBase(BaseModel):
    mood_score: int
    energy_level: int
    stress_level: int
    notes: Optional[str] = None


class MoodEntryCreate(MoodEntryBase):
    pass


class MoodEntryResponse(MoodEntryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityBase(BaseModel):
    activity_type: str
    duration_minutes: int
    intensity: Optional[str] = None
    notes: Optional[str] = None


class ActivityCreate(ActivityBase):
    pass


class ActivityResponse(ActivityBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SleepEntryBase(BaseModel):
    sleep_hours: float
    sleep_quality: int
    bedtime: Optional[datetime] = None
    wake_time: Optional[datetime] = None
    notes: Optional[str] = None


class SleepEntryCreate(SleepEntryBase):
    pass


class SleepEntryResponse(SleepEntryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: Optional[datetime] = None


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    is_completed: Optional[int] = None


class GoalResponse(GoalBase):
    id: int
    user_id: int
    is_completed: int
    created_at: datetime

    class Config:
        from_attributes = True
