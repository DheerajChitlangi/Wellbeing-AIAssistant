# Database Schema Setup Guide

## Quick Start

### 1. Initialize the New Database Schema

```bash
cd backend
python -m app.core.init_db
```

This will create all 29 tables in your SQLite database.

---

## Detailed Setup Steps

### Step 1: Verify Dependencies

Ensure all required packages are installed:

```bash
cd backend
pip install -r requirements.txt
```

Required packages:
- `sqlalchemy==2.0.23`
- `fastapi==0.104.1`
- `pydantic==2.5.0`

### Step 2: Database Configuration

The database configuration is in `backend/app/core/config.py`:

```python
DATABASE_URL: str = "sqlite:///./wellbeing.db"
```

For production, update to PostgreSQL:

```python
DATABASE_URL: str = "postgresql://user:password@localhost/wellbeing_db"
```

### Step 3: Initialize Database

Run the initialization script:

```bash
python -m app.core.init_db
```

Expected output:
```
Database tables created successfully!
```

### Step 4: Verify Tables Created

Check that all tables exist:

```bash
# Using SQLite CLI
sqlite3 wellbeing.db
.tables

# Or using Python
python
>>> from app.core.database import engine
>>> from sqlalchemy import inspect
>>> inspector = inspect(engine)
>>> print(inspector.get_table_names())
```

Expected tables (29 total):
```
users
transactions, budgets, investments, debts, financial_goals
meals, nutrition_items, biometrics, exercises, sleep_records, symptoms
work_sessions, meetings, energy_levels, social_activities, boundaries, boundary_violations
tasks, deep_work_sessions, productivity_goals, distractions, flow_states, pomodoros
daily_summaries, weekly_summaries, monthly_summaries, correlations, recommendations
```

---

## Testing the Schema

### Create a Test User

```python
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()

# Create test user
user = User(
    email="test@example.com",
    username="testuser",
    hashed_password=get_password_hash("testpass123"),
    full_name="Test User"
)
db.add(user)
db.commit()
db.refresh(user)
print(f"Created user with ID: {user.id}")
```

### Test Each Pillar

#### 1. Financial Pillar

```python
from app.models.financial import Transaction, TransactionType, TransactionCategory
from datetime import datetime

# Create a transaction
transaction = Transaction(
    user_id=user.id,
    transaction_type=TransactionType.EXPENSE,
    category=TransactionCategory.FOOD,
    amount=25.50,
    description="Lunch at restaurant",
    transaction_date=datetime.now(),
    merchant="Local Cafe"
)
db.add(transaction)
db.commit()
print(f"Created transaction ID: {transaction.id}")
```

#### 2. Health Pillar

```python
from app.models.health import Meal, MealType, NutritionItem

# Create a meal with nutrition
meal = Meal(
    user_id=user.id,
    meal_type=MealType.BREAKFAST,
    name="Oatmeal Bowl",
    meal_time=datetime.now(),
    calories=350,
    rating=4
)
db.add(meal)
db.flush()  # Get meal.id

# Add nutrition items
nutrition = NutritionItem(
    meal_id=meal.id,
    food_name="Oatmeal",
    quantity=1,
    unit="cup",
    calories=150,
    protein=5,
    carbs=27,
    fat=3
)
db.add(nutrition)
db.commit()
print(f"Created meal ID: {meal.id}")
```

#### 3. Work-Life Pillar

```python
from app.models.work_life import WorkSession

# Create work session
work = WorkSession(
    user_id=user.id,
    start_time=datetime.now().replace(hour=9, minute=0),
    end_time=datetime.now().replace(hour=17, minute=0),
    duration_hours=8.0,
    work_type="coding",
    project="wellbeing-app",
    productivity_rating=8,
    stress_level=4
)
db.add(work)
db.commit()
print(f"Created work session ID: {work.id}")
```

#### 4. Productivity Pillar

```python
from app.models.productivity import Task, TaskStatus, TaskPriority

# Create a task
task = Task(
    user_id=user.id,
    title="Implement user authentication",
    description="Add JWT-based auth system",
    status=TaskStatus.IN_PROGRESS,
    priority=TaskPriority.HIGH,
    project="wellbeing-app",
    estimated_minutes=240,
    energy_required=7
)
db.add(task)
db.commit()
print(f"Created task ID: {task.id}")
```

#### 5. Analytics

```python
from app.models.analytics import DailySummary

# Create daily summary
summary = DailySummary(
    user_id=user.id,
    summary_date=datetime.now().date(),
    total_expenses=25.50,
    total_calories=350,
    work_hours=8.0,
    tasks_completed=3,
    overall_mood_score=7.5,
    wellbeing_score=75.0
)
db.add(summary)
db.commit()
print(f"Created daily summary ID: {summary.id}")
```

---

## Migration from Old Schema

If you have existing data in the old schema (mood_entries, activities, sleep_entries, goals), you can migrate:

### Option 1: Fresh Start (Recommended for Development)

```bash
# Backup old database
cp wellbeing.db wellbeing.db.backup

# Drop old tables and create new ones
python -m app.core.init_db drop_all_tables
python -m app.core.init_db init_db
```

### Option 2: Migrate Existing Data

```python
from app.core.database import SessionLocal
from app.models.wellbeing import MoodEntry  # Old model
from app.models.analytics import DailySummary  # New model

db = SessionLocal()

# Migrate mood entries to daily summaries
old_moods = db.query(MoodEntry).all()
for mood in old_moods:
    summary = DailySummary(
        user_id=mood.user_id,
        summary_date=mood.created_at.date(),
        overall_mood_score=mood.mood_score,
        energy_level_avg=mood.energy_level,
        stress_level_avg=mood.stress_level
    )
    db.add(summary)

db.commit()
print(f"Migrated {len(old_moods)} mood entries")
```

---

## Production Setup

### 1. Use PostgreSQL

Install PostgreSQL and update config:

```python
# config.py
DATABASE_URL: str = "postgresql://username:password@localhost:5432/wellbeing_prod"
```

Install PostgreSQL driver:
```bash
pip install psycopg2-binary
```

### 2. Use Alembic for Migrations

Initialize Alembic:

```bash
pip install alembic
alembic init alembic
```

Update `alembic/env.py`:

```python
from app.core.database import Base
from app.models.user import User
from app.models.financial import *
from app.models.health import *
from app.models.work_life import *
from app.models.productivity import *
from app.models.analytics import *

target_metadata = Base.metadata
```

Create initial migration:

```bash
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

### 3. Add Indexes

For production, add additional indexes based on query patterns:

```sql
-- Add indexes for common date range queries
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_meals_time ON meals(meal_time);
CREATE INDEX idx_sleep_date ON sleep_records(sleep_date);

-- Add indexes for aggregation queries
CREATE INDEX idx_tasks_completed ON tasks(user_id, status, completed_at);
CREATE INDEX idx_work_sessions_dates ON work_sessions(user_id, start_time, end_time);
```

---

## Backup and Restore

### Backup SQLite

```bash
# Create backup
sqlite3 wellbeing.db ".backup 'wellbeing_backup.db'"

# Or copy file
cp wellbeing.db backups/wellbeing_$(date +%Y%m%d).db
```

### Backup PostgreSQL

```bash
# Create backup
pg_dump -U username wellbeing_prod > wellbeing_backup.sql

# Restore backup
psql -U username wellbeing_prod < wellbeing_backup.sql
```

---

## Troubleshooting

### Issue: "No such table" errors

**Solution:** Run init_db script
```bash
python -m app.core.init_db
```

### Issue: "Foreign key constraint" errors

**Solution:** Ensure parent records exist before creating child records
```python
# Bad - user doesn't exist
transaction = Transaction(user_id=999, ...)  # Error!

# Good - verify user exists
user = db.query(User).filter(User.id == user_id).first()
if user:
    transaction = Transaction(user_id=user.id, ...)
```

### Issue: "Enum type not found" errors

**Solution:** Import enum classes
```python
from app.models.financial import TransactionType, TransactionCategory
```

### Issue: Import errors

**Solution:** Ensure PYTHONPATH includes backend directory
```bash
export PYTHONPATH="${PYTHONPATH}:/path/to/backend"
```

---

## Verification Checklist

- [ ] All 29 tables created
- [ ] User table has proper indexes
- [ ] Foreign key constraints working
- [ ] Enum types properly defined
- [ ] Timestamps auto-populate (created_at, updated_at)
- [ ] Cascade deletes working
- [ ] Can create test records in each pillar
- [ ] Relationships properly linked
- [ ] Queries using indexes (check with EXPLAIN)

---

## Next Steps

1. **Create API Endpoints** for each pillar
2. **Add Authentication** middleware to all protected routes
3. **Implement Analytics** algorithms for correlations
4. **Build Recommendation Engine** using correlation data
5. **Create Frontend Components** for each pillar
6. **Add Data Visualization** for insights
7. **Implement Batch Jobs** for daily/weekly summaries
8. **Add Tests** for models and relationships

---

## Performance Tips

1. **Use Bulk Inserts** for multiple records:
```python
db.bulk_save_objects([obj1, obj2, obj3])
db.commit()
```

2. **Use Eager Loading** for relationships:
```python
meals = db.query(Meal).options(
    joinedload(Meal.nutrition_items)
).all()
```

3. **Use Pagination** for large result sets:
```python
transactions = db.query(Transaction).limit(50).offset(page * 50).all()
```

4. **Create Indexes** for frequently queried columns:
```python
Index('idx_custom', Table.column1, Table.column2)
```

5. **Use Connection Pooling** in production:
```python
engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=40)
```

---

## Support

For issues or questions:
- Check `DATABASE_SCHEMA.md` for detailed table documentation
- Review `SCHEMA_RELATIONSHIPS.md` for relationship diagrams
- Consult SQLAlchemy docs: https://docs.sqlalchemy.org/
