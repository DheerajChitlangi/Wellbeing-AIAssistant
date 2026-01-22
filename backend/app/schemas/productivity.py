from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.productivity import TaskPriority, TaskStatus, DistractionType


# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    project: Optional[str] = None
    category: Optional[str] = None
    estimated_minutes: Optional[int] = Field(None, gt=0)
    due_date: Optional[datetime] = None
    parent_task_id: Optional[int] = None
    tags: Optional[str] = None
    energy_required: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    project: Optional[str] = None
    actual_minutes: Optional[int] = Field(None, gt=0)
    due_date: Optional[datetime] = None
    notes: Optional[str] = None


class TaskResponse(TaskBase):
    id: int
    user_id: int
    actual_minutes: Optional[int] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Deep Work Session Schemas
class DeepWorkSessionBase(BaseModel):
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(..., gt=0)
    task_id: Optional[int] = None
    project: Optional[str] = None
    focus_score: int = Field(..., ge=1, le=10)
    interruptions: int = Field(default=0, ge=0)
    context: Optional[str] = None
    energy_before: Optional[int] = Field(None, ge=1, le=10)
    energy_after: Optional[int] = Field(None, ge=1, le=10)
    output_quality: Optional[int] = Field(None, ge=1, le=10)
    was_planned: bool = False
    notes: Optional[str] = None


class DeepWorkSessionCreate(DeepWorkSessionBase):
    pass


class DeepWorkSessionResponse(DeepWorkSessionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Productivity Goal Schemas
class ProductivityGoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    goal_type: str
    metric: str
    target_value: float = Field(..., gt=0)
    unit: str
    start_date: datetime
    end_date: Optional[datetime] = None
    priority: int = Field(default=3, ge=1, le=5)
    notes: Optional[str] = None


class ProductivityGoalCreate(ProductivityGoalBase):
    pass


class ProductivityGoalUpdate(BaseModel):
    description: Optional[str] = None
    target_value: Optional[float] = Field(None, gt=0)
    current_value: Optional[float] = Field(None, ge=0)
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    is_completed: Optional[bool] = None
    notes: Optional[str] = None


class ProductivityGoalResponse(ProductivityGoalBase):
    id: int
    user_id: int
    current_value: float
    is_active: bool
    is_completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Distraction Schemas
class DistractionBase(BaseModel):
    distraction_type: DistractionType
    description: str
    timestamp: datetime
    duration_minutes: Optional[int] = Field(None, gt=0)
    impact: int = Field(..., ge=1, le=10)
    deep_work_session_id: Optional[int] = None
    task_id: Optional[int] = None
    was_avoidable: Optional[bool] = None
    prevention_strategy: Optional[str] = None


class DistractionCreate(DistractionBase):
    pass


class DistractionResponse(DistractionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Flow State Schemas
class FlowStateBase(BaseModel):
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(..., gt=0)
    deep_work_session_id: Optional[int] = None
    task_id: Optional[int] = None
    activity: str
    intensity: int = Field(..., ge=1, le=10)
    challenge_level: int = Field(..., ge=1, le=10)
    skill_level: int = Field(..., ge=1, le=10)
    conditions: Optional[str] = None
    triggers: Optional[str] = None
    output_description: Optional[str] = None
    satisfaction: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None


class FlowStateCreate(FlowStateBase):
    pass


class FlowStateResponse(FlowStateBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Pomodoro Schemas
class PomodoroBase(BaseModel):
    task_id: Optional[int] = None
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(default=25, gt=0)
    was_completed: bool = True
    was_interrupted: bool = False
    focus_rating: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None


class PomodoroCreate(PomodoroBase):
    pass


class PomodoroResponse(PomodoroBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
