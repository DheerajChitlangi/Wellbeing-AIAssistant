from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Enum, Index, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class CorrelationStrength(str, enum.Enum):
    WEAK = "weak"
    MODERATE = "moderate"
    STRONG = "strong"
    VERY_STRONG = "very_strong"


class RecommendationPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RecommendationStatus(str, enum.Enum):
    PENDING = "pending"
    VIEWED = "viewed"
    ACCEPTED = "accepted"
    DISMISSED = "dismissed"
    COMPLETED = "completed"


class DailySummary(Base):
    __tablename__ = "daily_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    summary_date = Column(DateTime(timezone=True), nullable=False, index=True)

    # Financial metrics
    total_income = Column(Float, default=0.0)
    total_expenses = Column(Float, default=0.0)
    net_cashflow = Column(Float, default=0.0)
    budget_adherence_score = Column(Float, nullable=True)  # 0-100%

    # Health metrics
    total_calories = Column(Integer, nullable=True)
    total_protein = Column(Float, nullable=True)
    total_carbs = Column(Float, nullable=True)
    total_fat = Column(Float, nullable=True)
    water_intake = Column(Float, nullable=True)
    exercise_minutes = Column(Integer, default=0)
    steps = Column(Integer, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    sleep_quality_avg = Column(Float, nullable=True)
    symptom_count = Column(Integer, default=0)

    # Work-life metrics
    work_hours = Column(Float, default=0.0)
    meeting_hours = Column(Float, default=0.0)
    social_hours = Column(Float, default=0.0)
    boundary_violations = Column(Integer, default=0)
    energy_level_avg = Column(Float, nullable=True)
    stress_level_avg = Column(Float, nullable=True)

    # Productivity metrics
    tasks_completed = Column(Integer, default=0)
    tasks_created = Column(Integer, default=0)
    deep_work_hours = Column(Float, default=0.0)
    flow_state_hours = Column(Float, default=0.0)
    distraction_count = Column(Integer, default=0)
    focus_score_avg = Column(Float, nullable=True)
    pomodoros_completed = Column(Integer, default=0)

    # Overall wellbeing
    overall_mood_score = Column(Float, nullable=True)  # 1-10 scale
    wellbeing_score = Column(Float, nullable=True)  # Calculated composite score 0-100

    # Additional data
    notes = Column(Text, nullable=True)
    highlights = Column(Text, nullable=True)  # JSON array of daily highlights
    lowlights = Column(Text, nullable=True)  # JSON array of challenges

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="daily_summaries")

    __table_args__ = (
        Index('ix_daily_summaries_user_date', 'user_id', 'summary_date', unique=True),
    )


class Correlation(Base):
    __tablename__ = "correlations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # What factors are being correlated
    factor_a = Column(String, nullable=False, index=True)  # e.g., "sleep_hours"
    factor_b = Column(String, nullable=False, index=True)  # e.g., "productivity_score"

    # Correlation details
    correlation_coefficient = Column(Float, nullable=False)  # -1 to 1
    strength = Column(Enum(CorrelationStrength), nullable=False)
    p_value = Column(Float, nullable=True)  # Statistical significance
    sample_size = Column(Integer, nullable=False)  # Number of data points

    # Time period analyzed
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)

    # Description and insights
    description = Column(Text, nullable=False)
    insight = Column(Text, nullable=False)  # Human-readable explanation
    confidence = Column(Float, nullable=False)  # 0-100%

    # Metadata
    is_actionable = Column(Boolean, default=False)
    is_causal = Column(Boolean, default=False)  # True if likely causal, not just correlational
    tags = Column(Text, nullable=True)  # JSON array of tags

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="correlations")

    __table_args__ = (
        Index('ix_correlations_user_factors', 'user_id', 'factor_a', 'factor_b'),
    )


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Recommendation details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False, index=True)  # financial, health, work_life, productivity
    subcategory = Column(String, nullable=True)

    # Priority and status
    priority = Column(Enum(RecommendationPriority), nullable=False, default=RecommendationPriority.MEDIUM, index=True)
    status = Column(Enum(RecommendationStatus), nullable=False, default=RecommendationStatus.PENDING, index=True)

    # AI/Analysis details
    based_on = Column(Text, nullable=False)  # What data/correlation led to this
    confidence = Column(Float, nullable=False)  # 0-100%
    expected_impact = Column(Text, nullable=True)  # What improvement to expect

    # Action items
    actionable_steps = Column(Text, nullable=False)  # JSON array of steps
    estimated_effort = Column(String, nullable=True)  # low, medium, high
    estimated_time = Column(String, nullable=True)  # "5 minutes", "1 week", etc.

    # Related data
    correlation_id = Column(Integer, ForeignKey("correlations.id"), nullable=True)
    related_goal_id = Column(Integer, nullable=True)  # Could link to various goal tables

    # Tracking
    viewed_at = Column(DateTime(timezone=True), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    dismissed_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    dismissal_reason = Column(Text, nullable=True)
    completion_notes = Column(Text, nullable=True)

    # Effectiveness tracking
    was_helpful = Column(Boolean, nullable=True)
    effectiveness_rating = Column(Integer, nullable=True)  # 1-5 scale
    user_feedback = Column(Text, nullable=True)

    # Expiry
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Some recommendations may be time-sensitive

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="recommendations")
    correlation = relationship("Correlation")

    __table_args__ = (
        Index('ix_recommendations_user_status', 'user_id', 'status'),
        Index('ix_recommendations_user_category', 'user_id', 'category'),
        Index('ix_recommendations_user_priority', 'user_id', 'priority'),
    )


class WeeklySummary(Base):
    __tablename__ = "weekly_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    week_start_date = Column(DateTime(timezone=True), nullable=False, index=True)
    week_end_date = Column(DateTime(timezone=True), nullable=False)

    # Aggregated financial metrics
    total_income_week = Column(Float, default=0.0)
    total_expenses_week = Column(Float, default=0.0)
    net_cashflow_week = Column(Float, default=0.0)
    avg_daily_spending = Column(Float, default=0.0)
    budget_adherence_avg = Column(Float, nullable=True)

    # Aggregated health metrics
    avg_calories = Column(Float, nullable=True)
    total_exercise_minutes = Column(Integer, default=0)
    avg_sleep_hours = Column(Float, nullable=True)
    avg_sleep_quality = Column(Float, nullable=True)
    symptom_days = Column(Integer, default=0)

    # Aggregated work-life metrics
    total_work_hours = Column(Float, default=0.0)
    total_meeting_hours = Column(Float, default=0.0)
    total_social_hours = Column(Float, default=0.0)
    boundary_violations_total = Column(Integer, default=0)
    avg_energy_level = Column(Float, nullable=True)

    # Aggregated productivity metrics
    total_tasks_completed = Column(Integer, default=0)
    total_deep_work_hours = Column(Float, default=0.0)
    total_flow_hours = Column(Float, default=0.0)
    avg_focus_score = Column(Float, nullable=True)
    total_distractions = Column(Integer, default=0)

    # Overall trends
    wellbeing_trend = Column(String, nullable=True)  # improving, stable, declining
    avg_wellbeing_score = Column(Float, nullable=True)

    # Week insights
    top_achievements = Column(Text, nullable=True)  # JSON array
    areas_for_improvement = Column(Text, nullable=True)  # JSON array
    insights = Column(Text, nullable=True)  # Key patterns noticed

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="weekly_summaries")

    __table_args__ = (
        Index('ix_weekly_summaries_user_week', 'user_id', 'week_start_date', unique=True),
    )


class MonthlySummary(Base):
    __tablename__ = "monthly_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)

    # Financial overview
    total_income_month = Column(Float, default=0.0)
    total_expenses_month = Column(Float, default=0.0)
    net_savings = Column(Float, default=0.0)
    largest_expense_category = Column(String, nullable=True)
    savings_rate = Column(Float, nullable=True)  # Percentage

    # Health overview
    avg_daily_calories = Column(Float, nullable=True)
    total_exercise_hours = Column(Float, default=0.0)
    avg_sleep_hours = Column(Float, nullable=True)
    health_score = Column(Float, nullable=True)

    # Work-life overview
    total_work_hours_month = Column(Float, default=0.0)
    work_life_balance_score = Column(Float, nullable=True)

    # Productivity overview
    total_tasks_completed_month = Column(Integer, default=0)
    productivity_score = Column(Float, nullable=True)

    # Overall
    overall_wellbeing_score = Column(Float, nullable=True)
    month_summary = Column(Text, nullable=True)
    goals_achieved = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="monthly_summaries")

    __table_args__ = (
        Index('ix_monthly_summaries_user_period', 'user_id', 'year', 'month', unique=True),
    )
