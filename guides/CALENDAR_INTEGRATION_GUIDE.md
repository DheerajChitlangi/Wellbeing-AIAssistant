# Calendar Integration Guide

Complete guide to integrate Google Calendar (and other calendar providers) with Wellbeing Copilot.

---

## Overview

Calendar integration allows Wellbeing Copilot to:
- Automatically track work hours from calendar events
- Identify meetings and calculate meeting load
- Analyze work-life balance based on scheduled events
- Provide insights on time management
- Detect boundary violations (work outside hours)

---

## Supported Providers

### 1. Google Calendar (Recommended)
- Most comprehensive API
- Easy OAuth2 setup
- Full event details

### 2. Microsoft Outlook/365 (Future)
- Microsoft Graph API
- Similar OAuth2 flow

### 3. Apple Calendar (Future)
- More restricted API
- Requires iCloud integration

---

## Google Calendar Integration Setup

### Prerequisites

1. **Google Cloud Console Account**
   - Go to: https://console.cloud.google.com/

2. **Required Python Packages**
   ```bash
   pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
   ```

---

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/

2. **Create a New Project**
   - Click "Select a project" → "New Project"
   - Name: "Wellbeing Copilot"
   - Click "Create"

3. **Enable Google Calendar API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

---

## Step 2: Create OAuth2 Credentials

1. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" (for testing)
   - Fill in:
     - App name: "Wellbeing Copilot"
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"

2. **Add Scopes**
   - Click "Add or Remove Scopes"
   - Add: `https://www.googleapis.com/auth/calendar.readonly`
   - Click "Update" and "Save and Continue"

3. **Add Test Users**
   - Add your email as a test user
   - Click "Save and Continue"

4. **Create OAuth2 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Wellbeing Copilot Web Client"
   - Authorized redirect URIs:
     - `http://localhost:8000/api/v1/calendar/callback`
     - `http://localhost:5173/calendar/callback` (for frontend)
   - Click "Create"

5. **Download Credentials**
   - Click "Download JSON"
   - Save as `credentials.json`
   - Place in: `backend/credentials.json`

---

## Step 3: Implement Calendar Endpoints

Create `backend/app/api/endpoints/calendar.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.services.calendar_integration import CalendarIntegrationService

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/auth/url")
def get_auth_url(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get Google Calendar authorization URL"""
    service = CalendarIntegrationService(db, current_user.id)
    auth_url = service.get_google_calendar_auth_url()
    return {"auth_url": auth_url}


@router.get("/callback")
def calendar_callback(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Handle OAuth2 callback"""
    service = CalendarIntegrationService(db, current_user.id)
    result = service.handle_google_calendar_callback(code)
    return result


@router.post("/sync")
def sync_calendar(
    date_from: Optional[datetime] = Query(default=None),
    date_to: Optional[datetime] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Sync calendar events"""
    service = CalendarIntegrationService(db, current_user.id)
    result = service.sync_google_calendar_events(date_from, date_to)
    return result


@router.get("/status")
def get_calendar_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get calendar integration status"""
    service = CalendarIntegrationService(db, current_user.id)
    return service.get_calendar_status()


@router.delete("/disconnect")
def disconnect_calendar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Disconnect calendar integration"""
    service = CalendarIntegrationService(db, current_user.id)
    return service.disconnect_calendar()


@router.get("/work-hours")
def get_work_hours(
    date_from: Optional[datetime] = Query(default=None),
    date_to: Optional[datetime] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Calculate work hours from calendar"""
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
    """Get insights from calendar data"""
    service = CalendarIntegrationService(db, current_user.id)
    return {"insights": service.suggest_calendar_insights()}
```

---

## Step 4: Update Main App

Add calendar router to `backend/app/main.py`:

```python
from app.api.endpoints import calendar

app.include_router(
    calendar.router,
    prefix=f"{settings.API_V1_STR}/calendar",
    tags=["calendar"]
)
```

---

## Step 5: Complete Service Implementation

Update `backend/app/services/calendar_integration.py` with the full implementation (remove placeholders).

Key changes:
1. Implement `get_google_calendar_auth_url()` with actual OAuth flow
2. Implement `handle_google_calendar_callback()` to store credentials
3. Implement `sync_google_calendar_events()` to fetch and store events

---

## Usage Flow

### 1. Connect Calendar

**Frontend/User:**
```
1. User clicks "Connect Calendar"
2. GET /api/v1/calendar/auth/url
3. Redirect user to Google OAuth
4. User authorizes app
5. Google redirects to /api/v1/calendar/callback?code=...
6. Backend exchanges code for credentials
7. Credentials stored in user_preferences.calendar_sync_token
```

### 2. Sync Events

**Backend:**
```python
POST /api/v1/calendar/sync
```

This will:
- Fetch events from Google Calendar
- Parse work sessions and meetings
- Store in database
- Return sync summary

### 3. View Work Hours

**Backend:**
```python
GET /api/v1/calendar/work-hours?date_from=2025-01-01&date_to=2025-01-31
```

Returns:
```json
{
  "total_work_hours": 120.5,
  "total_meeting_hours": 45.0,
  "work_sessions_count": 48,
  "meetings_count": 24
}
```

### 4. Get Insights

**Backend:**
```python
GET /api/v1/calendar/insights
```

Returns:
```json
{
  "insights": [
    {
      "type": "warning",
      "title": "High meeting load",
      "message": "60% of your time is spent in meetings",
      "severity": "high"
    }
  ]
}
```

---

## Security Best Practices

### 1. Protect Credentials
```python
# Store encrypted tokens
from cryptography.fernet import Fernet

key = Fernet.generate_key()
cipher = Fernet(key)

# Encrypt before storing
encrypted_token = cipher.encrypt(token.encode())

# Decrypt when retrieving
decrypted_token = cipher.decrypt(encrypted_token).decode()
```

### 2. Token Refresh
```python
# Implement token refresh logic
if credentials.expired and credentials.refresh_token:
    credentials.refresh(Request())
    # Update stored credentials
```

### 3. Scopes
Only request minimal scopes needed:
- `calendar.readonly` - Read-only access (recommended)
- Avoid `calendar` - Full access (not needed)

---

## Testing

### 1. Manual Test (Swagger UI)

1. Start backend: `uvicorn app.main:app --reload`
2. Open: http://localhost:8000/docs
3. Test endpoints:
   - GET /calendar/auth/url
   - GET /calendar/status
   - POST /calendar/sync

### 2. Automated Tests

```python
# tests/test_calendar_integration.py

def test_calendar_status(client, auth_headers):
    response = client.get("/api/v1/calendar/status", headers=auth_headers)
    assert response.status_code == 200
    assert "connected" in response.json()


def test_sync_calendar(client, auth_headers):
    response = client.post("/api/v1/calendar/sync", headers=auth_headers)
    assert response.status_code == 200
```

---

## Troubleshooting

### Issue: "Access blocked: Authorization Error"

**Solution:**
- Ensure app is in "Testing" mode in OAuth consent screen
- Add your email as a test user

### Issue: "Redirect URI mismatch"

**Solution:**
- Verify redirect URI in Google Console matches exactly
- Include http/https correctly

### Issue: "Token expired"

**Solution:**
- Implement token refresh logic
- Request offline access: `access_type='offline'`

---

## Future Enhancements

1. **Automatic Sync**
   - Implement background task to sync every hour
   - Use Celery or APScheduler

2. **Microsoft Outlook Integration**
   - Similar OAuth flow
   - Microsoft Graph API

3. **Apple Calendar**
   - iCloud API integration

4. **Webhook Support**
   - Real-time event updates
   - Google Calendar push notifications

---

## References

- [Google Calendar API Docs](https://developers.google.com/calendar/api/guides/overview)
- [OAuth2 for Web Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Python Quickstart](https://developers.google.com/calendar/api/quickstart/python)

---

## Summary

Calendar integration is **optional** but highly valuable for:
- Automatic work hour tracking
- Meeting load analysis
- Work-life balance insights

Users can choose to:
1. Use calendar integration for automatic tracking
2. Manually log work sessions
3. Use a combination of both

The implementation provides flexibility while respecting user privacy and control.
