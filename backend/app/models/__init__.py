# Import all models to ensure SQLAlchemy can resolve relationships
from app.models.user import User
from app.models.wellbeing import MoodEntry, Activity, SleepEntry, Goal
from app.models.financial import (
    Transaction,
    Budget,
    Investment,
    Debt,
    FinancialGoal,
)
from app.models.health import (
    Meal,
    NutritionItem,
    Biometric,
    Exercise,
    Sleep,
    Symptom,
)
from app.models.work_life import (
    WorkSession,
    Meeting,
    EnergyLevel,
    SocialActivity,
    Boundary,
    BoundaryViolation,
)
from app.models.productivity import (
    Task,
    DeepWorkSession,
    ProductivityGoal,
    Distraction,
    FlowState,
    Pomodoro,
)
from app.models.analytics import (
    DailySummary,
    WeeklySummary,
    MonthlySummary,
    Correlation,
    Recommendation,
)

__all__ = [
    "User",
    "MoodEntry",
    "Activity",
    "SleepEntry",
    "Goal",
    "Transaction",
    "Budget",
    "Investment",
    "Debt",
    "FinancialGoal",
    "Meal",
    "NutritionItem",
    "Biometric",
    "Exercise",
    "Sleep",
    "Symptom",
    "WorkSession",
    "Meeting",
    "EnergyLevel",
    "SocialActivity",
    "Boundary",
    "BoundaryViolation",
    "Task",
    "DeepWorkSession",
    "ProductivityGoal",
    "Distraction",
    "FlowState",
    "Pomodoro",
    "DailySummary",
    "WeeklySummary",
    "MonthlySummary",
    "Correlation",
    "Recommendation",
]
