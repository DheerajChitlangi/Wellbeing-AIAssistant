"""
Health calculation utilities for BMI, TDEE, macro targets, and health scores.
"""

from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta


class HealthCalculator:
    """Health metrics calculator"""

    @staticmethod
    def calculate_bmi(weight_kg: float, height_cm: float) -> float:
        """
        Calculate Body Mass Index (BMI).

        Args:
            weight_kg: Weight in kilograms
            height_cm: Height in centimeters

        Returns:
            BMI value
        """
        height_m = height_cm / 100
        bmi = weight_kg / (height_m ** 2)
        return round(bmi, 2)

    @staticmethod
    def get_bmi_category(bmi: float) -> str:
        """Get BMI category classification"""
        if bmi < 18.5:
            return "Underweight"
        elif 18.5 <= bmi < 25:
            return "Normal weight"
        elif 25 <= bmi < 30:
            return "Overweight"
        else:
            return "Obese"

    @staticmethod
    def calculate_bmr(
        weight_kg: float,
        height_cm: float,
        age: int,
        gender: str
    ) -> float:
        """
        Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation.

        Args:
            weight_kg: Weight in kilograms
            height_cm: Height in centimeters
            age: Age in years
            gender: 'male' or 'female'

        Returns:
            BMR in calories per day
        """
        # Mifflin-St Jeor Equation
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)

        if gender.lower() == 'male':
            bmr += 5
        else:  # female
            bmr -= 161

        return round(bmr, 2)

    @staticmethod
    def calculate_tdee(
        bmr: float,
        activity_level: str
    ) -> float:
        """
        Calculate Total Daily Energy Expenditure (TDEE).

        Args:
            bmr: Basal Metabolic Rate
            activity_level: Activity level
                - 'sedentary': Little or no exercise
                - 'lightly_active': Light exercise 1-3 days/week
                - 'moderately_active': Moderate exercise 3-5 days/week
                - 'very_active': Hard exercise 6-7 days/week
                - 'extra_active': Very hard exercise & physical job

        Returns:
            TDEE in calories per day
        """
        activity_multipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extra_active': 1.9
        }

        multiplier = activity_multipliers.get(activity_level.lower(), 1.2)
        tdee = bmr * multiplier
        return round(tdee, 2)

    @staticmethod
    def calculate_macro_targets(
        tdee: float,
        goal: str = 'maintain',
        protein_per_kg: float = 2.0
    ) -> Dict[str, float]:
        """
        Calculate macro nutrient targets.

        Args:
            tdee: Total Daily Energy Expenditure
            goal: 'lose', 'maintain', or 'gain'
            protein_per_kg: Protein intake per kg of body weight

        Returns:
            Dictionary with calorie and macro targets
        """
        # Adjust calories based on goal
        if goal == 'lose':
            target_calories = tdee - 500  # 500 cal deficit
        elif goal == 'gain':
            target_calories = tdee + 300  # 300 cal surplus
        else:  # maintain
            target_calories = tdee

        # Standard macro split (can be customized)
        # Protein: 30%, Carbs: 40%, Fat: 30%
        protein_calories = target_calories * 0.30
        carb_calories = target_calories * 0.40
        fat_calories = target_calories * 0.30

        return {
            'calories': round(target_calories, 0),
            'protein_g': round(protein_calories / 4, 0),  # 4 cal per gram
            'carbs_g': round(carb_calories / 4, 0),  # 4 cal per gram
            'fat_g': round(fat_calories / 9, 0),  # 9 cal per gram
        }

    @staticmethod
    def calculate_ideal_weight_range(height_cm: float, gender: str) -> Tuple[float, float]:
        """
        Calculate ideal weight range based on height.

        Args:
            height_cm: Height in centimeters
            gender: 'male' or 'female'

        Returns:
            Tuple of (min_weight_kg, max_weight_kg)
        """
        # Based on BMI range 18.5-24.9
        height_m = height_cm / 100
        min_weight = 18.5 * (height_m ** 2)
        max_weight = 24.9 * (height_m ** 2)

        return (round(min_weight, 1), round(max_weight, 1))

    @staticmethod
    def estimate_calories_burned(
        exercise_type: str,
        duration_minutes: int,
        weight_kg: float,
        intensity: int = 5
    ) -> int:
        """
        Estimate calories burned during exercise.

        Args:
            exercise_type: Type of exercise
            duration_minutes: Duration in minutes
            weight_kg: Weight in kilograms
            intensity: Intensity level (1-10)

        Returns:
            Estimated calories burned
        """
        # MET (Metabolic Equivalent of Task) values
        met_values = {
            'walking': 3.5,
            'running': 8.0,
            'cycling': 6.0,
            'swimming': 7.0,
            'yoga': 3.0,
            'strength': 5.0,
            'cardio': 7.0,
            'sports': 6.5,
            'flexibility': 2.5,
            'other': 5.0,
        }

        base_met = met_values.get(exercise_type.lower(), 5.0)

        # Adjust MET based on intensity (1-10 scale)
        intensity_multiplier = 0.7 + (intensity * 0.06)  # Range: 0.76 to 1.3
        adjusted_met = base_met * intensity_multiplier

        # Calories = MET × weight (kg) × duration (hours)
        calories = adjusted_met * weight_kg * (duration_minutes / 60)

        return int(round(calories, 0))

    @staticmethod
    def calculate_sleep_efficiency(
        total_hours: float,
        deep_sleep_hours: Optional[float] = None,
        rem_sleep_hours: Optional[float] = None,
        awake_time_hours: Optional[float] = None
    ) -> float:
        """
        Calculate sleep efficiency percentage.

        Args:
            total_hours: Total time in bed
            deep_sleep_hours: Hours of deep sleep
            rem_sleep_hours: Hours of REM sleep
            awake_time_hours: Hours awake during sleep

        Returns:
            Sleep efficiency percentage (0-100)
        """
        if awake_time_hours:
            actual_sleep = total_hours - awake_time_hours
            efficiency = (actual_sleep / total_hours) * 100
        else:
            # If no awake time provided, estimate based on sleep quality
            efficiency = 85.0  # Default good efficiency

        return round(min(100, max(0, efficiency)), 2)

    @staticmethod
    def calculate_health_score(
        bmi: Optional[float] = None,
        sleep_avg: Optional[float] = None,
        exercise_days: Optional[int] = None,
        nutrition_score: Optional[float] = None,
        blood_pressure_systolic: Optional[int] = None,
        heart_rate: Optional[int] = None,
    ) -> Dict[str, any]:
        """
        Calculate overall health score (0-100).

        Components:
        - BMI Score (20 points)
        - Sleep Score (20 points)
        - Exercise Score (25 points)
        - Nutrition Score (20 points)
        - Vitals Score (15 points)

        Returns:
            Dictionary with overall score and breakdown
        """
        scores = {}

        # 1. BMI Score (20 points)
        if bmi:
            if 18.5 <= bmi < 25:
                bmi_score = 20
            elif 17 <= bmi < 18.5 or 25 <= bmi < 27:
                bmi_score = 15
            elif 16 <= bmi < 17 or 27 <= bmi < 30:
                bmi_score = 10
            else:
                bmi_score = 5
        else:
            bmi_score = 0
        scores['bmi'] = {'score': bmi_score, 'max': 20}

        # 2. Sleep Score (20 points)
        if sleep_avg:
            if 7 <= sleep_avg <= 9:
                sleep_score = 20
            elif 6 <= sleep_avg < 7 or 9 < sleep_avg <= 10:
                sleep_score = 15
            elif 5 <= sleep_avg < 6 or 10 < sleep_avg <= 11:
                sleep_score = 10
            else:
                sleep_score = 5
        else:
            sleep_score = 0
        scores['sleep'] = {'score': sleep_score, 'max': 20}

        # 3. Exercise Score (25 points)
        if exercise_days is not None:
            if exercise_days >= 5:
                exercise_score = 25
            elif exercise_days >= 3:
                exercise_score = 20
            elif exercise_days >= 1:
                exercise_score = 15
            else:
                exercise_score = 5
        else:
            exercise_score = 0
        scores['exercise'] = {'score': exercise_score, 'max': 25}

        # 4. Nutrition Score (20 points)
        if nutrition_score is not None:
            # Assume nutrition_score is 0-100
            nutrition_points = (nutrition_score / 100) * 20
        else:
            nutrition_points = 0
        scores['nutrition'] = {'score': round(nutrition_points, 2), 'max': 20}

        # 5. Vitals Score (15 points)
        vitals_score = 0
        vitals_checks = 0

        if blood_pressure_systolic:
            vitals_checks += 1
            if 90 <= blood_pressure_systolic <= 120:
                vitals_score += 7.5
            elif 121 <= blood_pressure_systolic <= 129:
                vitals_score += 5
            else:
                vitals_score += 2.5

        if heart_rate:
            vitals_checks += 1
            if 60 <= heart_rate <= 80:
                vitals_score += 7.5
            elif 50 <= heart_rate < 60 or 80 < heart_rate <= 100:
                vitals_score += 5
            else:
                vitals_score += 2.5

        scores['vitals'] = {'score': round(vitals_score, 2), 'max': 15}

        # Calculate total
        total_score = sum(s['score'] for s in scores.values())
        max_score = sum(s['max'] for s in scores.values())

        # Calculate percentage
        percentage = (total_score / max_score * 100) if max_score > 0 else 0

        # Determine grade
        if percentage >= 90:
            grade = "A+"
        elif percentage >= 80:
            grade = "A"
        elif percentage >= 70:
            grade = "B"
        elif percentage >= 60:
            grade = "C"
        elif percentage >= 50:
            grade = "D"
        else:
            grade = "F"

        return {
            'overall_score': round(total_score, 2),
            'max_score': max_score,
            'percentage': round(percentage, 2),
            'grade': grade,
            'breakdown': scores
        }

    @staticmethod
    def calculate_nutrition_score(
        calories: int,
        protein: float,
        carbs: float,
        fat: float,
        fiber: Optional[float] = None,
        target_calories: int = 2000,
        target_protein: float = 150,
        target_carbs: float = 200,
        target_fat: float = 65
    ) -> float:
        """
        Calculate nutrition score based on targets (0-100).

        Args:
            calories, protein, carbs, fat: Actual intake
            target_*: Target values

        Returns:
            Nutrition score (0-100)
        """
        scores = []

        # Calorie score (within 10% of target)
        cal_diff = abs(calories - target_calories) / target_calories
        if cal_diff <= 0.1:
            scores.append(100)
        elif cal_diff <= 0.2:
            scores.append(80)
        elif cal_diff <= 0.3:
            scores.append(60)
        else:
            scores.append(40)

        # Protein score
        protein_diff = abs(protein - target_protein) / target_protein
        if protein_diff <= 0.15:
            scores.append(100)
        elif protein_diff <= 0.3:
            scores.append(75)
        else:
            scores.append(50)

        # Carbs score
        carbs_diff = abs(carbs - target_carbs) / target_carbs
        if carbs_diff <= 0.2:
            scores.append(100)
        elif carbs_diff <= 0.4:
            scores.append(75)
        else:
            scores.append(50)

        # Fat score
        fat_diff = abs(fat - target_fat) / target_fat
        if fat_diff <= 0.2:
            scores.append(100)
        elif fat_diff <= 0.4:
            scores.append(75)
        else:
            scores.append(50)

        # Fiber bonus (if provided)
        if fiber and fiber >= 25:
            scores.append(100)
        elif fiber and fiber >= 20:
            scores.append(80)

        return round(sum(scores) / len(scores), 2)

    @staticmethod
    def get_blood_pressure_category(systolic: int, diastolic: int) -> str:
        """Get blood pressure category"""
        if systolic < 120 and diastolic < 80:
            return "Normal"
        elif systolic < 130 and diastolic < 80:
            return "Elevated"
        elif systolic < 140 or diastolic < 90:
            return "High Blood Pressure (Stage 1)"
        elif systolic < 180 or diastolic < 120:
            return "High Blood Pressure (Stage 2)"
        else:
            return "Hypertensive Crisis"

    @staticmethod
    def get_heart_rate_category(heart_rate: int, age: int) -> str:
        """Get heart rate category for adults"""
        max_hr = 220 - age

        if heart_rate < 60:
            return "Below Normal (Bradycardia)"
        elif 60 <= heart_rate <= 100:
            return "Normal"
        elif 100 < heart_rate <= max_hr * 0.7:
            return "Elevated"
        else:
            return "High (Tachycardia)"


# Singleton instance
_calculator = None


def get_health_calculator() -> HealthCalculator:
    """Get or create the singleton calculator instance"""
    global _calculator
    if _calculator is None:
        _calculator = HealthCalculator()
    return _calculator
