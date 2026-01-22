from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Correlation Schemas
class CorrelationResponse(BaseModel):
    id: int
    pillar_1: str
    metric_1: str
    pillar_2: str
    metric_2: str
    correlation_coefficient: float
    p_value: float
    sample_size: int
    strength: str
    direction: str
    insight: Optional[str] = None
    is_significant: bool
    discovered_at: datetime

    class Config:
        from_attributes = True


# Insight Schemas
class InsightResponse(BaseModel):
    id: int
    insight_type: str
    pillar: str
    title: str
    description: str
    severity: str
    actionable: bool
    data_points: Optional[Dict[str, Any]] = None
    time_period: str
    confidence_score: Optional[float] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Recommendation Schemas
class RecommendationResponse(BaseModel):
    id: int
    pillar: str
    category: str
    title: str
    description: str
    action_items: List[str]
    priority: int
    expected_impact: str
    estimated_effort: str
    reasoning: Optional[str] = None
    status: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RecommendationUpdate(BaseModel):
    status: Optional[str] = None
    outcome: Optional[str] = None
    is_active: Optional[bool] = None


# Prediction Schemas
class PredictionResponse(BaseModel):
    id: int
    prediction_type: str
    pillar: str
    target_metric: str
    current_value: float
    predicted_value: float
    target_date: datetime
    confidence_level: float
    factors: Dict[str, Any]
    trend_direction: str
    likelihood: str
    recommendations: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Daily Briefing Schemas
class DailyBriefingResponse(BaseModel):
    id: int
    briefing_date: datetime
    summary: str
    top_priorities: List[Dict[str, Any]]
    key_metrics: Dict[str, Any]
    alerts: Optional[List[Dict[str, Any]]] = None
    motivational_message: Optional[str] = None
    insights_count: int
    recommendations_count: int
    is_viewed: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Weekly Review Schemas
class WeeklyReviewResponse(BaseModel):
    id: int
    week_start: datetime
    week_end: datetime
    overall_score: float
    executive_summary: str
    financial_summary: Dict[str, Any]
    health_summary: Dict[str, Any]
    worklife_summary: Dict[str, Any]
    productivity_summary: Dict[str, Any]
    wins: List[str]
    concerns: List[str]
    action_items: List[str]
    trends: Dict[str, Any]
    correlations: Optional[Dict[str, Any]] = None
    goals_progress: Dict[str, Any]
    goals_on_track: int
    goals_at_risk: int
    next_week_forecast: Optional[Dict[str, Any]] = None
    is_viewed: bool
    created_at: datetime

    class Config:
        from_attributes = True
