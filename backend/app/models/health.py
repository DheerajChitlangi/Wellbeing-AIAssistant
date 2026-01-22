from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Enum, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class MealType(str, enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    OTHER = "other"


class ExerciseType(str, enum.Enum):
    CARDIO = "cardio"
    STRENGTH = "strength"
    FLEXIBILITY = "flexibility"
    SPORTS = "sports"
    YOGA = "yoga"
    WALKING = "walking"
    RUNNING = "running"
    CYCLING = "cycling"
    SWIMMING = "swimming"
    OTHER = "other"


class SymptomSeverity(str, enum.Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    meal_type = Column(Enum(MealType), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    meal_time = Column(DateTime(timezone=True), nullable=False, index=True)
    calories = Column(Integer, nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5 how good it was
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="meals")
    nutrition_items = relationship("NutritionItem", back_populates="meal", cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_meals_user_time', 'user_id', 'meal_time'),
    )


class NutritionItem(Base):
    __tablename__ = "nutrition_items"

    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=False, index=True)
    food_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)  # grams, oz, cups, etc.
    calories = Column(Integer, nullable=True)
    protein = Column(Float, nullable=True)  # grams
    carbs = Column(Float, nullable=True)  # grams
    fat = Column(Float, nullable=True)  # grams
    fiber = Column(Float, nullable=True)  # grams
    sugar = Column(Float, nullable=True)  # grams
    sodium = Column(Float, nullable=True)  # mg
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    meal = relationship("Meal", back_populates="nutrition_items")


class Biometric(Base):
    __tablename__ = "biometrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    measurement_date = Column(DateTime(timezone=True), nullable=False, index=True)
    weight = Column(Float, nullable=True)  # kg or lbs
    height = Column(Float, nullable=True)  # cm or inches
    bmi = Column(Float, nullable=True)
    body_fat_percentage = Column(Float, nullable=True)
    muscle_mass = Column(Float, nullable=True)
    blood_pressure_systolic = Column(Integer, nullable=True)
    blood_pressure_diastolic = Column(Integer, nullable=True)
    heart_rate = Column(Integer, nullable=True)  # bpm
    blood_glucose = Column(Float, nullable=True)  # mg/dL
    temperature = Column(Float, nullable=True)  # celsius or fahrenheit
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="biometrics")

    __table_args__ = (
        Index('ix_biometrics_user_date', 'user_id', 'measurement_date'),
    )


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    exercise_type = Column(Enum(ExerciseType), nullable=False, index=True)
    name = Column(String, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    calories_burned = Column(Integer, nullable=True)
    intensity = Column(Integer, nullable=True)  # 1-10 scale
    distance = Column(Float, nullable=True)  # km or miles
    heart_rate_avg = Column(Integer, nullable=True)
    heart_rate_max = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    exercise_date = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="exercises")

    __table_args__ = (
        Index('ix_exercises_user_date', 'user_id', 'exercise_date'),
        Index('ix_exercises_user_type', 'user_id', 'exercise_type'),
    )


class Sleep(Base):
    __tablename__ = "sleep_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    sleep_date = Column(DateTime(timezone=True), nullable=False, index=True)  # Date of sleep
    bedtime = Column(DateTime(timezone=True), nullable=False)
    wake_time = Column(DateTime(timezone=True), nullable=False)
    total_hours = Column(Float, nullable=False)
    deep_sleep_hours = Column(Float, nullable=True)
    rem_sleep_hours = Column(Float, nullable=True)
    light_sleep_hours = Column(Float, nullable=True)
    awake_time_hours = Column(Float, nullable=True)
    sleep_quality = Column(Integer, nullable=False)  # 1-10 scale
    dreams = Column(Text, nullable=True)
    interruptions = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="sleep_records")

    __table_args__ = (
        Index('ix_sleep_user_date', 'user_id', 'sleep_date'),
    )


class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    symptom_name = Column(String, nullable=False, index=True)
    severity = Column(Enum(SymptomSeverity), nullable=False)
    body_part = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    triggers = Column(Text, nullable=True)  # JSON string
    treatments = Column(Text, nullable=True)  # JSON string
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="symptoms")

    __table_args__ = (
        Index('ix_symptoms_user_name', 'user_id', 'symptom_name'),
        Index('ix_symptoms_user_started', 'user_id', 'started_at'),
    )
