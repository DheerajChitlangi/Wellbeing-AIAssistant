"""
AI-Powered Intelligence Engine for Wellbeing Analysis
Provides correlation analysis, insights, recommendations, and predictions
"""

import numpy as np
from scipy import stats
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.financial import Transaction, Budget, FinancialGoal
from app.models.health import Meal, Biometric, Exercise as HealthExercise
from app.models.work_life import WorkSession, Meeting, BoundaryViolation
from app.models.productivity import Task, DeepWorkSession, Distraction, TaskStatus
from app.models.wellbeing import MoodEntry, SleepEntry
from app.models.intelligence import Correlation, Insight, Recommendation, Prediction


class IntelligenceEngine:
    """Core intelligence engine for cross-pillar analysis"""

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    # ==================== CORRELATION ANALYSIS ====================

    def analyze_correlations(self, days: int = 90) -> List[Dict[str, Any]]:
        """Analyze correlations between metrics across all pillars"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        correlations = []

        # Get time series data for various metrics
        financial_data = self._get_financial_timeseries(cutoff_date)
        health_data = self._get_health_timeseries(cutoff_date)
        worklife_data = self._get_worklife_timeseries(cutoff_date)
        productivity_data = self._get_productivity_timeseries(cutoff_date)
        wellbeing_data = self._get_wellbeing_timeseries(cutoff_date)

        # Analyze cross-pillar correlations
        correlations.extend(self._correlate_spending_vs_stress(financial_data, wellbeing_data))
        correlations.extend(self._correlate_work_hours_vs_health(worklife_data, health_data))
        correlations.extend(self._correlate_sleep_vs_productivity(health_data, productivity_data))
        correlations.extend(self._correlate_exercise_vs_mood(health_data, wellbeing_data))
        correlations.extend(self._correlate_meetings_vs_focus(worklife_data, productivity_data))

        return correlations

    def _calculate_correlation(
        self,
        data1: List[float],
        data2: List[float],
        pillar_1: str,
        metric_1: str,
        pillar_2: str,
        metric_2: str
    ) -> Optional[Dict[str, Any]]:
        """Calculate Pearson correlation between two metrics"""
        if len(data1) < 10 or len(data2) < 10 or len(data1) != len(data2):
            return None

        corr_coef, p_value = stats.pearsonr(data1, data2)

        # Determine strength and significance
        abs_corr = abs(corr_coef)
        if abs_corr < 0.3:
            strength = "weak"
        elif abs_corr < 0.7:
            strength = "moderate"
        else:
            strength = "strong"

        is_significant = p_value < 0.05
        direction = "positive" if corr_coef > 0 else "negative"

        return {
            "pillar_1": pillar_1,
            "metric_1": metric_1,
            "pillar_2": pillar_2,
            "metric_2": metric_2,
            "correlation_coefficient": round(corr_coef, 3),
            "p_value": round(p_value, 4),
            "sample_size": len(data1),
            "strength": strength,
            "direction": direction,
            "is_significant": is_significant,
        }

    # ==================== INSIGHT GENERATION ====================

    def generate_insights(self, time_period: str = "daily") -> List[Dict[str, Any]]:
        """Generate insights across all pillars"""
        insights = []

        if time_period == "daily":
            days = 1
        elif time_period == "weekly":
            days = 7
        else:  # monthly
            days = 30

        cutoff_date = datetime.utcnow() - timedelta(days=days)

        # Financial insights
        insights.extend(self._analyze_spending_patterns(cutoff_date))
        insights.extend(self._analyze_savings_rate(cutoff_date))

        # Health insights
        insights.extend(self._analyze_nutrition_trends(cutoff_date))
        insights.extend(self._analyze_exercise_consistency(cutoff_date))
        insights.extend(self._analyze_sleep_quality(cutoff_date))

        # Work-life insights
        insights.extend(self._analyze_work_hours(cutoff_date))
        insights.extend(self._analyze_boundary_violations(cutoff_date))

        # Productivity insights
        insights.extend(self._analyze_task_completion(cutoff_date))
        insights.extend(self._analyze_focus_patterns(cutoff_date))
        insights.extend(self._analyze_distractions(cutoff_date))

        # Cross-pillar insights
        insights.extend(self._analyze_overall_wellbeing(cutoff_date))

        return insights

    def _analyze_spending_patterns(self, cutoff_date: datetime) -> List[Dict[str, Any]]:
        """Analyze spending patterns and anomalies"""
        insights = []

        transactions = self.db.query(Transaction).filter(
            Transaction.user_id == self.user_id,
            Transaction.date >= cutoff_date,
            Transaction.transaction_type == 'expense'
        ).all()

        if not transactions:
            return insights

        daily_spending = {}
        for t in transactions:
            date = t.date.date()
            daily_spending[date] = daily_spending.get(date, 0) + t.amount

        if daily_spending:
            amounts = list(daily_spending.values())
            avg_spending = np.mean(amounts)
            std_spending = np.std(amounts)

            # Detect anomalies (> 2 std deviations)
            for date, amount in daily_spending.items():
                if amount > avg_spending + 2 * std_spending:
                    insights.append({
                        "type": "anomaly",
                        "pillar": "financial",
                        "title": "Unusual Spending Detected",
                        "description": f"Your spending on {date} was ${amount:.2f}, significantly higher than your average of ${avg_spending:.2f}",
                        "severity": "medium",
                        "data": {"date": str(date), "amount": amount, "average": avg_spending}
                    })

        return insights

    # ==================== RECOMMENDATION ENGINE ====================

    def generate_recommendations(self) -> List[Dict[str, Any]]:
        """Generate actionable recommendations across all pillars"""
        recommendations = []

        # Get recent data
        cutoff_date = datetime.utcnow() - timedelta(days=30)

        # Financial recommendations
        recommendations.extend(self._recommend_financial_actions(cutoff_date))

        # Health recommendations
        recommendations.extend(self._recommend_health_actions(cutoff_date))

        # Work-life recommendations
        recommendations.extend(self._recommend_worklife_actions(cutoff_date))

        # Productivity recommendations
        recommendations.extend(self._recommend_productivity_actions(cutoff_date))

        # Priority ranking
        recommendations.sort(key=lambda x: (-x["priority"], -self._impact_score(x["expected_impact"])))

        return recommendations[:10]  # Top 10 recommendations

    def _impact_score(self, impact: str) -> int:
        """Convert impact to numeric score"""
        return {"low": 1, "medium": 2, "high": 3}.get(impact, 0)

    # ==================== PREDICTIVE ANALYTICS ====================

    def predict_goal_achievement(self, goal_type: str = "financial") -> List[Dict[str, Any]]:
        """Predict likelihood of achieving goals"""
        predictions = []

        if goal_type == "financial":
            goals = self.db.query(FinancialGoal).filter(
                FinancialGoal.user_id == self.user_id,
                FinancialGoal.target_date > datetime.utcnow()
            ).all()

            for goal in goals:
                progress_rate = self._calculate_progress_rate(goal)
                prediction = self._predict_outcome(goal, progress_rate)
                predictions.append(prediction)

        return predictions

    def predict_burnout_risk(self) -> Dict[str, Any]:
        """Predict burnout risk based on work-life balance metrics"""
        cutoff_date = datetime.utcnow() - timedelta(days=30)

        # Get work hours
        work_sessions = self.db.query(WorkSession).filter(
            WorkSession.user_id == self.user_id,
            WorkSession.start_time >= cutoff_date
        ).all()

        total_work_minutes = sum(s.duration_minutes or 0 for s in work_sessions)
        avg_daily_hours = (total_work_minutes / 60) / 30

        # Get boundary violations
        violations = self.db.query(BoundaryViolation).filter(
            BoundaryViolation.user_id == self.user_id,
            BoundaryViolation.occurred_at >= cutoff_date
        ).count()

        # Get sleep quality
        sleep_entries = self.db.query(SleepEntry).filter(
            SleepEntry.user_id == self.user_id,
            SleepEntry.created_at >= cutoff_date
        ).all()

        avg_sleep_quality = np.mean([s.sleep_quality for s in sleep_entries]) if sleep_entries else 5

        # Calculate burnout risk score
        risk_score = 0
        risk_score += min(40, (avg_daily_hours - 8) * 5) if avg_daily_hours > 8 else 0
        risk_score += min(30, violations * 2.5)
        risk_score += max(0, (7 - avg_sleep_quality) * 4)

        risk_level = "low" if risk_score < 30 else "medium" if risk_score < 60 else "high"
        likelihood = "very_low" if risk_score < 20 else "low" if risk_score < 40 else "medium" if risk_score < 60 else "high" if risk_score < 80 else "very_high"

        return {
            "prediction_type": "burnout",
            "pillar": "worklife",
            "target_metric": "burnout_risk",
            "current_value": risk_score,
            "predicted_value": min(100, risk_score * 1.1),  # Trend projection
            "confidence_level": 75.0,
            "factors": {
                "work_hours": avg_daily_hours,
                "boundary_violations": violations,
                "sleep_quality": avg_sleep_quality
            },
            "trend_direction": "stable" if risk_score < 50 else "declining",
            "likelihood": likelihood,
            "recommendations": self._burnout_prevention_recommendations(risk_score)
        }

    def _burnout_prevention_recommendations(self, risk_score: float) -> List[str]:
        """Generate burnout prevention recommendations"""
        recs = []

        if risk_score > 50:
            recs.append("Schedule immediate time off or vacation")
            recs.append("Reduce work hours to 40 hours per week maximum")

        if risk_score > 30:
            recs.append("Set strict boundaries for after-hours work")
            recs.append("Improve sleep quality through better sleep hygiene")

        recs.append("Practice daily stress management techniques")
        recs.append("Increase physical activity and exercise")

        return recs

    # ==================== DATA RETRIEVAL HELPERS ====================

    def _get_financial_timeseries(self, cutoff_date: datetime) -> Dict[str, List[float]]:
        """Get financial metrics over time"""
        transactions = self.db.query(Transaction).filter(
            Transaction.user_id == self.user_id,
            Transaction.date >= cutoff_date
        ).order_by(Transaction.date).all()

        daily_spending = {}
        for t in transactions:
            if t.transaction_type == 'expense':
                date = t.date.date()
                daily_spending[date] = daily_spending.get(date, 0) + t.amount

        return {"daily_spending": list(daily_spending.values())}

    def _get_health_timeseries(self, cutoff_date: datetime) -> Dict[str, List[float]]:
        """Get health metrics over time"""
        sleep_data = self.db.query(SleepEntry).filter(
            SleepEntry.user_id == self.user_id,
            SleepEntry.created_at >= cutoff_date
        ).order_by(SleepEntry.created_at).all()

        exercise_data = self.db.query(HealthExercise).filter(
            HealthExercise.user_id == self.user_id,
            HealthExercise.performed_at >= cutoff_date
        ).order_by(HealthExercise.performed_at).all()

        return {
            "sleep_hours": [s.sleep_hours for s in sleep_data],
            "sleep_quality": [s.sleep_quality for s in sleep_data],
            "exercise_minutes": [e.duration_minutes for e in exercise_data]
        }

    def _get_worklife_timeseries(self, cutoff_date: datetime) -> Dict[str, List[float]]:
        """Get work-life metrics over time"""
        work_sessions = self.db.query(WorkSession).filter(
            WorkSession.user_id == self.user_id,
            WorkSession.start_time >= cutoff_date
        ).order_by(WorkSession.start_time).all()

        daily_work_hours = {}
        for s in work_sessions:
            date = s.start_time.date()
            daily_work_hours[date] = daily_work_hours.get(date, 0) + (s.duration_minutes or 0) / 60

        return {"daily_work_hours": list(daily_work_hours.values())}

    def _get_productivity_timeseries(self, cutoff_date: datetime) -> Dict[str, List[float]]:
        """Get productivity metrics over time"""
        deep_work = self.db.query(DeepWorkSession).filter(
            DeepWorkSession.user_id == self.user_id,
            DeepWorkSession.start_time >= cutoff_date
        ).order_by(DeepWorkSession.start_time).all()

        return {
            "focus_scores": [dw.focus_score for dw in deep_work],
            "deep_work_minutes": [dw.duration_minutes for dw in deep_work]
        }

    def _get_wellbeing_timeseries(self, cutoff_date: datetime) -> Dict[str, List[float]]:
        """Get wellbeing metrics over time"""
        mood_data = self.db.query(MoodEntry).filter(
            MoodEntry.user_id == self.user_id,
            MoodEntry.created_at >= cutoff_date
        ).order_by(MoodEntry.created_at).all()

        return {
            "mood_scores": [m.mood_score for m in mood_data],
            "stress_levels": [m.stress_level for m in mood_data],
            "energy_levels": [m.energy_level for m in mood_data]
        }

    def _correlate_spending_vs_stress(self, financial_data, wellbeing_data) -> List[Dict]:
        """Correlate spending with stress levels"""
        # Implementation placeholder
        return []

    def _correlate_work_hours_vs_health(self, worklife_data, health_data) -> List[Dict]:
        """Correlate work hours with health metrics"""
        # Implementation placeholder
        return []

    def _correlate_sleep_vs_productivity(self, health_data, productivity_data) -> List[Dict]:
        """Correlate sleep with productivity"""
        # Implementation placeholder
        return []

    def _correlate_exercise_vs_mood(self, health_data, wellbeing_data) -> List[Dict]:
        """Correlate exercise with mood"""
        # Implementation placeholder
        return []

    def _correlate_meetings_vs_focus(self, worklife_data, productivity_data) -> List[Dict]:
        """Correlate meeting load with focus"""
        # Implementation placeholder
        return []

    def _analyze_savings_rate(self, cutoff_date) -> List[Dict]:
        return []

    def _analyze_nutrition_trends(self, cutoff_date) -> List[Dict]:
        return []

    def _analyze_exercise_consistency(self, cutoff_date) -> List[Dict]:
        return []

    def _analyze_sleep_quality(self, cutoff_date) -> List[Dict]:
        return []

    def _analyze_work_hours(self, cutoff_date) -> List[Dict]:
        return []

    def _analyze_boundary_violations(self, cutoff_date) -> List[Dict]:
        return []

    def _analyze_task_completion(self, cutoff_date) -> List[Dict]:
        return []

    def _analyze_focus_patterns(self, cutoff_date) -> List[Dict]:
        return []

    def _analyze_distractions(self, cutoff_date) -> List[Dict]:
        return []

    def _analyze_overall_wellbeing(self, cutoff_date) -> List[Dict]:
        return []

    def _recommend_financial_actions(self, cutoff_date) -> List[Dict]:
        return []

    def _recommend_health_actions(self, cutoff_date) -> List[Dict]:
        return []

    def _recommend_worklife_actions(self, cutoff_date) -> List[Dict]:
        return []

    def _recommend_productivity_actions(self, cutoff_date) -> List[Dict]:
        return []

    def _calculate_progress_rate(self, goal) -> float:
        return 0.0

    def _predict_outcome(self, goal, progress_rate) -> Dict:
        return {}
