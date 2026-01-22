# Database Schema Relationships

## Entity Relationship Diagram (Overview)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS (Central)                             │
│  - id, email, username, hashed_password, full_name                      │
│  - is_active, is_superuser, created_at, updated_at                      │
└────┬──────────┬──────────┬──────────┬──────────┬──────────┬────────────┘
     │          │          │          │          │          │
     │          │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼          ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Financial│ │  Health  │ │Work-Life │ │Productiv.│ │Analytics │ │ Legacy   │
│ Pillar  │ │  Pillar  │ │  Pillar  │ │  Pillar  │ │  Tables  │ │ Tables   │
└─────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

## 1. Financial Wellbeing Pillar

```
                    ┌──────────┐
                    │  Users   │
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┬──────────────┬───────────────┐
         │               │               │              │               │
         ▼               ▼               ▼              ▼               ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐   ┌──────────────┐
   │Transact- │   │ Budgets  │   │Invest-   │   │  Debts  │   │  Financial   │
   │  ions    │   │          │   │ ments    │   │         │   │    Goals     │
   └──────────┘   └──────────┘   └──────────┘   └─────────┘   └──────────────┘
   • type        • category     • type         • type         • title
   • category    • limit        • symbol       • original     • target_amount
   • amount      • period       • quantity     • balance      • current_amount
   • date        • threshold    • prices       • interest     • target_date
   • merchant                   • dates        • payment      • priority
```

**Key Points:**
- All tables link directly to Users via `user_id`
- Transactions have enum types: income, expense, transfer
- Budgets track spending limits per category
- Investments track portfolio performance
- Debts track liabilities and payoff progress

---

## 2. Health/Diet Pillar

```
                          ┌──────────┐
                          │  Users   │
                          └────┬─────┘
                               │
         ┌─────────────────────┼────────────────┬─────────────┬──────────┐
         │                     │                │             │          │
         ▼                     ▼                ▼             ▼          ▼
   ┌──────────┐         ┌──────────┐    ┌──────────┐  ┌──────────┐  ┌─────────┐
   │  Meals   │         │Biometrics│    │Exercises │  │  Sleep   │  │Symptoms │
   └────┬─────┘         └──────────┘    └──────────┘  │ Records  │  └─────────┘
        │               • weight         • type        └──────────┘  • name
        │               • BMI            • duration    • bedtime     • severity
        │               • BP             • calories    • wake_time   • body_part
        │               • heart_rate     • intensity   • quality     • triggers
        ▼               • glucose        • distance    • stages      • treatments
   ┌──────────┐
   │Nutrition │
   │  Items   │
   └──────────┘
   • food_name
   • macros
   • calories
```

**Key Points:**
- Meals have a one-to-many relationship with NutritionItems
- Biometrics store vital signs and measurements
- Exercises track physical activities with detailed metrics
- Sleep records track sleep quality and duration
- Symptoms track health issues and their progression

---

## 3. Work-Life Balance Pillar

```
                          ┌──────────┐
                          │  Users   │
                          └────┬─────┘
                               │
         ┌─────────────────────┼────────────────┬─────────────┬──────────┐
         │                     │                │             │          │
         ▼                     ▼                ▼             ▼          ▼
   ┌──────────┐         ┌──────────┐    ┌──────────┐  ┌──────────┐  ┌──────────┐
   │   Work   │         │ Meetings │    │  Energy  │  │  Social  │  │Boundaries│
   │ Sessions │         └──────────┘    │  Levels  │  │Activities│  └────┬─────┘
   └──────────┘         • type          └──────────┘  └──────────┘       │
   • duration           • attendees     • score       • type             │
   • project            • productive?   • mental      • enjoyment        │
   • overtime           • could_be_     • physical    • duration         │
   • productivity         email?        • emotional   • energy_Δ         │
   • stress             • energy_Δ      • context                        │
                                                                          ▼
                                                                    ┌──────────┐
                                                                    │ Boundary │
                                                                    │Violations│
                                                                    └──────────┘
                                                                    • date
                                                                    • impact
                                                                    • necessary?
```

**Key Points:**
- Work Sessions track work time and productivity
- Meetings include effectiveness metrics
- Energy Levels track mental/physical state throughout day
- Social Activities track time spent with others
- Boundaries define work-life rules, Violations track when broken

---

## 4. Productivity Pillar

```
                          ┌──────────┐
                          │  Users   │
                          └────┬─────┘
                               │
         ┌─────────────────────┼────────────────┬─────────────┬──────────┐
         │                     │                │             │          │
         ▼                     ▼                ▼             ▼          ▼
   ┌──────────┐         ┌──────────┐    ┌──────────┐  ┌──────────┐  ┌──────────┐
   │  Tasks   │◄────────│   Deep   │    │Productiv.│  │Distract- │  │   Flow   │
   │          │         │   Work   │    │  Goals   │  │  ions    │  │  States  │
   │   ┌──────┤         │ Sessions │    └──────────┘  └──────────┘  └──────────┘
   │   │self  │         └──────────┘    • metric      • type        • intensity
   └───┴──────┘         • focus_score   • target      • impact      • challenge
   • status             • interrupts    • current     • avoidable?  • conditions
   • priority           • output_qual.  • period      • prevention  • triggers
   • project            • was_planned                                • output
   • estimated_time     │
   • actual_time        └──────────────────────┐
   • energy_req.                               │
                                                ▼
                                          ┌──────────┐
                                          │Pomodoros │
                                          └──────────┘
                                          • duration
                                          • completed?
                                          • interrupted?
                                          • focus
```

**Key Points:**
- Tasks support hierarchical structure (parent_task_id)
- Deep Work Sessions link to Tasks
- Flow States track optimal performance periods
- Distractions link to Deep Work Sessions or Tasks
- Pomodoros track time management technique usage

---

## 5. Analytics & Insights

```
                          ┌──────────┐
                          │  Users   │
                          └────┬─────┘
                               │
         ┌─────────────────────┼────────────────┬─────────────┬──────────┐
         │                     │                │             │          │
         ▼                     ▼                ▼             ▼          ▼
   ┌──────────┐         ┌──────────┐    ┌──────────┐  ┌──────────┐  ┌──────────┐
   │  Daily   │         │  Weekly  │    │ Monthly  │  │Correlat- │  │Recommend-│
   │Summaries │         │Summaries │    │Summaries │  │  ions    │  │  ations  │
   └──────────┘         └──────────┘    └──────────┘  └────┬─────┘  └────┬─────┘
   • all_pillars       • aggregated    • aggregated    │              │
     metrics           • trends        • high_level    │              │
   • wellbeing_        • achievements  • savings_rate  │              │
     score             • improvements  • goals_achieved│              │
   • highlights                                        │              │
   • lowlights                                         └──────────────┘
                                                              │
                                        Link: Recommendations reference
                                              Correlations for evidence
```

**Key Points:**
- Daily Summaries aggregate metrics from all pillars
- Weekly/Monthly Summaries provide trend analysis
- Correlations discover patterns between factors
- Recommendations use Correlations to suggest actions
- All summaries are indexed by date for fast retrieval

---

## Cross-Pillar Relationships

### Task → Deep Work → Flow State
```
┌──────┐     ┌──────────┐     ┌──────────┐
│ Task │────►│DeepWork  │────►│FlowState │
└──────┘     │Session   │     └──────────┘
             └────┬─────┘
                  │
                  ▼
             ┌──────────┐
             │Distract- │
             │  ions    │
             └──────────┘
```

### Energy → Work → Productivity
```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Energy  │     │   Work   │     │  Tasks   │
│  Levels  │────►│ Sessions │────►│Completed │
└──────────┘     └──────────┘     └──────────┘
     │                │                  │
     └────────────────┴──────────────────┘
                      │
                      ▼
              ┌──────────────┐
              │    Daily     │
              │   Summary    │
              └──────────────┘
```

### Sleep → Mood → Performance
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Sleep   │────►│  Energy  │────►│  Deep    │────►│   Flow   │
│  Records │     │  Levels  │     │   Work   │     │  States  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

---

## Indexes Summary

### High-Performance Queries

**User-Date Composite Indexes:**
- `(user_id, transaction_date)` - Financial transactions
- `(user_id, meal_time)` - Meals
- `(user_id, exercise_date)` - Exercise
- `(user_id, sleep_date)` - Sleep records
- `(user_id, start_time)` - Work sessions, meetings, social activities
- `(user_id, timestamp)` - Energy levels, distractions
- `(user_id, summary_date)` - Daily summaries (UNIQUE)

**Category/Type Indexes:**
- `(user_id, category)` - Transactions by category
- `(user_id, status)` - Tasks by status
- `(user_id, priority)` - Tasks by priority
- `(user_id, project)` - Tasks by project
- `(user_id, meeting_type)` - Meetings by type
- `(user_id, is_active)` - Active budgets, debts, goals, boundaries

**Unique Constraints:**
- `(user_id, summary_date)` - One daily summary per user per day
- `(user_id, week_start_date)` - One weekly summary per user per week
- `(user_id, year, month)` - One monthly summary per user per month

---

## Data Flow Example: A Typical Day

```
1. Morning:
   ┌──────────┐     ┌──────────┐
   │  Sleep   │────►│ Energy   │
   │  Record  │     │  Level   │
   └──────────┘     └──────────┘
           │             │
           └─────┬───────┘
                 ▼
   ┌──────────────────────┐
   │   Breakfast Meal     │
   │  + Nutrition Items   │
   └──────────────────────┘

2. Work Hours:
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │   Work   │────►│ Meeting  │────►│ Energy   │
   │ Session  │     │          │     │  Level   │
   └──────────┘     └──────────┘     └──────────┘
           │
           ▼
   ┌──────────┐     ┌──────────┐
   │   Deep   │────►│   Flow   │
   │   Work   │     │  State   │
   └──────────┘     └──────────┘
        │ │
        │ └──────────────┐
        ▼                ▼
   ┌──────────┐     ┌──────────┐
   │  Tasks   │     │Distract- │
   │Completed │     │  ions    │
   └──────────┘     └──────────┘

3. Personal Time:
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │ Exercise │────►│ Social   │────►│  Dinner  │
   │          │     │ Activity │     │   Meal   │
   └──────────┘     └──────────┘     └──────────┘

4. Evening:
   ┌──────────┐     ┌──────────┐
   │Financial │────►│  Sleep   │
   │  Review  │     │  Prep    │
   └──────────┘     └──────────┘

5. Nightly Processing:
   ┌─────────────────────────────┐
   │    Aggregate all data       │
   │         into                │
   │     Daily Summary           │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │  Run Correlation Analysis   │
   │  (Weekly batch job)         │
   └──────────┬──────────────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │   Generate Recommendations  │
   │   based on patterns         │
   └─────────────────────────────┘
```

---

## Table Count Summary

**By Pillar:**
- **Financial:** 5 tables
- **Health/Diet:** 6 tables (including NutritionItems)
- **Work-Life:** 6 tables (including BoundaryViolations)
- **Productivity:** 6 tables
- **Analytics:** 5 tables
- **Core:** 1 table (Users)

**Total:** 29 tables

---

## Foreign Key Relationships

**One-to-Many (User → *):**
- Users → All 28 other tables

**One-to-Many (Within Pillars):**
- Meals → NutritionItems
- Boundaries → BoundaryViolations
- Tasks → Tasks (hierarchical)

**Optional Many-to-One:**
- DeepWorkSessions → Tasks
- FlowStates → Tasks
- FlowStates → DeepWorkSessions
- Distractions → Tasks
- Distractions → DeepWorkSessions
- Pomodoros → Tasks
- Recommendations → Correlations

**Cascade Delete:**
- When User deleted → All related records deleted
- When Meal deleted → Related NutritionItems deleted
- When Boundary deleted → Related BoundaryViolations deleted
