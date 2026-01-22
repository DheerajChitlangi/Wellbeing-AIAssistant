from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Correlation(Base):
    __tablename__ = "correlations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    pillar_1 = Column(String, nullable=False)  # financial, health, worklife, productivity
    metric_1 = Column(String, nullable=False)
    pillar_2 = Column(String, nullable=False)
    metric_2 = Column(String, nullable=False)
    correlation_coefficient = Column(Float, nullable=False)  # -1 to 1
    p_value = Column(Float, nullable=False)  # Statistical significance
    sample_size = Column(Integer, nullable=False)
    strength = Column(String, nullable=False)  # weak, moderate, strong
    direction = Column(String, nullable=False)  # positive, negative
    insight = Column(Text, nullable=True)  # Natural language explanation
    is_significant = Column(Boolean, default=False)
    discovered_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User")


class Insight(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    insight_type = Column(String, nullable=False, index=True)  # trend, anomaly, achievement, warning
    pillar = Column(String, nullable=False, index=True)  # financial, health, worklife, productivity, cross-pillar
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, nullable=False)  # info, low, medium, high, critical
    actionable = Column(Boolean, default=True)
    data_points = Column(JSON, nullable=True)  # Supporting data
    time_period = Column(String, nullable=False)  # daily, weekly, monthly
    confidence_score = Column(Float, nullable=True)  # 0-100
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    user = relationship("User")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    pillar = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    action_items = Column(JSON, nullable=False)  # List of specific actions
    priority = Column(Integer, nullable=False)  # 1-5
    expected_impact = Column(String, nullable=False)  # low, medium, high
    estimated_effort = Column(String, nullable=False)  # low, medium, high
    reasoning = Column(Text, nullable=True)
    related_insights = Column(JSON, nullable=True)  # List of insight IDs
    status = Column(String, default="pending")  # pending, accepted, dismissed, completed
    outcome = Column(Text, nullable=True)  # User feedback on results
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    prediction_type = Column(String, nullable=False, index=True)  # goal_achievement, burnout, health_trend
    pillar = Column(String, nullable=False)
    target_metric = Column(String, nullable=False)
    current_value = Column(Float, nullable=False)
    predicted_value = Column(Float, nullable=False)
    target_date = Column(DateTime(timezone=True), nullable=False)
    confidence_level = Column(Float, nullable=False)  # 0-100
    factors = Column(JSON, nullable=False)  # Contributing factors
    trend_direction = Column(String, nullable=False)  # improving, stable, declining
    likelihood = Column(String, nullable=False)  # very_low, low, medium, high, very_high
    recommendations = Column(JSON, nullable=True)  # Actions to improve prediction
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User")


class DailyBriefing(Base):
    __tablename__ = "daily_briefings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    briefing_date = Column(DateTime(timezone=True), nullable=False, index=True)
    summary = Column(Text, nullable=False)
    top_priorities = Column(JSON, nullable=False)  # List of priority items
    key_metrics = Column(JSON, nullable=False)  # Today's important numbers
    alerts = Column(JSON, nullable=True)  # Urgent items
    motivational_message = Column(Text, nullable=True)
    weather_context = Column(String, nullable=True)  # How external factors affect wellbeing
    insights_count = Column(Integer, default=0)
    recommendations_count = Column(Integer, default=0)
    is_viewed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")


class WeeklyReview(Base):
    __tablename__ = "weekly_reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    week_start = Column(DateTime(timezone=True), nullable=False, index=True)
    week_end = Column(DateTime(timezone=True), nullable=False)
    overall_score = Column(Float, nullable=False)  # 0-100
    executive_summary = Column(Text, nullable=False)

    # Per-pillar analysis
    financial_summary = Column(JSON, nullable=False)
    health_summary = Column(JSON, nullable=False)
    worklife_summary = Column(JSON, nullable=False)
    productivity_summary = Column(JSON, nullable=False)

    # Key metrics
    wins = Column(JSON, nullable=False)  # Achievements
    concerns = Column(JSON, nullable=False)  # Areas needing attention
    action_items = Column(JSON, nullable=False)  # Next week's focus

    # Trends
    trends = Column(JSON, nullable=False)  # Week-over-week changes
    correlations = Column(JSON, nullable=True)  # Discovered patterns

    # Goals
    goals_progress = Column(JSON, nullable=False)  # Progress on all goals
    goals_on_track = Column(Integer, default=0)
    goals_at_risk = Column(Integer, default=0)

    # Predictions
    next_week_forecast = Column(JSON, nullable=True)

    is_viewed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")


class AIInsightCache(Base):
    """Cache for expensive AI-generated insights"""
    __tablename__ = "ai_insight_cache"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    cache_key = Column(String, nullable=False, unique=True, index=True)
    insight_type = Column(String, nullable=False)
    data_snapshot = Column(JSON, nullable=False)  # Hash of input data
    ai_response = Column(Text, nullable=False)
    tokens_used = Column(Integer, nullable=True)
    model_version = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)

    # Relationships
    user = relationship("User")
