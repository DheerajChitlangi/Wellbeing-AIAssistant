from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


# User Preferences Schemas
class UserPreferencesBase(BaseModel):
    # Notification Preferences
    enable_email_notifications: bool = True
    enable_push_notifications: bool = True
    daily_briefing_enabled: bool = True
    daily_briefing_time: str = "08:00"
    weekly_review_enabled: bool = True
    alert_critical_enabled: bool = True
    alert_high_enabled: bool = True
    alert_medium_enabled: bool = False

    # Target Goals
    target_sleep_hours: float = 8.0
    target_exercise_minutes: int = 30
    target_work_hours: float = 8.0
    target_deep_work_hours: float = 4.0
    target_savings_rate: float = 20.0

    # Thresholds
    burnout_warning_threshold: int = 60
    spending_alert_threshold: float = 80.0

    # Privacy Settings
    data_sharing_enabled: bool = False
    analytics_enabled: bool = True

    # UI Preferences
    theme: str = "light"
    language: str = "en"
    timezone: str = "UTC"
    currency: str = "USD"

    # Integration Settings
    calendar_integration_enabled: bool = False
    calendar_provider: Optional[str] = None
    calendar_sync_token: Optional[str] = None

    # Customization
    custom_categories: Optional[Dict[str, Any]] = None
    custom_goals: Optional[Dict[str, Any]] = None


class UserPreferencesCreate(UserPreferencesBase):
    pass


class UserPreferencesUpdate(BaseModel):
    enable_email_notifications: Optional[bool] = None
    enable_push_notifications: Optional[bool] = None
    daily_briefing_enabled: Optional[bool] = None
    daily_briefing_time: Optional[str] = None
    weekly_review_enabled: Optional[bool] = None
    alert_critical_enabled: Optional[bool] = None
    alert_high_enabled: Optional[bool] = None
    alert_medium_enabled: Optional[bool] = None
    target_sleep_hours: Optional[float] = None
    target_exercise_minutes: Optional[int] = None
    target_work_hours: Optional[float] = None
    target_deep_work_hours: Optional[float] = None
    target_savings_rate: Optional[float] = None
    burnout_warning_threshold: Optional[int] = None
    spending_alert_threshold: Optional[float] = None
    data_sharing_enabled: Optional[bool] = None
    analytics_enabled: Optional[bool] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    currency: Optional[str] = None
    calendar_integration_enabled: Optional[bool] = None
    calendar_provider: Optional[str] = None
    custom_categories: Optional[Dict[str, Any]] = None
    custom_goals: Optional[Dict[str, Any]] = None


class UserPreferencesResponse(UserPreferencesBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Notification Schemas
class NotificationCreate(BaseModel):
    notification_type: str  # email, push, in_app
    category: str  # briefing, alert, reminder, achievement
    title: str
    message: str
    delivery_method: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    notification_type: str
    category: str
    title: str
    message: str
    status: str
    delivery_method: Optional[str] = None
    sent_at: datetime
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    extra_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# Export Schemas
class DataExportRequest(BaseModel):
    export_format: str = Field(..., description="json, csv, or pdf")
    export_type: str = Field(default="full", description="full, partial, or specific_pillar")
    include_pillars: Optional[list[str]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


class DataExportResponse(BaseModel):
    id: int
    user_id: int
    export_format: str
    export_type: str
    status: str
    file_path: Optional[str] = None
    file_size_bytes: Optional[int] = None
    requested_at: datetime
    completed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


# Import Schemas
class DataImportRequest(BaseModel):
    import_format: str = Field(..., description="csv or json")
    pillar: str = Field(..., description="financial, health, worklife, productivity, or wellbeing")
    overwrite_existing: bool = Field(default=False, description="Whether to overwrite existing records")


class DataImportResponse(BaseModel):
    success: bool
    records_imported: int
    records_failed: int
    errors: list[str] = []
    warnings: list[str] = []
