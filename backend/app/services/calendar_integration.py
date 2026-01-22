"""
Calendar Integration Service
Handles integration with calendar providers (Google Calendar, Outlook, Apple Calendar)
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.preferences import UserPreferences
from app.models.work_life import WorkSession, Meeting


class CalendarIntegrationService:
    """Service for calendar integration"""

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    # ==================== GOOGLE CALENDAR ====================

    def get_google_calendar_auth_url(self) -> str:
        """
        Get Google Calendar OAuth2 authorization URL

        To implement:
        1. Install: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
        2. Create OAuth2 credentials in Google Cloud Console
        3. Download credentials.json file
        4. Use the flow below

        Example implementation:
        ```python
        from google_auth_oauthlib.flow import Flow

        flow = Flow.from_client_secrets_file(
            'credentials.json',
            scopes=['https://www.googleapis.com/auth/calendar.readonly'],
            redirect_uri='http://localhost:8000/api/v1/calendar/callback'
        )

        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )

        return authorization_url
        ```
        """

        # Placeholder - implement with actual Google OAuth flow
        return "https://accounts.google.com/o/oauth2/auth?..."

    def handle_google_calendar_callback(self, authorization_code: str) -> Dict[str, Any]:
        """
        Handle Google Calendar OAuth2 callback

        Example implementation:
        ```python
        from google_auth_oauthlib.flow import Flow

        flow = Flow.from_client_secrets_file(
            'credentials.json',
            scopes=['https://www.googleapis.com/auth/calendar.readonly'],
            redirect_uri='http://localhost:8000/api/v1/calendar/callback'
        )

        flow.fetch_token(authorization_response=authorization_response)
        credentials = flow.credentials

        # Store credentials
        preferences = self.db.query(UserPreferences).filter(
            UserPreferences.user_id == self.user_id
        ).first()

        if preferences:
            preferences.calendar_provider = "google"
            preferences.calendar_sync_token = credentials.to_json()
            preferences.calendar_integration_enabled = True
            self.db.commit()

        return {"status": "connected", "provider": "google"}
        ```
        """

        # Placeholder
        return {"status": "connected", "provider": "google"}

    def sync_google_calendar_events(
        self,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Sync events from Google Calendar

        Example implementation:
        ```python
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build

        # Get stored credentials
        preferences = self.db.query(UserPreferences).filter(
            UserPreferences.user_id == self.user_id
        ).first()

        if not preferences or not preferences.calendar_sync_token:
            return {"error": "Not connected to Google Calendar"}

        creds = Credentials.from_authorized_user_info(
            json.loads(preferences.calendar_sync_token)
        )

        service = build('calendar', 'v3', credentials=creds)

        # Set date range
        if not date_from:
            date_from = datetime.utcnow()
        if not date_to:
            date_to = date_from + timedelta(days=7)

        # Fetch events
        events_result = service.events().list(
            calendarId='primary',
            timeMin=date_from.isoformat() + 'Z',
            timeMax=date_to.isoformat() + 'Z',
            singleEvents=True,
            orderBy='startTime'
        ).execute()

        events = events_result.get('items', [])

        # Process and store events
        for event in events:
            self._process_calendar_event(event)

        return {
            "events_synced": len(events),
            "date_from": date_from.isoformat(),
            "date_to": date_to.isoformat()
        }
        ```
        """

        # Placeholder - return mock data
        return {
            "events_synced": 0,
            "date_from": date_from.isoformat() if date_from else None,
            "date_to": date_to.isoformat() if date_to else None
        }

    def _process_calendar_event(self, event: Dict[str, Any]):
        """Process a calendar event and create work session/meeting records"""

        # Extract event details
        summary = event.get('summary', 'Untitled Event')
        start = event['start'].get('dateTime', event['start'].get('date'))
        end = event['end'].get('dateTime', event['end'].get('date'))

        # Parse datetime
        start_time = datetime.fromisoformat(start.replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(end.replace('Z', '+00:00'))

        duration_hours = (end_time - start_time).total_seconds() / 3600

        # Determine if it's a meeting or work session
        attendees = event.get('attendees', [])

        if len(attendees) > 1:
            # It's a meeting
            meeting = Meeting(
                user_id=self.user_id,
                title=summary,
                meeting_date=start_time,
                duration_hours=duration_hours,
                attendee_count=len(attendees),
                is_mandatory=True,
                source="calendar_sync"
            )
            self.db.add(meeting)
        else:
            # It's a work session
            work_session = WorkSession(
                user_id=self.user_id,
                start_time=start_time,
                end_time=end_time,
                duration_hours=duration_hours,
                activity_type="scheduled_work",
                description=summary,
                source="calendar_sync"
            )
            self.db.add(work_session)

        self.db.commit()

    # ==================== WORK HOURS ANALYSIS ====================

    def calculate_work_hours_from_calendar(
        self,
        date_from: datetime,
        date_to: datetime
    ) -> Dict[str, Any]:
        """
        Calculate total work hours from calendar events
        """

        # Get all work sessions and meetings from calendar
        work_sessions = self.db.query(WorkSession).filter(
            WorkSession.user_id == self.user_id,
            WorkSession.start_time >= date_from,
            WorkSession.start_time <= date_to,
            WorkSession.source == "calendar_sync"
        ).all()

        meetings = self.db.query(Meeting).filter(
            Meeting.user_id == self.user_id,
            Meeting.meeting_date >= date_from,
            Meeting.meeting_date <= date_to,
            Meeting.source == "calendar_sync"
        ).all()

        total_work_hours = sum(ws.duration_hours for ws in work_sessions)
        total_meeting_hours = sum(m.duration_hours for m in meetings)

        return {
            "date_from": date_from.isoformat(),
            "date_to": date_to.isoformat(),
            "total_work_hours": total_work_hours,
            "total_meeting_hours": total_meeting_hours,
            "total_hours": total_work_hours + total_meeting_hours,
            "work_sessions_count": len(work_sessions),
            "meetings_count": len(meetings)
        }

    def suggest_calendar_insights(self) -> List[Dict[str, Any]]:
        """
        Generate insights from calendar data
        """

        insights = []

        # Analyze past week
        date_to = datetime.utcnow()
        date_from = date_to - timedelta(days=7)

        analysis = self.calculate_work_hours_from_calendar(date_from, date_to)

        # Check for overwork
        if analysis["total_hours"] > 50:
            insights.append({
                "type": "warning",
                "category": "work_life_balance",
                "title": "High work hours detected",
                "message": f"You worked {analysis['total_hours']:.1f} hours this week. Consider taking breaks and setting boundaries.",
                "severity": "high"
            })

        # Check for excessive meetings
        meeting_percentage = (analysis["total_meeting_hours"] / analysis["total_hours"] * 100) if analysis["total_hours"] > 0 else 0

        if meeting_percentage > 50:
            insights.append({
                "type": "warning",
                "category": "productivity",
                "title": "High meeting load",
                "message": f"{meeting_percentage:.1f}% of your time is spent in meetings. Consider blocking focus time.",
                "severity": "medium"
            })

        # Positive feedback
        if 35 <= analysis["total_hours"] <= 45:
            insights.append({
                "type": "positive",
                "category": "work_life_balance",
                "title": "Good work-life balance",
                "message": f"Your work hours ({analysis['total_hours']:.1f}h) are within a healthy range.",
                "severity": "info"
            })

        return insights

    # ==================== DISCONNECT ====================

    def disconnect_calendar(self) -> Dict[str, Any]:
        """Disconnect calendar integration"""

        preferences = self.db.query(UserPreferences).filter(
            UserPreferences.user_id == self.user_id
        ).first()

        if preferences:
            preferences.calendar_integration_enabled = False
            preferences.calendar_provider = None
            preferences.calendar_sync_token = None
            self.db.commit()

        return {"status": "disconnected"}

    def get_calendar_status(self) -> Dict[str, Any]:
        """Get calendar integration status"""

        preferences = self.db.query(UserPreferences).filter(
            UserPreferences.user_id == self.user_id
        ).first()

        if not preferences:
            return {
                "connected": False,
                "provider": None
            }

        return {
            "connected": preferences.calendar_integration_enabled,
            "provider": preferences.calendar_provider
        }
