from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Financial Relationships
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    investments = relationship("Investment", back_populates="user", cascade="all, delete-orphan")
    debts = relationship("Debt", back_populates="user", cascade="all, delete-orphan")
    financial_goals = relationship("FinancialGoal", back_populates="user", cascade="all, delete-orphan")

    # Health Relationships
    meals = relationship("Meal", back_populates="user", cascade="all, delete-orphan")
    biometrics = relationship("Biometric", back_populates="user", cascade="all, delete-orphan")
    exercises = relationship("Exercise", back_populates="user", cascade="all, delete-orphan")
    sleep_records = relationship("Sleep", back_populates="user", cascade="all, delete-orphan")
    symptoms = relationship("Symptom", back_populates="user", cascade="all, delete-orphan")

    # Work-Life Relationships
    work_sessions = relationship("WorkSession", back_populates="user", cascade="all, delete-orphan")
    meetings = relationship("Meeting", back_populates="user", cascade="all, delete-orphan")
    energy_levels = relationship("EnergyLevel", back_populates="user", cascade="all, delete-orphan")
    social_activities = relationship("SocialActivity", back_populates="user", cascade="all, delete-orphan")
    boundaries = relationship("Boundary", back_populates="user", cascade="all, delete-orphan")

    # Productivity Relationships
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    deep_work_sessions = relationship("DeepWorkSession", back_populates="user", cascade="all, delete-orphan")
    productivity_goals = relationship("ProductivityGoal", back_populates="user", cascade="all, delete-orphan")
    distractions = relationship("Distraction", back_populates="user", cascade="all, delete-orphan")
    flow_states = relationship("FlowState", back_populates="user", cascade="all, delete-orphan")
    pomodoros = relationship("Pomodoro", back_populates="user", cascade="all, delete-orphan")

    # Analytics Relationships
    daily_summaries = relationship("DailySummary", back_populates="user", cascade="all, delete-orphan")
    weekly_summaries = relationship("WeeklySummary", back_populates="user", cascade="all, delete-orphan")
    monthly_summaries = relationship("MonthlySummary", back_populates="user", cascade="all, delete-orphan")
    correlations = relationship("Correlation", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
