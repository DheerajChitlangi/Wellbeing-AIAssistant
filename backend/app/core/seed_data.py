"""
Sample Data Seeder for Demo/Testing Purposes
Run with: python -m app.core.seed_data
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.financial import Transaction, Budget, FinancialGoal
from app.models.health import Meal, NutritionItem, Biometric, Exercise
from app.models.wellbeing import MoodEntry, SleepEntry, Activity
from app.models.work_life import WorkSession, Meeting
from app.models.productivity import Task, DeepWorkSession
from app.models.preferences import UserPreferences
import random


def create_demo_user(db: Session) -> User:
    """Create a demo user"""
    # Check if demo user exists
    demo_user = db.query(User).filter(User.email == "demo@wellbeing.com").first()

    if demo_user:
        print("Demo user already exists")
        return demo_user

    user = User(
        email="demo@wellbeing.com",
        username="demo",
        hashed_password=get_password_hash("demo123"),
        full_name="Demo User",
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    print(f"Created demo user: {user.username}")
    return user


def seed_financial_data(db: Session, user_id: int):
    """Seed financial transactions, budgets, and goals"""
    print("Seeding financial data...")

    # Create transactions for the past 30 days
    categories = ["food", "transportation", "entertainment", "housing", "utilities", "healthcare", "shopping"]
    transaction_types = ["expense", "income"]

    for i in range(30):
        date = datetime.utcnow() - timedelta(days=i)

        # Add 2-5 transactions per day
        for _ in range(random.randint(2, 5)):
            trans_type = random.choice(transaction_types)

            if trans_type == "income":
                amount = random.uniform(500, 5000)
                category = "salary"
            else:
                amount = random.uniform(5, 500)
                category = random.choice(categories)

            transaction = Transaction(
                user_id=user_id,
                transaction_type=trans_type,
                category=category,
                amount=amount,
                description=f"Sample {category} {trans_type}",
                transaction_date=date,
                merchant=f"{category.title()} Store"
            )
            db.add(transaction)

    # Create budgets
    budgets_data = [
        {"category": "food", "amount_limit": 500.0},
        {"category": "transportation", "amount_limit": 300.0},
        {"category": "entertainment", "amount_limit": 200.0},
        {"category": "shopping", "amount_limit": 400.0}
    ]

    for budget_data in budgets_data:
        budget = Budget(
            user_id=user_id,
            category=budget_data["category"],
            amount_limit=budget_data["amount_limit"],
            period="monthly",
            start_date=datetime.utcnow().replace(day=1),
            is_active=True,
            alert_threshold=0.8
        )
        db.add(budget)

    # Create financial goals
    goals_data = [
        {"title": "Emergency Fund", "target_amount": 10000.0, "current_amount": 3500.0},
        {"title": "Vacation Savings", "target_amount": 5000.0, "current_amount": 1200.0}
    ]

    for goal_data in goals_data:
        goal = FinancialGoal(
            user_id=user_id,
            title=goal_data["title"],
            target_amount=goal_data["target_amount"],
            current_amount=goal_data["current_amount"],
            target_date=datetime.utcnow() + timedelta(days=365)
        )
        db.add(goal)

    db.commit()
    print("Financial data seeded successfully")


def seed_health_data(db: Session, user_id: int):
    """Seed health data (meals, biometrics, exercise)"""
    print("Seeding health data...")

    # Seed biometrics for past 30 days
    for i in range(30):
        date = datetime.utcnow() - timedelta(days=i)

        biometric = Biometric(
            user_id=user_id,
            measurement_date=date,
            weight=75.0 + random.uniform(-2, 2),
            height=175.0,
            blood_pressure_systolic=120 + random.randint(-10, 10),
            blood_pressure_diastolic=80 + random.randint(-5, 5),
            heart_rate=70 + random.randint(-10, 10),
            bmi=24.5 + random.uniform(-1, 1)
        )
        db.add(biometric)

    # Seed meals for past 7 days
    meal_types = ["breakfast", "lunch", "dinner", "snack"]

    for i in range(7):
        date = datetime.utcnow() - timedelta(days=i)

        for meal_type in meal_types:
            if meal_type == "snack" and random.random() > 0.5:
                continue  # Skip some snacks

            meal_time = date.replace(
                hour=8 if meal_type == "breakfast" else 12 if meal_type == "lunch" else 18 if meal_type == "dinner" else 15
            )

            meal = Meal(
                user_id=user_id,
                meal_type=meal_type,
                name=f"Sample {meal_type.title()}",
                meal_time=meal_time,
                calories=300 + random.randint(0, 500),
                rating=random.randint(3, 5)
            )
            db.add(meal)

    # Seed exercise for past 14 days
    exercise_types = ["running", "cycling", "swimming", "gym", "yoga", "walking"]

    for i in range(14):
        date = datetime.utcnow() - timedelta(days=i)

        # 70% chance of exercise per day
        if random.random() < 0.7:
            exercise_type = random.choice(exercise_types)

            exercise = Exercise(
                user_id=user_id,
                exercise_type=exercise_type,
                name=f"{exercise_type.title()} Session",
                duration_minutes=random.randint(20, 60),
                intensity=random.randint(5, 9),
                calories_burned=random.randint(150, 500),
                exercise_date=date
            )
            db.add(exercise)

    db.commit()
    print("Health data seeded successfully")


def seed_wellbeing_data(db: Session, user_id: int):
    """Seed wellbeing data (mood, sleep, activities)"""
    print("Seeding wellbeing data...")

    # Seed mood entries for past 30 days
    for i in range(30):
        date = datetime.utcnow() - timedelta(days=i)

        mood = MoodEntry(
            user_id=user_id,
            mood_score=random.randint(1, 10),
            energy_level=random.randint(1, 10),
            stress_level=random.randint(1, 10),
            notes=f"Sample mood note for {date.strftime('%Y-%m-%d')}"
        )
        db.add(mood)

    # Seed sleep entries for past 30 days
    for i in range(30):
        date = datetime.utcnow() - timedelta(days=i)

        sleep = SleepEntry(
            user_id=user_id,
            sleep_hours=7.0 + random.uniform(-2, 2),
            sleep_quality=random.randint(5, 10),
            notes="Sample sleep entry"
        )
        db.add(sleep)

    # Seed activities for past 14 days
    activities = ["reading", "meditation", "socializing", "hobby", "gaming", "music"]

    for i in range(14):
        date = datetime.utcnow() - timedelta(days=i)

        for _ in range(random.randint(1, 3)):
            activity = Activity(
                user_id=user_id,
                activity_type=random.choice(activities),
                duration_minutes=random.randint(15, 120),
                intensity="moderate",
                notes=f"Sample {random.choice(activities)} activity"
            )
            db.add(activity)

    db.commit()
    print("Wellbeing data seeded successfully")


def seed_work_life_data(db: Session, user_id: int):
    """Seed work-life balance data"""
    print("Seeding work-life data...")

    # Seed work sessions for past 14 days
    for i in range(14):
        # Skip weekends
        date = datetime.utcnow() - timedelta(days=i)
        if date.weekday() >= 5:
            continue

        # 2-4 work sessions per day
        for session_num in range(random.randint(2, 4)):
            start_hour = 9 + (session_num * 2)
            start_time = date.replace(hour=start_hour, minute=0)
            duration = random.uniform(1.5, 3.0)

            work_session = WorkSession(
                user_id=user_id,
                start_time=start_time,
                end_time=start_time + timedelta(hours=duration),
                duration_hours=duration,
                work_type="focused_work",
                productivity_rating=random.randint(6, 10),
                stress_level=random.randint(1, 10)
            )
            db.add(work_session)

        # 1-3 meetings per day
        for _ in range(random.randint(1, 3)):
            meeting_hour = random.randint(10, 16)
            meeting_time = date.replace(hour=meeting_hour, minute=0)

            meeting = Meeting(
                user_id=user_id,
                title=f"Team Meeting {random.randint(1, 100)}",
                meeting_date=meeting_time,
                duration_hours=random.uniform(0.5, 2.0),
                attendee_count=random.randint(2, 8),
                productivity_rating=random.randint(5, 9),
                is_mandatory=random.choice([True, False])
            )
            db.add(meeting)

    db.commit()
    print("Work-life data seeded successfully")


def seed_productivity_data(db: Session, user_id: int):
    """Seed productivity data (tasks, deep work sessions)"""
    print("Seeding productivity data...")

    # Seed tasks for past 30 days
    task_statuses = ["pending", "in_progress", "completed", "cancelled"]
    priorities = ["low", "medium", "high"]

    for i in range(30):
        date = datetime.utcnow() - timedelta(days=i)

        # 3-8 tasks per day
        for task_num in range(random.randint(3, 8)):
            status = random.choice(task_statuses)

            task = Task(
                user_id=user_id,
                title=f"Task {task_num + 1} for {date.strftime('%Y-%m-%d')}",
                description=f"Sample task description",
                status=status,
                priority=random.choice(priorities),
                estimated_duration=random.randint(15, 180),
                actual_duration=random.randint(10, 200) if status == "completed" else None,
                due_date=date + timedelta(days=random.randint(1, 7)),
                completed_at=date if status == "completed" else None,
                created_at=date - timedelta(days=1)
            )
            db.add(task)

    # Seed deep work sessions for past 14 days
    for i in range(14):
        date = datetime.utcnow() - timedelta(days=i)

        # 1-2 deep work sessions per day
        for _ in range(random.randint(1, 2)):
            start_hour = random.randint(9, 15)
            start_time = date.replace(hour=start_hour, minute=0)
            duration = random.uniform(1.0, 3.0)

            deep_work = DeepWorkSession(
                user_id=user_id,
                start_time=start_time,
                end_time=start_time + timedelta(hours=duration),
                duration_hours=duration,
                focus_score=random.randint(7, 10),
                task_description=f"Deep work on project",
                distraction_count=random.randint(0, 5)
            )
            db.add(deep_work)

    db.commit()
    print("Productivity data seeded successfully")


def seed_preferences(db: Session, user_id: int):
    """Seed user preferences"""
    print("Seeding user preferences...")

    preferences = UserPreferences(
        user_id=user_id,
        enable_email_notifications=True,
        enable_push_notifications=True,
        daily_briefing_enabled=True,
        daily_briefing_time="08:00",
        weekly_review_enabled=True,
        target_sleep_hours=8.0,
        target_exercise_minutes=30,
        target_work_hours=8.0,
        target_deep_work_hours=4.0,
        target_savings_rate=20.0,
        theme="light",
        currency="USD",
        timezone="UTC"
    )

    db.add(preferences)
    db.commit()
    print("User preferences seeded successfully")


def seed_all_data():
    """Seed all sample data"""
    print("\n" + "="*50)
    print("WELLBEING COPILOT - DATA SEEDER")
    print("="*50 + "\n")

    db = SessionLocal()

    try:
        # Create demo user
        demo_user = create_demo_user(db)

        # Seed all data
        seed_financial_data(db, demo_user.id)
        seed_health_data(db, demo_user.id)
        seed_wellbeing_data(db, demo_user.id)
        seed_work_life_data(db, demo_user.id)
        seed_productivity_data(db, demo_user.id)
        seed_preferences(db, demo_user.id)

        print("\n" + "="*50)
        print("DATA SEEDING COMPLETED SUCCESSFULLY!")
        print("="*50)
        print("\nDemo Account:")
        print(f"  Email: demo@wellbeing.com")
        print(f"  Password: demo123")
        print("\nYou can now login and explore the application with sample data.")

    except Exception as e:
        print(f"\nError seeding data: {str(e)}")
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_all_data()
