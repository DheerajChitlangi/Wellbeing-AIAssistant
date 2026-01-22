from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserPreferences(Base):
    """User preferences and settings"""
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)

    # Notification Preferences
    enable_email_notifications = Column(Boolean, default=True)
    enable_push_notifications = Column(Boolean, default=True)
    daily_briefing_enabled = Column(Boolean, default=True)
    daily_briefing_time = Column(String, default="08:00")  # HH:MM format
    weekly_review_enabled = Column(Boolean, default=True)
    alert_critical_enabled = Column(Boolean, default=True)
    alert_high_enabled = Column(Boolean, default=True)
    alert_medium_enabled = Column(Boolean, default=False)

    # Target Goals
    target_sleep_hours = Column(Float, default=8.0)
    target_exercise_minutes = Column(Integer, default=30)
    target_work_hours = Column(Float, default=8.0)
    target_deep_work_hours = Column(Float, default=4.0)
    target_savings_rate = Column(Float, default=20.0)  # percentage

    # Thresholds
    burnout_warning_threshold = Column(Integer, default=60)  # 0-100
    spending_alert_threshold = Column(Float, default=80.0)  # percentage of budget

    # Privacy Settings
    data_sharing_enabled = Column(Boolean, default=False)
    analytics_enabled = Column(Boolean, default=True)

    # UI Preferences
    theme = Column(String, default="light")  # light, dark, auto
    language = Column(String, default="en")
    timezone = Column(String, default="UTC")
    currency = Column(String, default="USD")

    # Integration Settings
    calendar_integration_enabled = Column(Boolean, default=False)
    calendar_provider = Column(String, nullable=True)  # google, outlook, apple
    calendar_sync_token = Column(Text, nullable=True)

    # Customization
    custom_categories = Column(JSON, nullable=True)  # User-defined categories
    custom_goals = Column(JSON, nullable=True)  # Custom goal definitions

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User")


class NotificationLog(Base):
    """Log of all notifications sent to users"""
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    notification_type = Column(String, nullable=False)  # email, push, in_app
    category = Column(String, nullable=False)  # briefing, alert, reminder, achievement
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)

    status = Column(String, default="sent")  # sent, delivered, read, failed
    delivery_method = Column(String, nullable=True)  # email address, device token, etc

    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)

    extra_data = Column(JSON, nullable=True)  # Additional context (renamed from metadata to avoid SQLAlchemy reserved word)

    # Relationships
    user = relationship("User")


class DataExport(Base):
    """Track data export requests"""
    __tablename__ = "data_exports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    export_format = Column(String, nullable=False)  # json, csv, pdf
    export_type = Column(String, nullable=False)  # full, partial, specific_pillar

    status = Column(String, default="pending")  # pending, processing, completed, failed
    file_path = Column(String, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)

    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Auto-delete after X days

    error_message = Column(Text, nullable=True)

    # Relationships
    user = relationship("User")
