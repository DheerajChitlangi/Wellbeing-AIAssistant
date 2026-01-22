from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.user import User
from app.models.health import (
    Meal,
    NutritionItem,
    Biometric,
    Exercise,
    Sleep,
    Symptom,
    MealType,
    ExerciseType,
    SymptomSeverity,
)
from app.schemas.health import (
    MealCreate,
    MealUpdate,
    MealResponse,
    BiometricCreate,
    BiometricResponse,
    ExerciseCreate,
    ExerciseResponse,
    SleepCreate,
    SleepUpdate,
    SleepResponse,
    SymptomCreate,
    SymptomUpdate,
    SymptomResponse,
    NutritionItemCreate,
)
from app.api.deps import get_current_active_user
from app.services.health_calculations import get_health_calculator

router = APIRouter()


# ==================== MEALS ====================

@router.post("/meals", response_model=MealResponse, status_code=status.HTTP_201_CREATED)
def create_meal(
    meal_data: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new meal entry with nutrition items"""
    # Create meal
    meal_dict = meal_data.model_dump(exclude={'nutrition_items'})
    meal = Meal(**meal_dict, user_id=current_user.id)
    db.add(meal)
    db.flush()  # Flush to get meal.id

    # Add nutrition items
    if meal_data.nutrition_items:
        for item_data in meal_data.nutrition_items:
            item = NutritionItem(**item_data.model_dump(), meal_id=meal.id)
            db.add(item)

        # Calculate total calories if not provided
        if not meal.calories:
            total_calories = sum(
                item.calories or 0 for item in meal_data.nutrition_items
            )
            meal.calories = total_calories

    db.commit()
    db.refresh(meal)
    return meal


@router.get("/meals", response_model=List[MealResponse])
def get_meals(
    skip: int = 0,
    limit: int = 100,
    meal_type: Optional[MealType] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all meals with optional filters"""
    query = db.query(Meal).filter(Meal.user_id == current_user.id)

    if meal_type:
        query = query.filter(Meal.meal_type == meal_type)
    if start_date:
        query = query.filter(Meal.meal_time >= start_date)
    if end_date:
        query = query.filter(Meal.meal_time <= end_date)

    meals = (
        query.order_by(Meal.meal_time.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return meals


@router.get("/meals/{meal_id}", response_model=MealResponse)
def get_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific meal by ID"""
    meal = (
        db.query(Meal)
        .filter(Meal.id == meal_id, Meal.user_id == current_user.id)
        .first()
    )
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    return meal


@router.put("/meals/{meal_id}", response_model=MealResponse)
def update_meal(
    meal_id: int,
    meal_data: MealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a meal"""
    meal = (
        db.query(Meal)
        .filter(Meal.id == meal_id, Meal.user_id == current_user.id)
        .first()
    )
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )

    update_data = meal_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(meal, field, value)

    db.commit()
    db.refresh(meal)
    return meal


@router.delete("/meals/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a meal"""
    meal = (
        db.query(Meal)
        .filter(Meal.id == meal_id, Meal.user_id == current_user.id)
        .first()
    )
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )

    db.delete(meal)
    db.commit()
    return None


@router.post("/meals/analyze-photo")
async def analyze_meal_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """
    Placeholder endpoint for Claude Vision integration to analyze meal photos.

    This endpoint receives an image and returns estimated nutritional information.
    The actual Claude Vision API integration should be implemented by the user.
    """
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # Read file content
    contents = await file.read()

    # TODO: Implement Claude Vision API integration here
    # For now, return a placeholder response
    return {
        "message": "Photo analysis endpoint ready for Claude Vision integration",
        "filename": file.filename,
        "size_bytes": len(contents),
        "instructions": "Integrate Claude Vision API to analyze the image and return nutritional data",
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
            "confidence": "Confidence score (0-1)"
        }
    }


# ==================== BIOMETRICS ====================

@router.post("/biometrics", response_model=BiometricResponse, status_code=status.HTTP_201_CREATED)
def create_biometric(
    biometric_data: BiometricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new biometric entry with automatic BMI calculation"""
    biometric_dict = biometric_data.model_dump()

    # Calculate BMI if weight and height provided
    if biometric_dict.get('weight') and biometric_dict.get('height'):
        calculator = get_health_calculator()
        bmi = calculator.calculate_bmi(
            biometric_dict['weight'],
            biometric_dict['height']
        )
        biometric_dict['bmi'] = bmi

    biometric = Biometric(**biometric_dict, user_id=current_user.id)
    db.add(biometric)
    db.commit()
    db.refresh(biometric)
    return biometric


@router.get("/biometrics", response_model=List[BiometricResponse])
def get_biometrics(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all biometric entries"""
    query = db.query(Biometric).filter(Biometric.user_id == current_user.id)

    if start_date:
        query = query.filter(Biometric.measurement_date >= start_date)
    if end_date:
        query = query.filter(Biometric.measurement_date <= end_date)

    biometrics = (
        query.order_by(Biometric.measurement_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return biometrics


@router.get("/biometrics/trends")
def get_biometric_trends(
    metric: str = Query(..., description="Metric to analyze: weight, bmi, blood_pressure, heart_rate, blood_glucose"),
    days_back: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Analyze biometric trends over time"""
    start_date = datetime.now() - timedelta(days=days_back)

    biometrics = (
        db.query(Biometric)
        .filter(
            Biometric.user_id == current_user.id,
            Biometric.measurement_date >= start_date
        )
        .order_by(Biometric.measurement_date)
        .all()
    )

    if not biometrics:
        return {"message": "No data available", "data": []}

    # Extract data based on metric
    data = []
    for bio in biometrics:
        value = None
        if metric == 'weight':
            value = bio.weight
        elif metric == 'bmi':
            value = bio.bmi
        elif metric == 'blood_pressure':
            if bio.blood_pressure_systolic and bio.blood_pressure_diastolic:
                value = f"{bio.blood_pressure_systolic}/{bio.blood_pressure_diastolic}"
        elif metric == 'heart_rate':
            value = bio.heart_rate
        elif metric == 'blood_glucose':
            value = bio.blood_glucose

        if value is not None:
            data.append({
                "date": bio.measurement_date.strftime("%Y-%m-%d"),
                "value": value
            })

    # Calculate trend
    if len(data) >= 2 and metric != 'blood_pressure':
        numeric_values = [d['value'] for d in data if isinstance(d['value'], (int, float))]
        if numeric_values:
            first_half = numeric_values[:len(numeric_values)//2]
            second_half = numeric_values[len(numeric_values)//2:]

            avg_first = sum(first_half) / len(first_half)
            avg_second = sum(second_half) / len(second_half)

            trend = "increasing" if avg_second > avg_first else "decreasing"
            change_percent = ((avg_second - avg_first) / avg_first * 100) if avg_first > 0 else 0
        else:
            trend = "stable"
            change_percent = 0
    else:
        trend = "insufficient_data"
        change_percent = 0

    return {
        "metric": metric,
        "period": f"last {days_back} days",
        "data": data,
        "trend": trend,
        "change_percent": round(change_percent, 2) if isinstance(change_percent, (int, float)) else 0
    }


# ==================== EXERCISE ====================

@router.post("/exercise", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
def create_exercise(
    exercise_data: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new exercise entry with automatic calorie calculation"""
    exercise_dict = exercise_data.model_dump()

    # Calculate calories if not provided
    if not exercise_dict.get('calories_burned'):
        # Get user's latest weight
        latest_biometric = (
            db.query(Biometric)
            .filter(Biometric.user_id == current_user.id, Biometric.weight.isnot(None))
            .order_by(Biometric.measurement_date.desc())
            .first()
        )

        if latest_biometric and latest_biometric.weight:
            calculator = get_health_calculator()
            calories = calculator.estimate_calories_burned(
                exercise_type=exercise_dict['exercise_type'].value,
                duration_minutes=exercise_dict['duration_minutes'],
                weight_kg=latest_biometric.weight,
                intensity=exercise_dict.get('intensity', 5)
            )
            exercise_dict['calories_burned'] = calories

    exercise = Exercise(**exercise_dict, user_id=current_user.id)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


@router.get("/exercise", response_model=List[ExerciseResponse])
def get_exercises(
    skip: int = 0,
    limit: int = 100,
    exercise_type: Optional[ExerciseType] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all exercise entries"""
    query = db.query(Exercise).filter(Exercise.user_id == current_user.id)

    if exercise_type:
        query = query.filter(Exercise.exercise_type == exercise_type)
    if start_date:
        query = query.filter(Exercise.exercise_date >= start_date)
    if end_date:
        query = query.filter(Exercise.exercise_date <= end_date)

    exercises = (
        query.order_by(Exercise.exercise_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return exercises


@router.get("/exercise/summary")
def get_exercise_summary(
    days_back: int = Query(7, description="Number of days to summarize"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get exercise summary statistics"""
    start_date = datetime.now() - timedelta(days=days_back)

    exercises = (
        db.query(Exercise)
        .filter(
            Exercise.user_id == current_user.id,
            Exercise.exercise_date >= start_date
        )
        .all()
    )

    if not exercises:
        return {"message": "No exercise data available", "summary": {}}

    total_duration = sum(e.duration_minutes for e in exercises)
    total_calories = sum(e.calories_burned or 0 for e in exercises)
    total_workouts = len(exercises)

    # Count unique exercise days
    exercise_days = len(set(e.exercise_date.date() for e in exercises))

    # Group by exercise type
    by_type = {}
    for exercise in exercises:
        exercise_type = exercise.exercise_type.value
        if exercise_type not in by_type:
            by_type[exercise_type] = {
                'count': 0,
                'duration': 0,
                'calories': 0
            }
        by_type[exercise_type]['count'] += 1
        by_type[exercise_type]['duration'] += exercise.duration_minutes
        by_type[exercise_type]['calories'] += exercise.calories_burned or 0

    return {
        "period": f"last {days_back} days",
        "summary": {
            "total_workouts": total_workouts,
            "total_duration_minutes": total_duration,
            "total_calories_burned": total_calories,
            "exercise_days": exercise_days,
            "average_duration": round(total_duration / total_workouts, 1) if total_workouts > 0 else 0,
            "average_calories": round(total_calories / total_workouts, 0) if total_workouts > 0 else 0,
        },
        "by_type": by_type
    }


# ==================== SLEEP ====================

@router.post("/sleep", response_model=SleepResponse, status_code=status.HTTP_201_CREATED)
def create_sleep(
    sleep_data: SleepCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new sleep entry"""
    sleep = Sleep(**sleep_data.model_dump(), user_id=current_user.id)
    db.add(sleep)
    db.commit()
    db.refresh(sleep)
    return sleep


@router.get("/sleep", response_model=List[SleepResponse])
def get_sleep_records(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all sleep records"""
    query = db.query(Sleep).filter(Sleep.user_id == current_user.id)

    if start_date:
        query = query.filter(Sleep.sleep_date >= start_date)
    if end_date:
        query = query.filter(Sleep.sleep_date <= end_date)

    sleep_records = (
        query.order_by(Sleep.sleep_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return sleep_records


@router.get("/sleep/analysis")
def get_sleep_analysis(
    days_back: int = Query(7, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Analyze sleep patterns and quality"""
    start_date = datetime.now() - timedelta(days=days_back)

    sleep_records = (
        db.query(Sleep)
        .filter(
            Sleep.user_id == current_user.id,
            Sleep.sleep_date >= start_date
        )
        .order_by(Sleep.sleep_date)
        .all()
    )

    if not sleep_records:
        return {"message": "No sleep data available"}

    # Calculate averages
    avg_total_hours = sum(s.total_hours for s in sleep_records) / len(sleep_records)
    avg_quality = sum(s.sleep_quality for s in sleep_records) / len(sleep_records)
    avg_interruptions = sum(s.interruptions for s in sleep_records) / len(sleep_records)

    # Deep sleep average
    deep_sleep_records = [s.deep_sleep_hours for s in sleep_records if s.deep_sleep_hours]
    avg_deep_sleep = sum(deep_sleep_records) / len(deep_sleep_records) if deep_sleep_records else 0

    # REM sleep average
    rem_records = [s.rem_sleep_hours for s in sleep_records if s.rem_sleep_hours]
    avg_rem = sum(rem_records) / len(rem_records) if rem_records else 0

    # Sleep efficiency
    calculator = get_health_calculator()
    sleep_efficiency = calculator.calculate_sleep_efficiency(
        avg_total_hours,
        avg_deep_sleep,
        avg_rem,
    )

    # Consistency check (variance in bedtime)
    bedtimes = [s.bedtime.hour + s.bedtime.minute/60 for s in sleep_records]
    avg_bedtime = sum(bedtimes) / len(bedtimes)
    bedtime_variance = sum((t - avg_bedtime) ** 2 for t in bedtimes) / len(bedtimes)
    consistency_score = max(0, 100 - (bedtime_variance * 10))

    return {
        "period": f"last {days_back} days",
        "nights_tracked": len(sleep_records),
        "averages": {
            "total_hours": round(avg_total_hours, 2),
            "sleep_quality": round(avg_quality, 2),
            "deep_sleep_hours": round(avg_deep_sleep, 2),
            "rem_sleep_hours": round(avg_rem, 2),
            "interruptions": round(avg_interruptions, 2),
        },
        "sleep_efficiency": round(sleep_efficiency, 2),
        "consistency_score": round(consistency_score, 2),
        "recommendations": generate_sleep_recommendations(
            avg_total_hours,
            avg_quality,
            consistency_score
        )
    }


def generate_sleep_recommendations(avg_hours, avg_quality, consistency):
    """Generate sleep recommendations"""
    recommendations = []

    if avg_hours < 7:
        recommendations.append("Aim for 7-9 hours of sleep per night")
    if avg_quality < 6:
        recommendations.append("Focus on improving sleep environment and bedtime routine")
    if consistency < 70:
        recommendations.append("Try to maintain a consistent sleep schedule")

    if not recommendations:
        recommendations.append("Great sleep habits! Keep it up")

    return recommendations


# ==================== SYMPTOMS ====================

@router.post("/symptoms", response_model=SymptomResponse, status_code=status.HTTP_201_CREATED)
def create_symptom(
    symptom_data: SymptomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new symptom entry"""
    symptom = Symptom(**symptom_data.model_dump(), user_id=current_user.id)
    db.add(symptom)
    db.commit()
    db.refresh(symptom)
    return symptom


@router.get("/symptoms", response_model=List[SymptomResponse])
def get_symptoms(
    skip: int = 0,
    limit: int = 100,
    symptom_name: Optional[str] = None,
    severity: Optional[SymptomSeverity] = None,
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all symptoms with optional filters"""
    query = db.query(Symptom).filter(Symptom.user_id == current_user.id)

    if symptom_name:
        query = query.filter(Symptom.symptom_name.ilike(f"%{symptom_name}%"))
    if severity:
        query = query.filter(Symptom.severity == severity)
    if active_only:
        query = query.filter(Symptom.ended_at.is_(None))

    symptoms = (
        query.order_by(Symptom.started_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return symptoms


@router.put("/symptoms/{symptom_id}", response_model=SymptomResponse)
def update_symptom(
    symptom_id: int,
    symptom_data: SymptomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a symptom (e.g., mark as ended)"""
    symptom = (
        db.query(Symptom)
        .filter(Symptom.id == symptom_id, Symptom.user_id == current_user.id)
        .first()
    )
    if not symptom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symptom not found"
        )

    update_data = symptom_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(symptom, field, value)

    db.commit()
    db.refresh(symptom)
    return symptom


# ==================== HEALTH DASHBOARD ====================

@router.get("/dashboard")
def get_health_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Comprehensive health dashboard with all key metrics.
    Includes BMI, TDEE, nutritional summary, health score, and trends.
    """
    from datetime import datetime, timedelta
    from collections import defaultdict

    now = datetime.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    # Get latest biometric
    latest_biometric = (
        db.query(Biometric)
        .filter(Biometric.user_id == current_user.id)
        .order_by(Biometric.measurement_date.desc())
        .first()
    )

    # Get recent meals (last 7 days)
    recent_meals = (
        db.query(Meal)
        .filter(
            Meal.user_id == current_user.id,
            Meal.meal_time >= week_ago
        )
        .all()
    )

    # Calculate nutrition summary
    total_calories = 0
    total_protein = 0
    total_carbs = 0
    total_fat = 0
    total_fiber = 0

    for meal in recent_meals:
        if meal.nutrition_items:
            for item in meal.nutrition_items:
                total_calories += item.calories or 0
                total_protein += item.protein or 0
                total_carbs += item.carbs or 0
                total_fat += item.fat or 0
                total_fiber += item.fiber or 0

    daily_avg_calories = total_calories / 7 if recent_meals else 0

    # Get exercise data (last 7 days)
    recent_exercises = (
        db.query(Exercise)
        .filter(
            Exercise.user_id == current_user.id,
            Exercise.exercise_date >= week_ago
        )
        .all()
    )

    exercise_days = len(set(e.exercise_date.date() for e in recent_exercises))
    total_exercise_calories = sum(e.calories_burned or 0 for e in recent_exercises)

    # Get sleep data (last 7 days)
    recent_sleep = (
        db.query(Sleep)
        .filter(
            Sleep.user_id == current_user.id,
            Sleep.sleep_date >= week_ago
        )
        .all()
    )

    avg_sleep_hours = (
        sum(s.total_hours for s in recent_sleep) / len(recent_sleep)
        if recent_sleep else 0
    )
    avg_sleep_quality = (
        sum(s.sleep_quality for s in recent_sleep) / len(recent_sleep)
        if recent_sleep else 0
    )

    # Calculate BMI, TDEE, and health metrics
    calculator = get_health_calculator()

    bmi = None
    tdee = None
    macro_targets = None
    bmi_category = None

    if latest_biometric:
        if latest_biometric.weight and latest_biometric.height:
            bmi = latest_biometric.bmi or calculator.calculate_bmi(
                latest_biometric.weight,
                latest_biometric.height
            )
            bmi_category = calculator.get_bmi_category(bmi)

            # Calculate TDEE (assuming age and gender from user profile if available)
            # For now, using default values
            age = 30  # TODO: Get from user profile
            gender = 'male'  # TODO: Get from user profile

            bmr = calculator.calculate_bmr(
                latest_biometric.weight,
                latest_biometric.height,
                age,
                gender
            )

            # Determine activity level based on exercise days
            if exercise_days >= 5:
                activity_level = 'very_active'
            elif exercise_days >= 3:
                activity_level = 'moderately_active'
            elif exercise_days >= 1:
                activity_level = 'lightly_active'
            else:
                activity_level = 'sedentary'

            tdee = calculator.calculate_tdee(bmr, activity_level)
            macro_targets = calculator.calculate_macro_targets(tdee, goal='maintain')

    # Calculate nutrition score
    nutrition_score = None
    if macro_targets and daily_avg_calories > 0:
        nutrition_score = calculator.calculate_nutrition_score(
            calories=int(daily_avg_calories),
            protein=total_protein / 7,
            carbs=total_carbs / 7,
            fat=total_fat / 7,
            fiber=total_fiber / 7 if total_fiber > 0 else None,
            target_calories=int(macro_targets['calories']),
            target_protein=macro_targets['protein_g'],
            target_carbs=macro_targets['carbs_g'],
            target_fat=macro_targets['fat_g']
        )

    # Calculate overall health score
    health_score = calculator.calculate_health_score(
        bmi=bmi,
        sleep_avg=avg_sleep_hours,
        exercise_days=exercise_days,
        nutrition_score=nutrition_score,
        blood_pressure_systolic=latest_biometric.blood_pressure_systolic if latest_biometric else None,
        heart_rate=latest_biometric.heart_rate if latest_biometric else None,
    )

    # Get active symptoms
    active_symptoms = (
        db.query(Symptom)
        .filter(
            Symptom.user_id == current_user.id,
            Symptom.ended_at.is_(None)
        )
        .count()
    )

    return {
        "biometrics": {
            "bmi": round(bmi, 2) if bmi else None,
            "bmi_category": bmi_category,
            "weight": round(latest_biometric.weight, 2) if latest_biometric and latest_biometric.weight else None,
            "blood_pressure": f"{latest_biometric.blood_pressure_systolic}/{latest_biometric.blood_pressure_diastolic}" if latest_biometric and latest_biometric.blood_pressure_systolic else None,
            "heart_rate": latest_biometric.heart_rate if latest_biometric else None,
            "last_measurement": latest_biometric.measurement_date.strftime("%Y-%m-%d") if latest_biometric else None,
        },
        "nutrition": {
            "daily_average_calories": round(daily_avg_calories, 0),
            "weekly_totals": {
                "calories": total_calories,
                "protein_g": round(total_protein, 1),
                "carbs_g": round(total_carbs, 1),
                "fat_g": round(total_fat, 1),
                "fiber_g": round(total_fiber, 1),
            },
            "daily_averages": {
                "protein_g": round(total_protein / 7, 1),
                "carbs_g": round(total_carbs / 7, 1),
                "fat_g": round(total_fat / 7, 1),
            },
            "tdee": round(tdee, 0) if tdee else None,
            "macro_targets": macro_targets,
            "nutrition_score": round(nutrition_score, 2) if nutrition_score else None,
        },
        "exercise": {
            "days_active_this_week": exercise_days,
            "total_workouts": len(recent_exercises),
            "total_calories_burned": total_exercise_calories,
            "average_per_workout": round(total_exercise_calories / len(recent_exercises), 0) if recent_exercises else 0,
        },
        "sleep": {
            "average_hours": round(avg_sleep_hours, 2),
            "average_quality": round(avg_sleep_quality, 2),
            "nights_tracked": len(recent_sleep),
        },
        "symptoms": {
            "active_symptoms": active_symptoms,
        },
        "health_score": health_score,
        "period": "last 7 days",
    }


@router.get("/calculations/tdee")
def calculate_tdee(
    weight_kg: float = Query(..., description="Weight in kilograms"),
    height_cm: float = Query(..., description="Height in centimeters"),
    age: int = Query(..., description="Age in years"),
    gender: str = Query(..., description="Gender: 'male' or 'female'"),
    activity_level: str = Query("moderately_active", description="Activity level"),
    goal: str = Query("maintain", description="Goal: 'lose', 'maintain', or 'gain'"),
):
    """Calculate TDEE and macro targets"""
    calculator = get_health_calculator()

    bmi = calculator.calculate_bmi(weight_kg, height_cm)
    bmr = calculator.calculate_bmr(weight_kg, height_cm, age, gender)
    tdee = calculator.calculate_tdee(bmr, activity_level)
    macros = calculator.calculate_macro_targets(tdee, goal)
    ideal_weight_range = calculator.calculate_ideal_weight_range(height_cm, gender)

    return {
        "bmi": bmi,
        "bmi_category": calculator.get_bmi_category(bmi),
        "bmr": bmr,
        "tdee": tdee,
        "macro_targets": macros,
        "ideal_weight_range_kg": {
            "min": ideal_weight_range[0],
            "max": ideal_weight_range[1]
        },
        "activity_level": activity_level,
        "goal": goal,
    }
