# Wellbeing Copilot - Database Schema Documentation

## Overview

This document describes the comprehensive database schema for the Wellbeing Copilot application, which tracks four key pillars of wellbeing: Financial, Health/Diet, Work-Life Balance, and Productivity.

## Database Technology

- **Database**: SQLite (development), PostgreSQL recommended for production
- **ORM**: SQLAlchemy
- **Validation**: Pydantic schemas

## Table Structure

### Core Tables

#### Users
Central user authentication and profile table.

**Columns:**
- `id` (PK): Integer, auto-increment
- `email`: String, unique, indexed
- `username`: String, unique, indexed
- `hashed_password`: String
- `full_name`: String, nullable
- `is_active`: Boolean, default True
- `is_superuser`: Boolean, default False
- `created_at`: DateTime with timezone
- `updated_at`: DateTime with timezone

**Relationships:**
- One-to-many with all other tables via `user_id`

---

## 1. Financial Wellbeing Pillar

### Transactions
Tracks all financial transactions (income, expenses, transfers).

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer → users.id
- `transaction_type`: Enum (income, expense, transfer)
- `category`: Enum (salary, housing, food, etc.)
- `amount`: Float
- `description`: Text, nullable
- `transaction_date`: DateTime, indexed
- `merchant`: String, nullable
- `tags`: String (JSON), nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_transactions_user_date`: Composite (user_id, transaction_date)
- `ix_transactions_user_category`: Composite (user_id, category)

**Common Queries:**
```python
# Get user's expenses for current month
transactions.filter(
    user_id=user_id,
    transaction_type='expense',
    transaction_date >= start_of_month
)

# Get spending by category
transactions.filter(user_id=user_id).group_by('category')
```

---

### Budgets
Budget limits and tracking for spending categories.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer → users.id
- `category`: Enum
- `amount_limit`: Float
- `period`: String (monthly, weekly, yearly)
- `start_date`, `end_date`: DateTime
- `is_active`: Integer (0/1)
- `alert_threshold`: Float (0-1), default 0.8
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_budgets_user_active`: Composite (user_id, is_active)

---

### Investments
Investment portfolio tracking.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `investment_type`: Enum (stocks, bonds, crypto, etc.)
- `name`: String
- `symbol`: String, nullable (ticker/symbol)
- `quantity`: Float
- `purchase_price`: Float
- `current_price`: Float, nullable
- `purchase_date`: DateTime
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_investments_user_type`: Composite (user_id, investment_type)

---

### Debts
Debt tracking and payoff planning.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `debt_type`: Enum (credit_card, mortgage, etc.)
- `name`: String
- `original_amount`: Float
- `current_balance`: Float
- `interest_rate`: Float
- `minimum_payment`: Float
- `due_date`: Integer (day of month)
- `start_date`: DateTime
- `target_payoff_date`: DateTime, nullable
- `is_active`: Integer
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_debts_user_active`: Composite (user_id, is_active)

---

### Financial Goals
Financial goal setting and tracking.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `title`: String
- `description`: Text, nullable
- `target_amount`: Float
- `current_amount`: Float, default 0.0
- `target_date`: DateTime, nullable
- `category`: String, nullable
- `priority`: Integer (1-5)
- `is_completed`: Integer (0/1)
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_financial_goals_user_active`: Composite (user_id, is_completed)

---

## 2. Health/Diet Pillar

### Meals
Meal logging with detailed information.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `meal_type`: Enum (breakfast, lunch, dinner, snack)
- `name`: String
- `description`: Text, nullable
- `meal_time`: DateTime, indexed
- `calories`: Integer, nullable
- `rating`: Integer (1-5), nullable
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Relationships:**
- One-to-many with NutritionItems

**Indexes:**
- `ix_meals_user_time`: Composite (user_id, meal_time)

---

### Nutrition Items
Detailed nutrition breakdown for meals.

**Columns:**
- `id` (PK): Integer
- `meal_id` (FK): Integer → meals.id
- `food_name`: String
- `quantity`: Float
- `unit`: String (grams, oz, cups)
- `calories`: Integer, nullable
- `protein`, `carbs`, `fat`, `fiber`, `sugar`, `sodium`: Float, nullable
- `created_at`: DateTime

**Relationships:**
- Many-to-one with Meal

---

### Biometrics
Health measurements and vital signs.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `measurement_date`: DateTime, indexed
- `weight`, `height`, `bmi`: Float, nullable
- `body_fat_percentage`, `muscle_mass`: Float, nullable
- `blood_pressure_systolic`, `blood_pressure_diastolic`: Integer, nullable
- `heart_rate`: Integer, nullable
- `blood_glucose`: Float, nullable
- `temperature`: Float, nullable
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_biometrics_user_date`: Composite (user_id, measurement_date)

---

### Exercises
Physical activity tracking.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `exercise_type`: Enum (cardio, strength, yoga, etc.)
- `name`: String
- `duration_minutes`: Integer
- `calories_burned`: Integer, nullable
- `intensity`: Integer (1-10), nullable
- `distance`: Float, nullable
- `heart_rate_avg`, `heart_rate_max`: Integer, nullable
- `notes`: Text, nullable
- `exercise_date`: DateTime, indexed
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_exercises_user_date`: Composite (user_id, exercise_date)
- `ix_exercises_user_type`: Composite (user_id, exercise_type)

---

### Sleep Records
Sleep tracking and quality assessment.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `sleep_date`: DateTime, indexed
- `bedtime`, `wake_time`: DateTime
- `total_hours`: Float
- `deep_sleep_hours`, `rem_sleep_hours`, `light_sleep_hours`: Float, nullable
- `awake_time_hours`: Float, nullable
- `sleep_quality`: Integer (1-10)
- `dreams`: Text, nullable
- `interruptions`: Integer, default 0
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_sleep_user_date`: Composite (user_id, sleep_date)

---

### Symptoms
Health symptom tracking.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `symptom_name`: String, indexed
- `severity`: Enum (mild, moderate, severe)
- `body_part`: String, nullable
- `description`: Text, nullable
- `started_at`: DateTime
- `ended_at`: DateTime, nullable
- `triggers`, `treatments`: Text (JSON), nullable
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_symptoms_user_name`: Composite (user_id, symptom_name)
- `ix_symptoms_user_started`: Composite (user_id, started_at)

---

## 3. Work-Life Balance Pillar

### Work Sessions
Work time tracking with productivity metrics.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `start_time`, `end_time`: DateTime
- `duration_hours`: Float
- `work_type`: String, nullable (coding, meetings, emails)
- `project`: String, nullable
- `is_overtime`: Boolean
- `location`: String, nullable (office, home, hybrid)
- `breaks_taken`: Integer, default 0
- `productivity_rating`: Integer (1-10), nullable
- `stress_level`: Integer (1-10), nullable
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_work_sessions_user_date`: Composite (user_id, start_time)

---

### Meetings
Meeting tracking and effectiveness.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `title`: String
- `meeting_type`: Enum (one_on_one, team, client, standup, etc.)
- `start_time`, `end_time`: DateTime, indexed
- `duration_minutes`: Integer
- `attendees_count`: Integer, nullable
- `was_productive`: Boolean, nullable
- `could_have_been_email`: Boolean, nullable
- `energy_before`, `energy_after`: Integer (1-10), nullable
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_meetings_user_date`: Composite (user_id, start_time)
- `ix_meetings_user_type`: Composite (user_id, meeting_type)

---

### Energy Levels
Energy and mental state tracking.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `timestamp`: DateTime, indexed
- `energy_score`: Integer (1-10)
- `mental_clarity`: Integer (1-10), nullable
- `physical_energy`: Integer (1-10), nullable
- `emotional_state`: Integer (1-10), nullable
- `context`: String, nullable (work, personal, social)
- `factors`: Text (JSON), nullable
- `notes`: Text, nullable
- `created_at`: DateTime

**Indexes:**
- `ix_energy_levels_user_timestamp`: Composite (user_id, timestamp)

---

### Social Activities
Social interaction tracking.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `activity_type`: Enum (family, friends, romantic, etc.)
- `title`: String
- `description`: Text, nullable
- `start_time`, `end_time`: DateTime
- `duration_hours`: Float
- `people_count`: Integer, nullable
- `enjoyment_rating`: Integer (1-10), nullable
- `energy_before`, `energy_after`: Integer (1-10), nullable
- `location`: String, nullable
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_social_activities_user_date`: Composite (user_id, start_time)
- `ix_social_activities_user_type`: Composite (user_id, activity_type)

---

### Boundaries
Work-life boundary definitions.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `boundary_type`: Enum (work_hours, communication, workload, etc.)
- `title`: String
- `description`: Text
- `rule`: Text
- `is_active`: Boolean
- `start_date`, `end_date`: DateTime
- `success_count`, `violation_count`: Integer
- `importance`: Integer (1-5)
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Relationships:**
- One-to-many with BoundaryViolations

**Indexes:**
- `ix_boundaries_user_active`: Composite (user_id, is_active)
- `ix_boundaries_user_type`: Composite (user_id, boundary_type)

---

### Boundary Violations
Tracking when boundaries are crossed.

**Columns:**
- `id` (PK): Integer
- `boundary_id` (FK): Integer → boundaries.id
- `violation_date`: DateTime, indexed
- `circumstances`: Text
- `impact`: Integer (1-10)
- `was_necessary`: Boolean, nullable
- `lesson_learned`: Text, nullable
- `created_at`: DateTime

**Relationships:**
- Many-to-one with Boundary

---

## 4. Productivity Pillar

### Tasks
Task management and tracking.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `title`: String
- `description`: Text, nullable
- `status`: Enum (todo, in_progress, blocked, completed, cancelled), indexed
- `priority`: Enum (low, medium, high, urgent), indexed
- `project`: String, nullable, indexed
- `category`: String, nullable
- `estimated_minutes`, `actual_minutes`: Integer, nullable
- `due_date`, `completed_at`: DateTime, nullable
- `parent_task_id` (FK): Integer → tasks.id, nullable (for subtasks)
- `tags`: Text (JSON), nullable
- `energy_required`: Integer (1-10), nullable
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Relationships:**
- Self-referential: parent/subtasks
- One-to-many with DeepWorkSessions, Distractions, FlowStates

**Indexes:**
- `ix_tasks_user_status`: Composite (user_id, status)
- `ix_tasks_user_priority`: Composite (user_id, priority)
- `ix_tasks_user_due`: Composite (user_id, due_date)
- `ix_tasks_user_project`: Composite (user_id, project)

---

### Deep Work Sessions
Focused work session tracking.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `start_time`, `end_time`: DateTime
- `duration_minutes`: Integer
- `task_id` (FK): Integer → tasks.id, nullable
- `project`: String, nullable
- `focus_score`: Integer (1-10)
- `interruptions`: Integer, default 0
- `context`: String, nullable
- `energy_before`, `energy_after`: Integer (1-10), nullable
- `output_quality`: Integer (1-10), nullable
- `was_planned`: Boolean, default False
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_deep_work_user_date`: Composite (user_id, start_time)

---

### Productivity Goals
Goal setting for productivity metrics.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `title`: String
- `description`: Text, nullable
- `goal_type`: String (daily, weekly, monthly, yearly, project)
- `metric`: String (tasks_completed, deep_work_hours, etc.)
- `target_value`, `current_value`: Float
- `unit`: String (tasks, hours, etc.)
- `start_date`, `end_date`: DateTime
- `is_active`, `is_completed`: Boolean
- `priority`: Integer (1-5)
- `notes`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_productivity_goals_user_active`: Composite (user_id, is_active)
- `ix_productivity_goals_user_type`: Composite (user_id, goal_type)

---

### Distractions
Distraction tracking and analysis.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `distraction_type`: Enum (social_media, email, chat, phone, etc.), indexed
- `description`: Text
- `timestamp`: DateTime, indexed
- `duration_minutes`: Integer, nullable
- `impact`: Integer (1-10)
- `deep_work_session_id` (FK): Integer, nullable
- `task_id` (FK): Integer, nullable
- `was_avoidable`: Boolean, nullable
- `prevention_strategy`: Text, nullable
- `created_at`: DateTime

**Indexes:**
- `ix_distractions_user_timestamp`: Composite (user_id, timestamp)
- `ix_distractions_user_type`: Composite (user_id, distraction_type)

---

### Flow States
Tracking flow state experiences.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `start_time`, `end_time`: DateTime
- `duration_minutes`: Integer
- `deep_work_session_id` (FK): Integer, nullable
- `task_id` (FK): Integer, nullable
- `activity`: String
- `intensity`, `challenge_level`, `skill_level`: Integer (1-10)
- `conditions`, `triggers`: Text (JSON), nullable
- `output_description`: Text, nullable
- `satisfaction`: Integer (1-10), nullable
- `notes`: Text, nullable
- `created_at`: DateTime

**Indexes:**
- `ix_flow_states_user_time`: Composite (user_id, start_time)

---

### Pomodoros
Pomodoro technique tracking.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `task_id` (FK): Integer, nullable
- `start_time`, `end_time`: DateTime
- `duration_minutes`: Integer, default 25
- `was_completed`: Boolean, default True
- `was_interrupted`: Boolean, default False
- `focus_rating`: Integer (1-10), nullable
- `notes`: Text, nullable
- `created_at`: DateTime

**Indexes:**
- `ix_pomodoros_user_time`: Composite (user_id, start_time)

---

## 5. Analytics & Insights

### Daily Summaries
Aggregated daily metrics across all pillars.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `summary_date`: DateTime, indexed

**Financial Metrics:**
- `total_income`, `total_expenses`, `net_cashflow`: Float
- `budget_adherence_score`: Float (0-100%), nullable

**Health Metrics:**
- `total_calories`, `total_protein`, `total_carbs`, `total_fat`: Float, nullable
- `water_intake`: Float, nullable
- `exercise_minutes`: Integer
- `steps`: Integer, nullable
- `sleep_hours`, `sleep_quality_avg`: Float, nullable
- `symptom_count`: Integer

**Work-Life Metrics:**
- `work_hours`, `meeting_hours`, `social_hours`: Float
- `boundary_violations`: Integer
- `energy_level_avg`, `stress_level_avg`: Float, nullable

**Productivity Metrics:**
- `tasks_completed`, `tasks_created`: Integer
- `deep_work_hours`, `flow_state_hours`: Float
- `distraction_count`: Integer
- `focus_score_avg`: Float, nullable
- `pomodoros_completed`: Integer

**Overall Metrics:**
- `overall_mood_score`: Float (1-10), nullable
- `wellbeing_score`: Float (0-100), nullable (composite score)

**Additional:**
- `notes`: Text, nullable
- `highlights`, `lowlights`: Text (JSON arrays), nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_daily_summaries_user_date`: Composite unique (user_id, summary_date)

---

### Weekly Summaries
Aggregated weekly metrics.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `week_start_date`, `week_end_date`: DateTime
- Aggregated metrics similar to daily summaries
- `wellbeing_trend`: String (improving, stable, declining), nullable
- `top_achievements`, `areas_for_improvement`: Text (JSON), nullable
- `insights`: Text, nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_weekly_summaries_user_week`: Composite unique (user_id, week_start_date)

---

### Monthly Summaries
Aggregated monthly metrics.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `month` (1-12), `year`: Integer
- Aggregated high-level metrics
- `savings_rate`: Float (percentage), nullable
- `month_summary`: Text, nullable
- `goals_achieved`: Integer
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_monthly_summaries_user_period`: Composite unique (user_id, year, month)

---

### Correlations
Discovered patterns and relationships in data.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `factor_a`, `factor_b`: String, indexed (e.g., "sleep_hours", "productivity_score")
- `correlation_coefficient`: Float (-1 to 1)
- `strength`: Enum (weak, moderate, strong, very_strong)
- `p_value`: Float, nullable (statistical significance)
- `sample_size`: Integer
- `period_start`, `period_end`: DateTime
- `description`: Text
- `insight`: Text (human-readable explanation)
- `confidence`: Float (0-100%)
- `is_actionable`: Boolean
- `is_causal`: Boolean (likely causal vs just correlational)
- `tags`: Text (JSON), nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_correlations_user_factors`: Composite (user_id, factor_a, factor_b)

**Example Correlations:**
- Sleep hours ↔ Productivity score
- Exercise frequency ↔ Mood score
- Meeting hours ↔ Deep work hours
- Spending patterns ↔ Stress levels

---

### Recommendations
AI-generated personalized suggestions.

**Columns:**
- `id` (PK): Integer
- `user_id` (FK): Integer
- `title`: String
- `description`: Text
- `category`: String, indexed (financial, health, work_life, productivity)
- `subcategory`: String, nullable
- `priority`: Enum (low, medium, high, critical), indexed
- `status`: Enum (pending, viewed, accepted, dismissed, completed), indexed
- `based_on`: Text (what data/correlation led to this)
- `confidence`: Float (0-100%)
- `expected_impact`: Text, nullable
- `actionable_steps`: Text (JSON array of steps)
- `estimated_effort`: String, nullable (low, medium, high)
- `estimated_time`: String, nullable ("5 minutes", "1 week")
- `correlation_id` (FK): Integer → correlations.id, nullable
- `related_goal_id`: Integer, nullable
- `viewed_at`, `accepted_at`, `dismissed_at`, `completed_at`: DateTime, nullable
- `dismissal_reason`, `completion_notes`: Text, nullable
- `was_helpful`: Boolean, nullable
- `effectiveness_rating`: Integer (1-5), nullable
- `user_feedback`: Text, nullable
- `expires_at`: DateTime, nullable
- `created_at`, `updated_at`: DateTime

**Indexes:**
- `ix_recommendations_user_status`: Composite (user_id, status)
- `ix_recommendations_user_category`: Composite (user_id, category)
- `ix_recommendations_user_priority`: Composite (user_id, priority)

**Example Recommendations:**
- "Increase sleep by 1 hour to improve productivity by 15%"
- "Schedule deep work sessions before 10 AM when energy is highest"
- "Reduce coffee shop spending to reach emergency fund goal faster"

---

## Relationships Summary

### User Relationships
- **1-to-Many:** All tables have user_id foreign key
- **Cascade:** All child records deleted when user is deleted

### Cross-Pillar Relationships
- **Tasks ↔ DeepWorkSessions:** Track which deep work relates to which tasks
- **Tasks ↔ Pomodoros:** Link pomodoro sessions to tasks
- **Boundaries ↔ BoundaryViolations:** Track boundary compliance
- **Meals ↔ NutritionItems:** Detailed nutrition breakdown
- **Tasks ↔ Tasks:** Hierarchical subtasks (self-referential)
- **Correlations ↔ Recommendations:** Link recommendations to discovered patterns

---

## Query Optimization

### Common Query Patterns

```python
# Get user's daily summary
DailySummary.query.filter(
    user_id=user_id,
    summary_date=target_date
).first()

# Get recent correlations for user
Correlation.query.filter(
    user_id=user_id,
    confidence >= 70
).order_by(created_at.desc()).limit(10)

# Get active recommendations
Recommendation.query.filter(
    user_id=user_id,
    status='pending',
    priority.in_(['high', 'critical'])
).order_by(priority.desc(), created_at.desc())

# Get tasks due this week
Task.query.filter(
    user_id=user_id,
    status.in_(['todo', 'in_progress']),
    due_date.between(week_start, week_end)
).order_by(priority.desc(), due_date)
```

---

## Data Validation

All schemas include Pydantic validation:
- **Range checks:** Ratings (1-10), percentages (0-100)
- **Positive values:** Amounts, durations, quantities
- **Enum validation:** All categorical fields
- **Date validation:** No future dates for historical data
- **Required fields:** Essential data points enforced

---

## Migration Strategy

To update existing database:

```bash
# Method 1: Simple (drops all data)
python -m app.core.init_db drop_all_tables
python -m app.core.init_db init_db

# Method 2: Using Alembic (recommended for production)
alembic revision --autogenerate -m "Add comprehensive schema"
alembic upgrade head
```

---

## Database Size Estimates

For 1 user tracking daily for 1 year:

- **Transactions:** ~1,000 records (3-4/day)
- **Meals:** ~1,460 records (4/day)
- **Biometrics:** ~365 records (1/day)
- **Tasks:** ~2,000 records
- **Deep Work:** ~500 records
- **Daily Summaries:** 365 records
- **Correlations:** ~50 records
- **Recommendations:** ~100 records

**Total estimated:** ~10,000-15,000 records/year/user
**Storage:** ~50-100 MB/year/user (SQLite)

---

## Best Practices

1. **Always use transactions** for related inserts
2. **Index foreign keys** for join performance
3. **Denormalize summaries** for dashboard performance
4. **Archive old data** after 2+ years
5. **Use connection pooling** in production
6. **Backup daily** with retention policy
7. **Monitor query performance** and add indexes as needed

---

## Future Enhancements

Potential schema additions:
- **Habits table:** Daily habit tracking
- **Journal entries:** Free-form journaling
- **Weather data:** Correlate weather with mood/energy
- **Location tracking:** Context for activities
- **Social connections:** Network graph of relationships
- **Challenges:** Gamification elements
- **Teams/Groups:** Shared goals and accountability
