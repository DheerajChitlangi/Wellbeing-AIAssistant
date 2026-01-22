# Import/Export & Integration API Documentation

Complete API documentation for data import/export, notifications, preferences, and calendar integration features.

---

## Table of Contents

1. [Data Export](#data-export)
2. [Data Import](#data-import)
3. [User Preferences](#user-preferences)
4. [Notifications](#notifications)
5. [Calendar Integration](#calendar-integration)
6. [Usage Examples](#usage-examples)
7. [Error Handling](#error-handling)

---

## Data Export

### Export All Data as JSON

**Endpoint:** `GET /api/v1/export-import/export/json`

**Description:** Export all user data (financial, health, work-life, productivity, wellbeing, intelligence) as a JSON backup file.

**Query Parameters:**
- `date_from` (optional): Start date for filtering data (ISO 8601 format)
- `date_to` (optional): End date for filtering data (ISO 8601 format)

**Response:** File download (JSON)

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/export-import/export/json?date_from=2025-01-01T00:00:00" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o backup.json
```

**Example Response Structure:**
```json
{
  "export_metadata": {
    "user_id": 1,
    "exported_at": "2025-01-15T10:30:00",
    "date_from": "2025-01-01T00:00:00",
    "date_to": null
  },
  "financial": {
    "transactions": [...],
    "budgets": [...],
    "goals": [...]
  },
  "health": {
    "meals": [...],
    "biometrics": [...],
    "exercises": [...]
  },
  "worklife": {...},
  "productivity": {...},
  "wellbeing": {...},
  "intelligence": {...}
}
```

---

### Export Specific Data as CSV

**Endpoint:** `GET /api/v1/export-import/export/csv/{pillar}/{entity_type}`

**Description:** Export specific entity type as CSV file.

**Path Parameters:**
- `pillar`: One of `financial`, `health`, `productivity`, `worklife`, `wellbeing`
- `entity_type`: Specific entity (e.g., `transactions`, `meals`, `tasks`)

**Response:** File download (CSV)

**Examples:**

Export all transactions:
```bash
curl -X GET "http://localhost:8000/api/v1/export-import/export/csv/financial/transactions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o transactions.csv
```

Export all meals:
```bash
curl -X GET "http://localhost:8000/api/v1/export-import/export/csv/health/meals" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o meals.csv
```

---

### Get CSV Template

**Endpoint:** `GET /api/v1/export-import/export/csv/template/{pillar}/{entity_type}`

**Description:** Download CSV template with headers for bulk import.

**Path Parameters:**
- `pillar`: Data pillar
- `entity_type`: Entity type

**Response:** File download (CSV template)

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/export-import/export/csv/template/financial/transactions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o transactions_template.csv
```

**Template Contents:**
```csv
amount,category,description,transaction_type,date
```

---

## Data Import

### Import from CSV

**Endpoint:** `POST /api/v1/export-import/import/csv`

**Description:** Import data from CSV file.

**Query Parameters:**
- `pillar`: Data pillar (required)
- `entity_type`: Entity type (required)
- `overwrite`: Whether to overwrite existing records (default: false)

**Request Body:** File upload (multipart/form-data)

**Response:**
```json
{
  "success": true,
  "records_imported": 45,
  "records_failed": 2,
  "errors": [
    "Row 12: Invalid date format",
    "Row 23: Missing required field 'amount'"
  ],
  "warnings": []
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/export-import/import/csv?pillar=financial&entity_type=transactions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@transactions.csv"
```

---

### Import from JSON

**Endpoint:** `POST /api/v1/export-import/import/json`

**Description:** Import full data backup from JSON file.

**Query Parameters:**
- `overwrite`: Whether to overwrite existing records (default: false)

**Request Body:** File upload (multipart/form-data)

**Response:**
```json
{
  "success": true,
  "records_imported": 1250,
  "records_failed": 8,
  "errors": [...],
  "warnings": [...],
  "details": {
    "financial": {
      "imported": 450,
      "failed": 2
    },
    "health": {
      "imported": 800,
      "failed": 6
    }
  }
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/export-import/import/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@backup.json"
```

---

## User Preferences

### Get User Preferences

**Endpoint:** `GET /api/v1/preferences`

**Description:** Get current user preferences and settings.

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "enable_email_notifications": true,
  "enable_push_notifications": true,
  "daily_briefing_enabled": true,
  "daily_briefing_time": "08:00",
  "weekly_review_enabled": true,
  "alert_critical_enabled": true,
  "alert_high_enabled": true,
  "alert_medium_enabled": false,
  "target_sleep_hours": 8.0,
  "target_exercise_minutes": 30,
  "target_work_hours": 8.0,
  "target_deep_work_hours": 4.0,
  "target_savings_rate": 20.0,
  "burnout_warning_threshold": 60,
  "spending_alert_threshold": 80.0,
  "data_sharing_enabled": false,
  "analytics_enabled": true,
  "theme": "light",
  "language": "en",
  "timezone": "UTC",
  "currency": "USD",
  "calendar_integration_enabled": false,
  "calendar_provider": null,
  "custom_categories": null,
  "custom_goals": null,
  "created_at": "2025-01-15T10:00:00",
  "updated_at": "2025-01-15T12:00:00"
}
```

---

### Update User Preferences

**Endpoint:** `PUT /api/v1/preferences`

**Description:** Update user preferences (partial updates supported).

**Request Body:**
```json
{
  "daily_briefing_enabled": true,
  "daily_briefing_time": "07:30",
  "target_sleep_hours": 7.5,
  "theme": "dark",
  "spending_alert_threshold": 85.0
}
```

**Response:** Updated preferences object

**Example:**
```bash
curl -X PUT "http://localhost:8000/api/v1/preferences" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "daily_briefing_time": "07:30",
    "theme": "dark"
  }'
```

---

## Notifications

### Get Notifications

**Endpoint:** `GET /api/v1/preferences/notifications`

**Description:** Get user's notification history.

**Query Parameters:**
- `notification_type` (optional): Filter by type (`email`, `push`, `in_app`)
- `category` (optional): Filter by category (`briefing`, `alert`, `reminder`, `achievement`)
- `limit` (optional): Max results (default: 50, max: 100)

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "notification_type": "email",
    "category": "briefing",
    "title": "Daily Briefing - 2025-01-15",
    "message": "Your daily summary...",
    "status": "sent",
    "delivery_method": "user@example.com",
    "sent_at": "2025-01-15T08:00:00",
    "delivered_at": "2025-01-15T08:00:05",
    "read_at": null,
    "metadata": {}
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/preferences/notifications?category=alert&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Mark Notification as Read

**Endpoint:** `POST /api/v1/preferences/notifications/{notification_id}/read`

**Description:** Mark a notification as read.

**Path Parameters:**
- `notification_id`: Notification ID

**Response:** Updated notification object

---

### Send Test Notification

**Endpoint:** `POST /api/v1/preferences/notifications/test`

**Description:** Send a test notification to verify settings.

**Response:**
```json
{
  "message": "Test notification sent",
  "notification_id": 123,
  "status": "sent"
}
```

---

### Generate Daily Briefing

**Endpoint:** `POST /api/v1/preferences/briefing/generate`

**Description:** Generate and preview daily briefing without sending.

**Response:**
```json
{
  "date": "2025-01-15",
  "user_id": 1,
  "summary": {
    "financial": {
      "transactions": 8,
      "spent": 125.50,
      "earned": 0
    },
    "health": {
      "exercises": 2,
      "total_minutes": 60
    },
    "sleep": {
      "hours": 7.5,
      "quality": 8
    },
    "productivity": {
      "tasks_completed": 12
    }
  },
  "highlights": [
    "Great job! You exercised for over 60 minutes yesterday.",
    "Productive day! You completed 12 tasks."
  ],
  "recommendations": []
}
```

---

### Send Daily Briefing

**Endpoint:** `POST /api/v1/preferences/briefing/send`

**Description:** Generate and send daily briefing via email.

**Response:**
```json
{
  "message": "Daily briefing sent successfully"
}
```

---

### Check Alerts

**Endpoint:** `POST /api/v1/preferences/alerts/check`

**Description:** Manually trigger alert checks (budget, health, etc.).

**Response:**
```json
{
  "message": "Alerts checked and sent"
}
```

---

## Calendar Integration

### Get Calendar Auth URL

**Endpoint:** `GET /api/v1/calendar/auth/url`

**Description:** Get OAuth2 authorization URL for Google Calendar.

**Response:**
```json
{
  "auth_url": "https://accounts.google.com/o/oauth2/auth?...",
  "provider": "google"
}
```

---

### Calendar OAuth Callback

**Endpoint:** `GET /api/v1/calendar/callback`

**Description:** Handle OAuth2 callback (called by Google).

**Query Parameters:**
- `code`: Authorization code from Google

**Response:**
```json
{
  "status": "connected",
  "provider": "google"
}
```

---

### Sync Calendar Events

**Endpoint:** `POST /api/v1/calendar/sync`

**Description:** Sync events from connected calendar.

**Query Parameters:**
- `date_from` (optional): Start date
- `date_to` (optional): End date

**Response:**
```json
{
  "events_synced": 45,
  "date_from": "2025-01-15T00:00:00",
  "date_to": "2025-01-22T00:00:00"
}
```

---

### Get Calendar Status

**Endpoint:** `GET /api/v1/calendar/status`

**Description:** Check calendar integration status.

**Response:**
```json
{
  "connected": true,
  "provider": "google"
}
```

---

### Disconnect Calendar

**Endpoint:** `DELETE /api/v1/calendar/disconnect`

**Description:** Disconnect calendar integration and remove credentials.

**Response:**
```json
{
  "status": "disconnected"
}
```

---

### Get Work Hours from Calendar

**Endpoint:** `GET /api/v1/calendar/work-hours`

**Description:** Calculate work hours from calendar events.

**Query Parameters:**
- `date_from` (optional): Start date (default: 7 days ago)
- `date_to` (optional): End date (default: today)

**Response:**
```json
{
  "date_from": "2025-01-08T00:00:00",
  "date_to": "2025-01-15T00:00:00",
  "total_work_hours": 42.5,
  "total_meeting_hours": 15.0,
  "total_hours": 57.5,
  "work_sessions_count": 28,
  "meetings_count": 12
}
```

---

### Get Calendar Insights

**Endpoint:** `GET /api/v1/calendar/insights`

**Description:** Get AI-powered insights from calendar data.

**Response:**
```json
{
  "insights": [
    {
      "type": "warning",
      "category": "work_life_balance",
      "title": "High work hours detected",
      "message": "You worked 57.5 hours this week. Consider taking breaks.",
      "severity": "high"
    },
    {
      "type": "warning",
      "category": "productivity",
      "title": "High meeting load",
      "message": "26.1% of your time is spent in meetings.",
      "severity": "medium"
    }
  ]
}
```

---

## Usage Examples

### Complete Export/Import Workflow

```bash
# 1. Export all data as backup
curl -X GET "http://localhost:8000/api/v1/export-import/export/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o backup_$(date +%Y%m%d).json

# 2. Later, restore from backup
curl -X POST "http://localhost:8000/api/v1/export-import/import/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@backup_20250115.json"
```

---

### Bulk Transaction Import

```bash
# 1. Download CSV template
curl -X GET "http://localhost:8000/api/v1/export-import/export/csv/template/financial/transactions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o transactions_template.csv

# 2. Fill in the template with your data

# 3. Import the CSV
curl -X POST "http://localhost:8000/api/v1/export-import/import/csv?pillar=financial&entity_type=transactions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@my_transactions.csv"
```

---

### Set Up Daily Briefings

```bash
# 1. Update preferences to enable daily briefing
curl -X PUT "http://localhost:8000/api/v1/preferences" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "daily_briefing_enabled": true,
    "daily_briefing_time": "08:00",
    "enable_email_notifications": true
  }'

# 2. Test the briefing
curl -X POST "http://localhost:8000/api/v1/preferences/briefing/generate" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Send manually (in production, this would be automated)
curl -X POST "http://localhost:8000/api/v1/preferences/briefing/send" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Calendar Integration Flow

```bash
# 1. Get auth URL
AUTH_RESPONSE=$(curl -X GET "http://localhost:8000/api/v1/calendar/auth/url" \
  -H "Authorization: Bearer YOUR_TOKEN")

# 2. Redirect user to auth_url (in browser)

# 3. After OAuth, sync calendar
curl -X POST "http://localhost:8000/api/v1/calendar/sync" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Check work hours
curl -X GET "http://localhost:8000/api/v1/calendar/work-hours" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Get insights
curl -X GET "http://localhost:8000/api/v1/calendar/insights" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "detail": "File must be a CSV"
}
```

**401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found**
```json
{
  "detail": "Preferences not found. Use POST to create."
}
```

**500 Internal Server Error**
```json
{
  "detail": "Import failed: Invalid date format"
}
```

---

## Best Practices

### Data Export
1. **Regular Backups**: Export JSON backups weekly
2. **Date Filtering**: Use date ranges for large datasets
3. **Storage**: Keep backups in multiple locations

### Data Import
1. **Test First**: Use small CSV files for testing
2. **Validate Data**: Check CSV format matches template
3. **Review Errors**: Check import response for failed records

### Notifications
1. **Preferences**: Configure notification settings before enabling
2. **Test Notifications**: Use test endpoint to verify setup
3. **Email Setup**: Configure SMTP settings in production

### Calendar Integration
1. **Privacy**: Only request `calendar.readonly` scope
2. **Sync Frequency**: Sync daily or weekly, not constantly
3. **Review Data**: Check synced events for accuracy

---

## Production Considerations

### Email Setup

To enable email notifications in production:

1. Uncomment email packages in requirements.txt
2. Configure SMTP settings:
   ```python
   # .env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

3. Update notification_service.py with actual SMTP implementation

### Calendar Integration

1. Create Google Cloud project (see CALENDAR_INTEGRATION_GUIDE.md)
2. Download credentials.json
3. Implement OAuth flow in calendar_integration.py
4. Store credentials securely (encrypted)

### Background Tasks

For scheduled notifications:
1. Install APScheduler or Celery
2. Create background job for daily briefings
3. Schedule alert checks

---

## Testing

All endpoints are available in Swagger UI:
```
http://localhost:8000/docs
```

Filter by tags:
- `export-import`: Data export/import endpoints
- `preferences`: User preferences and settings
- `calendar`: Calendar integration

---

## Support

For issues or questions:
- See STARTUP_GUIDE.md for general setup
- See CALENDAR_INTEGRATION_GUIDE.md for calendar setup
- Check Swagger UI for interactive API docs
- Review error messages in API responses
