# Health/Diet Wellbeing API Documentation

Complete documentation for the Health and Diet Wellbeing API endpoints.

## Base URL
```
http://localhost:8000/api/v1/health
```

## Authentication
All endpoints require authentication via Bearer token.

---

## 1. Meal Logging API

### Create Meal
**POST** `/meals`

Log a meal with detailed nutritional information.

**Request Body:**
```json
{
  "meal_type": "breakfast",
  "name": "Oatmeal with Berries",
  "description": "Steel-cut oats with blueberries and almonds",
  "meal_time": "2025-01-15T08:00:00",
  "rating": 4,
  "notes": "Felt energized after",
  "nutrition_items": [
    {
      "food_name": "Steel-cut oats",
      "quantity": 50,
      "unit": "grams",
      "calories": 190,
      "protein": 7.0,
      "carbs": 32.0,
      "fat": 3.5,
      "fiber": 5.0
    },
    {
      "food_name": "Blueberries",
      "quantity": 100,
      "unit": "grams",
      "calories": 57,
      "protein": 0.7,
      "carbs": 14.5,
      "fat": 0.3,
      "fiber": 2.4
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": 1,
  "meal_type": "breakfast",
  "name": "Oatmeal with Berries",
  "calories": 247,
  "nutrition_items": [...],
  "created_at": "2025-01-15T08:05:00"
}
```

---

### Get All Meals
**GET** `/meals?skip=0&limit=100`

**Query Parameters:**
- `meal_type`: Filter by type (breakfast, lunch, dinner, snack)
- `start_date`: Filter meals after this date
- `end_date`: Filter meals before this date

---

### Update Meal
**PUT** `/meals/{meal_id}`

---

### Delete Meal
**DELETE** `/meals/{meal_id}`

---

### Analyze Meal Photo (Claude Vision Integration Point)
**POST** `/meals/analyze-photo`

Upload a meal photo for AI analysis.

**Request:**
```
Content-Type: multipart/form-data
file: [image file]
```

**Response:** `200 OK`
```json
{
  "message": "Photo analysis endpoint ready for Claude Vision integration",
  "filename": "meal.jpg",
  "instructions": "Integrate Claude Vision API to analyze the image",
  "expected_response": {
    "food_items": [
      {
        "name": "Detected food item",
        "quantity": "Estimated quantity",
        "calories": "Estimated calories",
        "protein": "Estimated protein (g)",
        "carbs": "Estimated carbs (g)",
        "fat": "Estimated fat (g)"
      }
    ],
    "confidence": 0.85
  }
}
```

**Integration Instructions:**
1. Send the uploaded image to Claude Vision API
2. Process the response to extract food items
3. Return structured nutritional data
4. Create meal entry with analyzed data

---

## 2. Biometrics Tracker API

### Create Biometric Entry
**POST** `/biometrics`

Log biometric measurements with automatic BMI calculation.

**Request Body:**
```json
{
  "measurement_date": "2025-01-15T07:00:00",
  "weight": 75.5,
  "height": 175.0,
  "body_fat_percentage": 18.5,
  "blood_pressure_systolic": 120,
  "blood_pressure_diastolic": 80,
  "heart_rate": 72,
  "blood_glucose": 95.0,
  "temperature": 36.8,
  "notes": "Morning measurement, fasted"
}
```

**Response:** `201 Created` (with calculated BMI)
```json
{
  "id": 1,
  "bmi": 24.65,
  "weight": 75.5,
  ...
}
```

**Features:**
- Automatic BMI calculation when weight and height provided
- Support for all major biometric measurements
- Optional fields for flexible tracking

---

### Get All Biometrics
**GET** `/biometrics?start_date=2025-01-01&end_date=2025-01-31`

---

### Get Biometric Trends
**GET** `/biometrics/trends?metric=weight&days_back=30`

Analyze trends for specific biometric metrics.

**Query Parameters:**
- `metric`: weight, bmi, blood_pressure, heart_rate, blood_glucose
- `days_back`: Number of days to analyze (default: 30)

**Response:** `200 OK`
```json
{
  "metric": "weight",
  "period": "last 30 days",
  "data": [
    {
      "date": "2025-01-01",
      "value": 76.2
    },
    {
      "date": "2025-01-08",
      "value": 75.8
    }
  ],
  "trend": "decreasing",
  "change_percent": -2.5
}
```

**Trend Analysis Algorithm:**
- Compares first half vs second half averages
- Calculates percentage change
- Identifies trend direction

---

## 3. Exercise Logger API

### Create Exercise Entry
**POST** `/exercise`

Log exercise with automatic calorie estimation.

**Request Body:**
```json
{
  "exercise_type": "running",
  "name": "Morning Jog",
  "duration_minutes": 30,
  "intensity": 7,
  "distance": 5.0,
  "heart_rate_avg": 150,
  "heart_rate_max": 170,
  "notes": "Felt great, good pace",
  "exercise_date": "2025-01-15T06:30:00"
}
```

**Response:** `201 Created` (with estimated calories)
```json
{
  "id": 1,
  "calories_burned": 285,
  "duration_minutes": 30,
  ...
}
```

**Calorie Estimation:**
- Uses MET (Metabolic Equivalent of Task) values
- Adjusts based on intensity (1-10 scale)
- Factors in user weight from latest biometric
- Formula: MET × weight (kg) × duration (hours)

---

### Get All Exercises
**GET** `/exercise?exercise_type=running&start_date=2025-01-01`

---

### Get Exercise Summary
**GET** `/exercise/summary?days_back=7`

Get comprehensive exercise statistics.

**Response:** `200 OK`
```json
{
  "period": "last 7 days",
  "summary": {
    "total_workouts": 5,
    "total_duration_minutes": 150,
    "total_calories_burned": 750,
    "exercise_days": 5,
    "average_duration": 30.0,
    "average_calories": 150
  },
  "by_type": {
    "running": {
      "count": 3,
      "duration": 90,
      "calories": 450
    },
    "strength": {
      "count": 2,
      "duration": 60,
      "calories": 300
    }
  }
}
```

---

## 4. Sleep Tracker API

### Create Sleep Entry
**POST** `/sleep`

Log sleep with detailed sleep stage data.

**Request Body:**
```json
{
  "sleep_date": "2025-01-15",
  "bedtime": "2025-01-14T23:00:00",
  "wake_time": "2025-01-15T07:00:00",
  "total_hours": 8.0,
  "deep_sleep_hours": 2.5,
  "rem_sleep_hours": 1.8,
  "light_sleep_hours": 3.2,
  "awake_time_hours": 0.5,
  "sleep_quality": 8,
  "interruptions": 1,
  "notes": "Woke up feeling refreshed"
}
```

---

### Get All Sleep Records
**GET** `/sleep?start_date=2025-01-01`

---

### Get Sleep Analysis
**GET** `/sleep/analysis?days_back=7`

Comprehensive sleep analysis with recommendations.

**Response:** `200 OK`
```json
{
  "period": "last 7 days",
  "nights_tracked": 7,
  "averages": {
    "total_hours": 7.5,
    "sleep_quality": 7.8,
    "deep_sleep_hours": 2.3,
    "rem_sleep_hours": 1.6,
    "interruptions": 1.2
  },
  "sleep_efficiency": 92.5,
  "consistency_score": 85.0,
  "recommendations": [
    "Great sleep habits! Keep it up"
  ]
}
```

**Analysis Features:**
- Average calculation across all sleep stages
- Sleep efficiency percentage
- Consistency score (bedtime variance)
- Personalized recommendations

---

## 5. Symptom Tracker API

### Create Symptom
**POST** `/symptoms`

Log a symptom with context and severity.

**Request Body:**
```json
{
  "symptom_name": "Headache",
  "severity": "moderate",
  "body_part": "forehead",
  "description": "Dull, persistent pain",
  "started_at": "2025-01-15T10:00:00",
  "triggers": "screen time, stress",
  "treatments": "ibuprofen, rest",
  "notes": "Started after long meeting"
}
```

---

### Get All Symptoms
**GET** `/symptoms?active_only=true&severity=severe`

**Query Parameters:**
- `symptom_name`: Search by symptom name
- `severity`: Filter by severity (mild, moderate, severe)
- `active_only`: Only show ongoing symptoms

---

### Update Symptom
**PUT** `/symptoms/{symptom_id}`

Mark symptom as resolved or update severity.

```json
{
  "ended_at": "2025-01-15T16:00:00",
  "treatments": "ibuprofen, rest, water",
  "notes": "Resolved after resting"
}
```

---

## 6. Health Dashboard API

### Get Health Dashboard
**GET** `/dashboard`

Comprehensive health overview with all metrics.

**Response:** `200 OK`
```json
{
  "biometrics": {
    "bmi": 24.65,
    "bmi_category": "Normal weight",
    "weight": 75.5,
    "blood_pressure": "120/80",
    "heart_rate": 72,
    "last_measurement": "2025-01-15"
  },
  "nutrition": {
    "daily_average_calories": 2100,
    "weekly_totals": {
      "calories": 14700,
      "protein_g": 525.0,
      "carbs_g": 1750.0,
      "fat_g": 455.0,
      "fiber_g": 175.0
    },
    "daily_averages": {
      "protein_g": 75.0,
      "carbs_g": 250.0,
      "fat_g": 65.0
    },
    "tdee": 2400,
    "macro_targets": {
      "calories": 2400,
      "protein_g": 180,
      "carbs_g": 240,
      "fat_g": 80
    },
    "nutrition_score": 85.5
  },
  "exercise": {
    "days_active_this_week": 5,
    "total_workouts": 6,
    "total_calories_burned": 1500,
    "average_per_workout": 250
  },
  "sleep": {
    "average_hours": 7.5,
    "average_quality": 7.8,
    "nights_tracked": 7
  },
  "symptoms": {
    "active_symptoms": 0
  },
  "health_score": {
    "overall_score": 82.5,
    "max_score": 100,
    "percentage": 82.5,
    "grade": "A",
    "breakdown": {
      "bmi": {"score": 20, "max": 20},
      "sleep": {"score": 18, "max": 20},
      "exercise": {"score": 25, "max": 25},
      "nutrition": {"score": 17.5, "max": 20},
      "vitals": {"score": 15, "max": 15}
    }
  },
  "period": "last 7 days"
}
```

**Metrics Included:**
1. **Biometrics**: Latest measurements with BMI
2. **Nutrition**: Weekly and daily averages, TDEE, macro targets
3. **Exercise**: Activity summary and calories burned
4. **Sleep**: Quality and duration averages
5. **Symptoms**: Active symptom count
6. **Health Score**: Overall score with detailed breakdown

---

### Calculate TDEE
**GET** `/calculations/tdee`

Calculate Total Daily Energy Expenditure and macro targets.

**Query Parameters:**
- `weight_kg`: Weight in kilograms (required)
- `height_cm`: Height in centimeters (required)
- `age`: Age in years (required)
- `gender`: 'male' or 'female' (required)
- `activity_level`: sedentary, lightly_active, moderately_active, very_active, extra_active
- `goal`: lose, maintain, gain

**Example Request:**
```
GET /calculations/tdee?weight_kg=75&height_cm=175&age=30&gender=male&activity_level=moderately_active&goal=lose
```

**Response:** `200 OK`
```json
{
  "bmi": 24.49,
  "bmi_category": "Normal weight",
  "bmr": 1722.5,
  "tdee": 2669.9,
  "macro_targets": {
    "calories": 2170,
    "protein_g": 163,
    "carbs_g": 217,
    "fat_g": 72
  },
  "ideal_weight_range_kg": {
    "min": 56.6,
    "max": 76.3
  },
  "activity_level": "moderately_active",
  "goal": "lose"
}
```

**Calculations:**
- **BMR**: Mifflin-St Jeor Equation
- **TDEE**: BMR × Activity Multiplier
- **Macros**:
  - Lose: TDEE - 500 cal (30% protein, 40% carbs, 30% fat)
  - Maintain: TDEE (30% protein, 40% carbs, 30% fat)
  - Gain: TDEE + 300 cal (30% protein, 40% carbs, 30% fat)

---

## Health Calculations

### BMI (Body Mass Index)
```
BMI = weight(kg) / height(m)²
```

**Categories:**
- < 18.5: Underweight
- 18.5-24.9: Normal weight
- 25-29.9: Overweight
- ≥ 30: Obese

---

### BMR (Basal Metabolic Rate)
**Mifflin-St Jeor Equation:**

**Men:**
```
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
```

**Women:**
```
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```

---

### TDEE (Total Daily Energy Expenditure)
```
TDEE = BMR × Activity Multiplier
```

**Activity Multipliers:**
- Sedentary (little/no exercise): 1.2
- Lightly Active (1-3 days/week): 1.375
- Moderately Active (3-5 days/week): 1.55
- Very Active (6-7 days/week): 1.725
- Extra Active (physical job + exercise): 1.9

---

### Calorie Burn Estimation
```
Calories = MET × weight_kg × duration_hours
```

**MET Values:**
- Walking: 3.5
- Running: 8.0
- Cycling: 6.0
- Swimming: 7.0
- Yoga: 3.0
- Strength Training: 5.0
- Sports: 6.5

**Intensity Adjustment:**
```
Adjusted MET = Base MET × (0.7 + intensity × 0.06)
```
Where intensity is 1-10 scale.

---

### Health Score Algorithm

**Components (Total: 100 points):**

1. **BMI Score (20 points)**
   - 18.5-25: 20 points
   - 17-18.5 or 25-27: 15 points
   - 16-17 or 27-30: 10 points
   - Others: 5 points

2. **Sleep Score (20 points)**
   - 7-9 hours: 20 points
   - 6-7 or 9-10 hours: 15 points
   - 5-6 or 10-11 hours: 10 points
   - Others: 5 points

3. **Exercise Score (25 points)**
   - ≥5 days/week: 25 points
   - 3-4 days/week: 20 points
   - 1-2 days/week: 15 points
   - 0 days: 5 points

4. **Nutrition Score (20 points)**
   - Based on macro adherence to targets
   - Calculated using weighted deviation from targets

5. **Vitals Score (15 points)**
   - Blood Pressure (7.5 points):
     - 90-120 systolic: 7.5 points
     - 121-129: 5 points
     - Others: 2.5 points
   - Heart Rate (7.5 points):
     - 60-80 bpm: 7.5 points
     - 50-60 or 80-100: 5 points
     - Others: 2.5 points

**Grades:**
- A+ (90-100): Excellent
- A (80-89): Very Good
- B (70-79): Good
- C (60-69): Fair
- D (50-59): Needs Improvement
- F (<50): Poor

---

### Nutrition Score (0-100)

Evaluates how well daily intake matches targets:

1. **Calorie Score** (25%)
   - Within 10% of target: 100
   - Within 20%: 80
   - Within 30%: 60
   - Over 30%: 40

2. **Protein Score** (25%)
   - Within 15%: 100
   - Within 30%: 75
   - Over 30%: 50

3. **Carbs Score** (25%)
   - Within 20%: 100
   - Within 40%: 75
   - Over 40%: 50

4. **Fat Score** (25%)
   - Within 20%: 100
   - Within 40%: 75
   - Over 40%: 50

**Fiber Bonus:**
- ≥25g: +100 to average
- 20-25g: +80 to average

---

## Data Types

### Meal Types
- `breakfast`
- `lunch`
- `dinner`
- `snack`
- `other`

### Exercise Types
- `cardio`
- `strength`
- `flexibility`
- `sports`
- `yoga`
- `walking`
- `running`
- `cycling`
- `swimming`
- `other`

### Symptom Severity
- `mild`
- `moderate`
- `severe`

---

## Best Practices

1. **Daily Tracking**: Log meals, exercise, and sleep daily for accurate insights
2. **Photo Analysis**: Use Claude Vision integration for quick meal logging
3. **Biometric Consistency**: Measure at same time daily (morning, fasted)
4. **Set Goals**: Use TDEE calculator to set appropriate calorie and macro targets
5. **Monitor Trends**: Check biometric trends weekly
6. **Complete Nutrition**: Include all macro data for accurate nutrition score
7. **Sleep Stages**: Track sleep stages for better sleep quality insights

---

## Example Workflow

### 1. Complete Daily Health Routine

```bash
# Morning: Log biometrics
POST /biometrics
{
  "measurement_date": "2025-01-15T07:00:00",
  "weight": 75.5,
  "heart_rate": 65,
  "blood_pressure_systolic": 118,
  "blood_pressure_diastolic": 78
}

# Breakfast: Log meal
POST /meals
{
  "meal_type": "breakfast",
  "name": "Protein Oatmeal",
  "meal_time": "2025-01-15T08:00:00",
  "nutrition_items": [...]
}

# Afternoon: Log exercise
POST /exercise
{
  "exercise_type": "running",
  "name": "5K Run",
  "duration_minutes": 30,
  "intensity": 7,
  "exercise_date": "2025-01-15T17:00:00"
}

# Night: Log sleep (next morning)
POST /sleep
{
  "sleep_date": "2025-01-15",
  "bedtime": "2025-01-15T23:00:00",
  "wake_time": "2025-01-16T07:00:00",
  "total_hours": 8.0,
  "sleep_quality": 8
}

# Check dashboard
GET /dashboard
```

### 2. Setting Up Personal Targets

```bash
# Calculate TDEE and targets
GET /calculations/tdee?weight_kg=75&height_cm=175&age=30&gender=male&activity_level=moderately_active&goal=maintain

# Use returned macro_targets for tracking
```

### 3. Analyzing Progress

```bash
# Weight trend
GET /biometrics/trends?metric=weight&days_back=30

# Exercise summary
GET /exercise/summary?days_back=7

# Sleep analysis
GET /sleep/analysis?days_back=7
```

---

## Error Responses

**400 Bad Request**
```json
{
  "detail": "Invalid data format or validation error"
}
```

**404 Not Found**
```json
{
  "detail": "Resource not found"
}
```

---

## Testing with Swagger UI

Access interactive documentation:
```
http://localhost:8000/docs
```

---

## Claude Vision Integration Guide

To integrate Claude Vision for meal photo analysis:

1. **Capture uploaded image in endpoint**
2. **Send to Claude Vision API**:
   ```python
   import anthropic

   client = anthropic.Anthropic(api_key="your-api-key")
   message = client.messages.create(
       model="claude-3-5-sonnet-20241022",
       max_tokens=1024,
       messages=[
           {
               "role": "user",
               "content": [
                   {
                       "type": "image",
                       "source": {
                           "type": "base64",
                           "media_type": "image/jpeg",
                           "data": base64_image,
                       },
                   },
                   {
                       "type": "text",
                       "text": "Analyze this meal photo and provide nutritional estimates..."
                   }
               ],
           }
       ],
   )
   ```

3. **Parse response and create meal entry**
4. **Return structured data to client**

---

## Support

For issues or questions:
- Interactive API docs: `/docs`
- Health check: `/health`
