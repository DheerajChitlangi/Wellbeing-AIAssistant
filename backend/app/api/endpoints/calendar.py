from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.calendar_integration import CalendarIntegrationService

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/auth/url")
def get_auth_url(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get Google Calendar authorization URL

    Returns the OAuth2 URL to redirect users for calendar authorization.
    See CALENDAR_INTEGRATION_GUIDE.md for setup instructions.
    """
    service = CalendarIntegrationService(db, current_user.id)
    auth_url = service.get_google_calendar_auth_url()
    return {"auth_url": auth_url, "provider": "google"}


@router.get("/callback")
def calendar_callback(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Handle OAuth2 callback from calendar provider

    This endpoint receives the authorization code and exchanges it for access tokens.
    """
    service = CalendarIntegrationService(db, current_user.id)
    result = service.handle_google_calendar_callback(code)
    return result


@router.post("/sync")
def sync_calendar(
    date_from: Optional[datetime] = Query(default=None, description="Start date for sync"),
    date_to: Optional[datetime] = Query(default=None, description="End date for sync"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Sync calendar events from connected provider

    Fetches events from the calendar and creates work sessions and meeting records.
    If dates not specified, syncs the next 7 days.
    """
    service = CalendarIntegrationService(db, current_user.id)

    # Default to next 7 days if not specified
    if not date_from:
        date_from = datetime.utcnow()
    if not date_to:
        date_to = date_from + timedelta(days=7)

    result = service.sync_google_calendar_events(date_from, date_to)
    return result


@router.get("/status")
def get_calendar_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get current calendar integration status"""
    service = CalendarIntegrationService(db, current_user.id)
    return service.get_calendar_status()


@router.delete("/disconnect")
def disconnect_calendar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Disconnect calendar integration and remove stored credentials"""
    service = CalendarIntegrationService(db, current_user.id)
    return service.disconnect_calendar()


@router.get("/work-hours")
def get_work_hours(
    date_from: Optional[datetime] = Query(default=None),
    date_to: Optional[datetime] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Calculate total work hours from calendar events

    Analyzes calendar events to calculate:
    - Total work hours
    - Meeting hours
    - Work sessions count
    """
    service = CalendarIntegrationService(db, current_user.id)

    if not date_from:
        date_from = datetime.utcnow() - timedelta(days=7)
    if not date_to:
        date_to = datetime.utcnow()

    return service.calculate_work_hours_from_calendar(date_from, date_to)


@router.get("/insights")
def get_calendar_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get AI-powered insights from calendar data

    Analyzes calendar patterns to provide:
    - Work-life balance warnings
    - Meeting load analysis
    - Recommendations for time management
    """
    service = CalendarIntegrationService(db, current_user.id)
    return {"insights": service.suggest_calendar_insights()}
