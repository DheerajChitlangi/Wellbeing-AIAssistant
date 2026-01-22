"""
Database initialization script
Imports all models to ensure they are registered with SQLAlchemy
"""

from app.core.database import Base, engine

# Import all models to register them with SQLAlchemy
from app.models.user import User

# Financial models
from app.models.financial import (
    Transaction,
    Budget,
    Investment,
    Debt,
    FinancialGoal,
)

# Health models
from app.models.health import (
    Meal,
    NutritionItem,
    Biometric,
    Exercise,
    Sleep,
    Symptom,
)

# Work-Life models
from app.models.work_life import (
    WorkSession,
    Meeting,
    EnergyLevel,
    SocialActivity,
    Boundary,
    BoundaryViolation,
)

# Productivity models
from app.models.productivity import (
    Task,
    DeepWorkSession,
    ProductivityGoal,
    Distraction,
    FlowState,
    Pomodoro,
)

# Analytics models
from app.models.analytics import (
    DailySummary,
    WeeklySummary,
    MonthlySummary,
    Correlation,
    Recommendation,
)


def init_db():
    """
    Create all database tables
    """
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


def drop_all_tables():
    """
    Drop all database tables (use with caution!)
    """
    Base.metadata.drop_all(bind=engine)
    print("All database tables dropped!")


if __name__ == "__main__":
    init_db()
