from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.preferences import UserPreferences, NotificationLog
from app.schemas.preferences import (
    UserPreferencesCreate,
    UserPreferencesUpdate,
    UserPreferencesResponse,
    NotificationResponse
)
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("", response_model=UserPreferencesResponse)
def get_user_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get user preferences and settings"""

    preferences = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()

    if not preferences:
        # Create default preferences if none exist
        preferences = UserPreferences(user_id=current_user.id)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)

    return preferences


@router.post("", response_model=UserPreferencesResponse)
def create_user_preferences(
    preferences: UserPreferencesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create user preferences"""

    # Check if preferences already exist
    existing = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Preferences already exist. Use PUT to update.")

    new_preferences = UserPreferences(
        user_id=current_user.id,
        **preferences.dict()
    )

    db.add(new_preferences)
    db.commit()
    db.refresh(new_preferences)

    return new_preferences


@router.put("", response_model=UserPreferencesResponse)
def update_user_preferences(
    preferences: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update user preferences"""

    existing = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Preferences not found. Use POST to create.")

    # Update only provided fields
    update_data = preferences.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(existing, field, value)

    db.commit()
    db.refresh(existing)

    return existing


@router.delete("")
def delete_user_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete user preferences (reset to defaults)"""

    preferences = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()

    if not preferences:
        raise HTTPException(status_code=404, detail="Preferences not found")

    db.delete(preferences)
    db.commit()

    return {"message": "Preferences deleted successfully"}


# ==================== NOTIFICATIONS ====================

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    notification_type: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get user notifications"""

    service = NotificationService(db)
    notifications = service.get_notifications(
        user_id=current_user.id,
        notification_type=notification_type,
        category=category,
        limit=limit
    )

    return notifications


@router.post("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Mark a notification as read"""

    service = NotificationService(db)
    notification = service.mark_notification_read(notification_id, current_user.id)

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    return notification


@router.post("/notifications/test")
async def send_test_notification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Send a test notification to verify settings"""

    service = NotificationService(db)

    notification = await service.send_notification(
        user_id=current_user.id,
        notification_type="email",
        category="test",
        title="Test Notification",
        message="This is a test notification from Wellbeing Copilot.",
        extra_data={"test": True}
    )

    return {
        "message": "Test notification sent",
        "notification_id": notification.id,
        "status": notification.status
    }


@router.post("/briefing/generate")
async def generate_daily_briefing(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Generate and preview daily briefing"""

    service = NotificationService(db)
    briefing = await service.generate_daily_briefing(current_user.id)

    return briefing


@router.post("/briefing/send")
async def send_daily_briefing(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Send daily briefing via email"""

    service = NotificationService(db)
    await service.send_daily_briefing(current_user.id)

    return {"message": "Daily briefing sent successfully"}


@router.post("/alerts/check")
async def check_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Check and send any pending alerts"""

    service = NotificationService(db)
    await service.check_and_send_alerts(current_user.id)

    return {"message": "Alerts checked and sent"}
