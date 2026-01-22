from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.work_life import MeetingType, SocialActivityType, BoundaryType


# Work Session Schemas
class WorkSessionBase(BaseModel):
    start_time: datetime
    end_time: datetime
    duration_hours: float = Field(..., gt=0)
    work_type: Optional[str] = None
    project: Optional[str] = None
    is_overtime: bool = False
    location: Optional[str] = None
    breaks_taken: int = Field(default=0, ge=0)
    productivity_rating: Optional[int] = Field(None, ge=1, le=10)
    stress_level: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None


class WorkSessionCreate(WorkSessionBase):
    pass


class WorkSessionResponse(WorkSessionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Meeting Schemas
class MeetingBase(BaseModel):
    title: str
    meeting_type: MeetingType
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(..., gt=0)
    attendees_count: Optional[int] = Field(None, gt=0)
    was_productive: Optional[bool] = None
    could_have_been_email: Optional[bool] = None
    energy_before: Optional[int] = Field(None, ge=1, le=10)
    energy_after: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None


class MeetingCreate(MeetingBase):
    pass


class MeetingResponse(MeetingBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Energy Level Schemas
class EnergyLevelBase(BaseModel):
    timestamp: datetime
    energy_score: int = Field(..., ge=1, le=10)
    mental_clarity: Optional[int] = Field(None, ge=1, le=10)
    physical_energy: Optional[int] = Field(None, ge=1, le=10)
    emotional_state: Optional[int] = Field(None, ge=1, le=10)
    context: Optional[str] = None
    factors: Optional[str] = None
    notes: Optional[str] = None


class EnergyLevelCreate(EnergyLevelBase):
    pass


class EnergyLevelResponse(EnergyLevelBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Social Activity Schemas
class SocialActivityBase(BaseModel):
    activity_type: SocialActivityType
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    duration_hours: float = Field(..., gt=0)
    people_count: Optional[int] = Field(None, gt=0)
    enjoyment_rating: Optional[int] = Field(None, ge=1, le=10)
    energy_before: Optional[int] = Field(None, ge=1, le=10)
    energy_after: Optional[int] = Field(None, ge=1, le=10)
    location: Optional[str] = None
    notes: Optional[str] = None


class SocialActivityCreate(SocialActivityBase):
    pass


class SocialActivityResponse(SocialActivityBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Boundary Schemas
class BoundaryBase(BaseModel):
    boundary_type: BoundaryType
    title: str
    description: str
    rule: str
    start_date: datetime
    end_date: Optional[datetime] = None
    importance: int = Field(..., ge=1, le=5)
    notes: Optional[str] = None


class BoundaryCreate(BoundaryBase):
    pass


class BoundaryUpdate(BaseModel):
    description: Optional[str] = None
    rule: Optional[str] = None
    is_active: Optional[bool] = None
    end_date: Optional[datetime] = None
    importance: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None


class BoundaryResponse(BoundaryBase):
    id: int
    user_id: int
    is_active: bool
    success_count: int
    violation_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Boundary Violation Schemas
class BoundaryViolationBase(BaseModel):
    violation_date: datetime
    circumstances: str
    impact: int = Field(..., ge=1, le=10)
    was_necessary: Optional[bool] = None
    lesson_learned: Optional[str] = None


class BoundaryViolationCreate(BoundaryViolationBase):
    boundary_id: int


class BoundaryViolationResponse(BoundaryViolationBase):
    id: int
    boundary_id: int
    created_at: datetime

    class Config:
        from_attributes = True
