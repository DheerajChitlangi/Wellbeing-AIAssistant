from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.analytics import CorrelationStrength, RecommendationPriority, RecommendationStatus


# Daily Summary Schemas
class DailySummaryBase(BaseModel):
    summary_date: datetime
    total_income: float = 0.0
    total_expenses: float = 0.0
    net_cashflow: float = 0.0
    budget_adherence_score: Optional[float] = None
    total_calories: Optional[int] = None
    exercise_minutes: int = 0
    sleep_hours: Optional[float] = None
    sleep_quality_avg: Optional[float] = None
    work_hours: float = 0.0
    meeting_hours: float = 0.0
    social_hours: float = 0.0
    tasks_completed: int = 0
    deep_work_hours: float = 0.0
    overall_mood_score: Optional[float] = None
    wellbeing_score: Optional[float] = None
    notes: Optional[str] = None


class DailySummaryCreate(DailySummaryBase):
    pass


class DailySummaryResponse(DailySummaryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Correlation Schemas
class CorrelationBase(BaseModel):
    factor_a: str
    factor_b: str
    correlation_coefficient: float = Field(..., ge=-1, le=1)
    strength: CorrelationStrength
    p_value: Optional[float] = None
    sample_size: int = Field(..., gt=0)
    period_start: datetime
    period_end: datetime
    description: str
    insight: str
    confidence: float = Field(..., ge=0, le=100)
    is_actionable: bool = False
    is_causal: bool = False
    tags: Optional[str] = None


class CorrelationCreate(CorrelationBase):
    pass


class CorrelationResponse(CorrelationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Recommendation Schemas
class RecommendationBase(BaseModel):
    title: str
    description: str
    category: str
    subcategory: Optional[str] = None
    priority: RecommendationPriority = RecommendationPriority.MEDIUM
    based_on: str
    confidence: float = Field(..., ge=0, le=100)
    expected_impact: Optional[str] = None
    actionable_steps: str
    estimated_effort: Optional[str] = None
    estimated_time: Optional[str] = None
    correlation_id: Optional[int] = None
    related_goal_id: Optional[int] = None
    expires_at: Optional[datetime] = None


class RecommendationCreate(RecommendationBase):
    pass


class RecommendationUpdate(BaseModel):
    status: Optional[RecommendationStatus] = None
    dismissal_reason: Optional[str] = None
    completion_notes: Optional[str] = None
    was_helpful: Optional[bool] = None
    effectiveness_rating: Optional[int] = Field(None, ge=1, le=5)
    user_feedback: Optional[str] = None


class RecommendationResponse(RecommendationBase):
    id: int
    user_id: int
    status: RecommendationStatus
    viewed_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    dismissed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    was_helpful: Optional[bool] = None
    effectiveness_rating: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Weekly Summary Schemas
class WeeklySummaryBase(BaseModel):
    week_start_date: datetime
    week_end_date: datetime
    total_income_week: float = 0.0
    total_expenses_week: float = 0.0
    total_work_hours: float = 0.0
    total_tasks_completed: int = 0
    avg_wellbeing_score: Optional[float] = None


class WeeklySummaryResponse(WeeklySummaryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Monthly Summary Schemas
class MonthlySummaryBase(BaseModel):
    month: int = Field(..., ge=1, le=12)
    year: int
    total_income_month: float = 0.0
    total_expenses_month: float = 0.0
    net_savings: float = 0.0
    overall_wellbeing_score: Optional[float] = None


class MonthlySummaryResponse(MonthlySummaryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
