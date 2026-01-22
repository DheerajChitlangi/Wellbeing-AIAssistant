from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.health import MealType, ExerciseType, SymptomSeverity


# Nutrition Item Schemas
class NutritionItemBase(BaseModel):
    food_name: str
    quantity: float = Field(..., gt=0)
    unit: str
    calories: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    fiber: Optional[float] = None
    sugar: Optional[float] = None
    sodium: Optional[float] = None


class NutritionItemCreate(NutritionItemBase):
    pass


class NutritionItemResponse(NutritionItemBase):
    id: int
    meal_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Meal Schemas
class MealBase(BaseModel):
    meal_type: MealType
    name: str
    description: Optional[str] = None
    meal_time: datetime
    calories: Optional[int] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None


class MealCreate(MealBase):
    nutrition_items: Optional[List[NutritionItemCreate]] = []


class MealUpdate(BaseModel):
    meal_type: Optional[MealType] = None
    name: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None


class MealResponse(MealBase):
    id: int
    user_id: int
    nutrition_items: List[NutritionItemResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Biometric Schemas
class BiometricBase(BaseModel):
    measurement_date: datetime
    weight: Optional[float] = Field(None, gt=0)
    height: Optional[float] = Field(None, gt=0)
    bmi: Optional[float] = None
    body_fat_percentage: Optional[float] = Field(None, ge=0, le=100)
    muscle_mass: Optional[float] = None
    blood_pressure_systolic: Optional[int] = Field(None, gt=0)
    blood_pressure_diastolic: Optional[int] = Field(None, gt=0)
    heart_rate: Optional[int] = Field(None, gt=0)
    blood_glucose: Optional[float] = Field(None, gt=0)
    temperature: Optional[float] = None
    notes: Optional[str] = None


class BiometricCreate(BiometricBase):
    pass


class BiometricResponse(BiometricBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Exercise Schemas
class ExerciseBase(BaseModel):
    exercise_type: ExerciseType
    name: str
    duration_minutes: int = Field(..., gt=0)
    calories_burned: Optional[int] = Field(None, ge=0)
    intensity: Optional[int] = Field(None, ge=1, le=10)
    distance: Optional[float] = Field(None, ge=0)
    heart_rate_avg: Optional[int] = Field(None, gt=0)
    heart_rate_max: Optional[int] = Field(None, gt=0)
    notes: Optional[str] = None
    exercise_date: datetime


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseResponse(ExerciseBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Sleep Schemas
class SleepBase(BaseModel):
    sleep_date: datetime
    bedtime: datetime
    wake_time: datetime
    total_hours: float = Field(..., gt=0, le=24)
    deep_sleep_hours: Optional[float] = Field(None, ge=0)
    rem_sleep_hours: Optional[float] = Field(None, ge=0)
    light_sleep_hours: Optional[float] = Field(None, ge=0)
    awake_time_hours: Optional[float] = Field(None, ge=0)
    sleep_quality: int = Field(..., ge=1, le=10)
    dreams: Optional[str] = None
    interruptions: int = Field(default=0, ge=0)
    notes: Optional[str] = None


class SleepCreate(SleepBase):
    pass


class SleepUpdate(BaseModel):
    sleep_quality: Optional[int] = Field(None, ge=1, le=10)
    dreams: Optional[str] = None
    notes: Optional[str] = None


class SleepResponse(SleepBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Symptom Schemas
class SymptomBase(BaseModel):
    symptom_name: str
    severity: SymptomSeverity
    body_part: Optional[str] = None
    description: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    triggers: Optional[str] = None
    treatments: Optional[str] = None
    notes: Optional[str] = None


class SymptomCreate(SymptomBase):
    pass


class SymptomUpdate(BaseModel):
    severity: Optional[SymptomSeverity] = None
    ended_at: Optional[datetime] = None
    description: Optional[str] = None
    treatments: Optional[str] = None
    notes: Optional[str] = None


class SymptomResponse(SymptomBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
