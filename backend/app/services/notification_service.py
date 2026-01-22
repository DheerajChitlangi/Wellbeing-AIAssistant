"""
Notification Service
Handles email notifications, push notifications, and scheduled briefings
"""

import asyncio
from datetime import datetime, time as dt_time
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.user import User
from app.models.preferences import UserPreferences, NotificationLog
from app.models.financial import Transaction, Budget
from app.models.health import Biometric, Exercise
from app.models.wellbeing import MoodEntry, SleepEntry
from app.models.productivity import Task


class NotificationService:
    """Service for handling notifications"""

    def __init__(self, db: Session):
        self.db = db

    # ==================== NOTIFICATION CREATION ====================

    async def send_notification(
        self,
        user_id: int,
        notification_type: str,
        category: str,
        title: str,
        message: str,
        delivery_method: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> NotificationLog:
        """Send a notification to a user"""

        # Get user preferences
        preferences = self.db.query(UserPreferences).filter(
            UserPreferences.user_id == user_id
        ).first()

        # Check if notification type is enabled
        if not self._is_notification_enabled(preferences, notification_type, category):
            # Log but don't send
            return self._create_notification_log(
                user_id=user_id,
                notification_type=notification_type,
                category=category,
                title=title,
                message=message,
                status="skipped",
                delivery_method=delivery_method,
                extra_data=extra_data
            )

        # Send notification based on type
        if notification_type == "email":
            await self._send_email_notification(user_id, title, message, delivery_method)
        elif notification_type == "push":
            await self._send_push_notification(user_id, title, message, delivery_method)
        elif notification_type == "in_app":
            # In-app notifications are just logged
            pass

        # Log notification
        return self._create_notification_log(
            user_id=user_id,
            notification_type=notification_type,
            category=category,
            title=title,
            message=message,
            status="sent",
            delivery_method=delivery_method,
            extra_data=extra_data
        )

    def _is_notification_enabled(
        self,
        preferences: Optional[UserPreferences],
        notification_type: str,
        category: str
    ) -> bool:
        """Check if notification type is enabled for user"""

        if not preferences:
            return True  # Default to enabled if no preferences

        # Check type-specific settings
        if notification_type == "email" and not preferences.enable_email_notifications:
            return False
        if notification_type == "push" and not preferences.enable_push_notifications:
            return False

        # Check category-specific settings
        if category == "briefing" and not preferences.daily_briefing_enabled:
            return False
        if category == "alert":
            # Check alert level (would need to be passed in metadata)
            return preferences.alert_critical_enabled or preferences.alert_high_enabled

        return True

    async def _send_email_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        email_address: Optional[str] = None
    ):
        """Send email notification"""

        # Get user email if not provided
        if not email_address:
            user = self.db.query(User).filter(User.id == user_id).first()
            email_address = user.email if user else None

        if not email_address:
            return

        # TODO: Implement actual email sending using SMTP
        # For now, this is a placeholder
        # In production, use aiosmtplib or a service like SendGrid, AWS SES
        print(f"[EMAIL] To: {email_address}, Subject: {title}, Body: {message}")

    async def _send_push_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        device_token: Optional[str] = None
    ):
        """Send push notification"""

        # TODO: Implement actual push notification using FCM, APNs, or OneSignal
        # For now, this is a placeholder
        print(f"[PUSH] To User {user_id}, Title: {title}, Message: {message}")

    def _create_notification_log(
        self,
        user_id: int,
        notification_type: str,
        category: str,
        title: str,
        message: str,
        status: str,
        delivery_method: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> NotificationLog:
        """Create a notification log entry"""

        log = NotificationLog(
            user_id=user_id,
            notification_type=notification_type,
            category=category,
            title=title,
            message=message,
            status=status,
            delivery_method=delivery_method,
            extra_data=extra_data
        )

        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)

        return log

    # ==================== DAILY BRIEFING ====================

    async def generate_daily_briefing(self, user_id: int) -> Dict[str, Any]:
        """Generate daily briefing for user"""

        from datetime import timedelta

        today = datetime.utcnow().date()
        yesterday = today - timedelta(days=1)

        briefing = {
            "date": today.isoformat(),
            "user_id": user_id,
            "summary": {},
            "highlights": [],
            "recommendations": []
        }

        # Financial summary
        transactions = self.db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.date >= yesterday,
                Transaction.date < today
            )
        ).all()

        total_spent = sum(t.amount for t in transactions if t.transaction_type == "expense")
        total_earned = sum(t.amount for t in transactions if t.transaction_type == "income")

        briefing["summary"]["financial"] = {
            "transactions": len(transactions),
            "spent": total_spent,
            "earned": total_earned
        }

        # Health summary
        exercises = self.db.query(Exercise).filter(
            and_(
                Exercise.user_id == user_id,
                Exercise.exercise_date >= yesterday
            )
        ).all()

        total_exercise = sum(e.duration_minutes for e in exercises)

        briefing["summary"]["health"] = {
            "exercises": len(exercises),
            "total_minutes": total_exercise
        }

        # Sleep summary
        sleep = self.db.query(SleepEntry).filter(
            and_(
                SleepEntry.user_id == user_id,
                SleepEntry.date == yesterday
            )
        ).first()

        if sleep:
            briefing["summary"]["sleep"] = {
                "hours": sleep.hours_slept,
                "quality": sleep.quality_rating
            }

        # Productivity summary
        tasks = self.db.query(Task).filter(
            and_(
                Task.user_id == user_id,
                Task.completed_at >= yesterday,
                Task.completed_at < today
            )
        ).all()

        briefing["summary"]["productivity"] = {
            "tasks_completed": len(tasks)
        }

        # Generate highlights
        if total_exercise > 60:
            briefing["highlights"].append("Great job! You exercised for over 60 minutes yesterday.")

        if len(tasks) >= 5:
            briefing["highlights"].append(f"Productive day! You completed {len(tasks)} tasks.")

        if sleep and sleep.hours_slept >= 7:
            briefing["highlights"].append("You got a good night's sleep!")

        return briefing

    async def send_daily_briefing(self, user_id: int):
        """Generate and send daily briefing"""

        briefing = await self.generate_daily_briefing(user_id)

        # Format briefing message
        title = f"Daily Briefing - {briefing['date']}"
        message = self._format_briefing_message(briefing)

        # Send notification
        await self.send_notification(
            user_id=user_id,
            notification_type="email",
            category="briefing",
            title=title,
            message=message,
            extra_data=briefing
        )

    def _format_briefing_message(self, briefing: Dict[str, Any]) -> str:
        """Format briefing data into readable message"""

        lines = [
            f"Daily Briefing for {briefing['date']}",
            "",
            "SUMMARY:",
        ]

        # Financial
        if "financial" in briefing["summary"]:
            fin = briefing["summary"]["financial"]
            lines.append(f"  Financial: {fin['transactions']} transactions, ${fin['spent']:.2f} spent")

        # Health
        if "health" in briefing["summary"]:
            health = briefing["summary"]["health"]
            lines.append(f"  Health: {health['exercises']} exercises, {health['total_minutes']} minutes")

        # Sleep
        if "sleep" in briefing["summary"]:
            sleep = briefing["summary"]["sleep"]
            lines.append(f"  Sleep: {sleep['hours']} hours, quality {sleep['quality']}/10")

        # Productivity
        if "productivity" in briefing["summary"]:
            prod = briefing["summary"]["productivity"]
            lines.append(f"  Productivity: {prod['tasks_completed']} tasks completed")

        # Highlights
        if briefing["highlights"]:
            lines.append("")
            lines.append("HIGHLIGHTS:")
            for highlight in briefing["highlights"]:
                lines.append(f"  ⭐ {highlight}")

        return "\n".join(lines)

    # ==================== ALERTS ====================

    async def check_and_send_alerts(self, user_id: int):
        """Check conditions and send alerts if needed"""

        preferences = self.db.query(UserPreferences).filter(
            UserPreferences.user_id == user_id
        ).first()

        if not preferences:
            return

        # Check budget alerts
        await self._check_budget_alerts(user_id, preferences)

        # Check health alerts
        await self._check_health_alerts(user_id, preferences)

    async def _check_budget_alerts(self, user_id: int, preferences: UserPreferences):
        """Check for budget overspending alerts"""

        from datetime import timedelta

        budgets = self.db.query(Budget).filter(
            and_(
                Budget.user_id == user_id,
                Budget.is_active == True
            )
        ).all()

        for budget in budgets:
            # Calculate spending for budget period
            if budget.period == "monthly":
                period_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
            else:
                period_start = datetime.utcnow() - timedelta(days=7)

            transactions = self.db.query(Transaction).filter(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.category == budget.category,
                    Transaction.transaction_type == "expense",
                    Transaction.date >= period_start
                )
            ).all()

            total_spent = sum(t.amount for t in transactions)
            percentage = (total_spent / budget.amount_limit) * 100 if budget.amount_limit > 0 else 0

            # Check if over threshold
            if percentage >= preferences.spending_alert_threshold:
                await self.send_notification(
                    user_id=user_id,
                    notification_type="email",
                    category="alert",
                    title=f"Budget Alert: {budget.category}",
                    message=f"You've spent {percentage:.1f}% of your {budget.category} budget (${total_spent:.2f} / ${budget.amount_limit:.2f})",
                    extra_data={"budget_id": budget.id, "percentage": percentage}
                )

    async def _check_health_alerts(self, user_id: int, preferences: UserPreferences):
        """Check for health-related alerts"""

        # Check recent biometrics for concerning values
        from datetime import timedelta

        week_ago = datetime.utcnow() - timedelta(days=7)

        biometrics = self.db.query(Biometric).filter(
            and_(
                Biometric.user_id == user_id,
                Biometric.measurement_date >= week_ago
            )
        ).all()

        for bio in biometrics:
            alerts = []

            # Check blood pressure
            if bio.blood_pressure_systolic and bio.blood_pressure_systolic > 140:
                alerts.append("High systolic blood pressure detected")

            # Check heart rate
            if bio.heart_rate and (bio.heart_rate > 100 or bio.heart_rate < 60):
                alerts.append("Unusual heart rate detected")

            if alerts:
                await self.send_notification(
                    user_id=user_id,
                    notification_type="email",
                    category="alert",
                    title="Health Alert",
                    message="\n".join(alerts) + "\n\nConsider consulting with a healthcare professional.",
                    extra_data={"biometric_id": bio.id}
                )

    # ==================== NOTIFICATION RETRIEVAL ====================

    def get_notifications(
        self,
        user_id: int,
        notification_type: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 50
    ) -> List[NotificationLog]:
        """Get user notifications"""

        query = self.db.query(NotificationLog).filter(NotificationLog.user_id == user_id)

        if notification_type:
            query = query.filter(NotificationLog.notification_type == notification_type)

        if category:
            query = query.filter(NotificationLog.category == category)

        return query.order_by(NotificationLog.sent_at.desc()).limit(limit).all()

    def mark_notification_read(self, notification_id: int, user_id: int):
        """Mark notification as read"""

        notification = self.db.query(NotificationLog).filter(
            and_(
                NotificationLog.id == notification_id,
                NotificationLog.user_id == user_id
            )
        ).first()

        if notification:
            notification.read_at = datetime.utcnow()
            notification.status = "read"
            self.db.commit()

        return notification
