from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import io
import json

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.export_import_service import ExportImportService
from app.schemas.preferences import (
    DataExportRequest,
    DataExportResponse,
    DataImportRequest,
    DataImportResponse
)

router = APIRouter(prefix="/export-import", tags=["export-import"])


@router.post("/export", response_model=DataExportResponse)
def create_export_request(
    request: DataExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a data export request"""

    service = ExportImportService(db, current_user.id)

    # Create export record
    export_record = service.create_export_record(
        export_format=request.export_format,
        export_type=request.export_type
    )

    return export_record


@router.get("/export/json")
def export_data_json(
    date_from: Optional[datetime] = Query(default=None),
    date_to: Optional[datetime] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Export all user data as JSON"""

    service = ExportImportService(db, current_user.id)

    try:
        data = service.export_all_data_json(date_from, date_to)

        # Return as downloadable file
        json_str = json.dumps(data, indent=2)
        return StreamingResponse(
            io.BytesIO(json_str.encode()),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=wellbeing_data_{datetime.utcnow().strftime('%Y%m%d')}.json"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.get("/export/csv/{pillar}/{entity_type}")
def export_data_csv(
    pillar: str,
    entity_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Export specific entity type as CSV"""

    service = ExportImportService(db, current_user.id)

    try:
        csv_data = service.export_to_csv(pillar, entity_type)

        if not csv_data:
            raise HTTPException(status_code=404, detail="No data found for export")

        return StreamingResponse(
            io.BytesIO(csv_data.encode()),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={pillar}_{entity_type}_{datetime.utcnow().strftime('%Y%m%d')}.csv"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.get("/export/csv/template/{pillar}/{entity_type}")
def get_csv_template(
    pillar: str,
    entity_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get CSV template for import"""

    service = ExportImportService(db, current_user.id)

    try:
        template = service.get_csv_template(pillar, entity_type)

        if not template:
            raise HTTPException(status_code=404, detail="Template not found")

        return StreamingResponse(
            io.BytesIO(template.encode()),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={pillar}_{entity_type}_template.csv"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Template generation failed: {str(e)}")


@router.post("/import/csv", response_model=DataImportResponse)
async def import_data_csv(
    pillar: str = Query(...),
    entity_type: str = Query(...),
    overwrite: bool = Query(default=False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Import data from CSV file"""

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    service = ExportImportService(db, current_user.id)

    try:
        # Read CSV content
        content = await file.read()
        csv_data = content.decode('utf-8')

        # Import data
        result = service.import_from_csv(csv_data, pillar, entity_type, overwrite)

        return DataImportResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.post("/import/json", response_model=DataImportResponse)
async def import_data_json(
    file: UploadFile = File(...),
    overwrite: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Import data from JSON backup file"""

    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="File must be a JSON")

    service = ExportImportService(db, current_user.id)

    try:
        content = await file.read()
        data = json.loads(content.decode('utf-8'))

        # Import data using service
        result = service.import_from_json(data, overwrite)

        return DataImportResponse(**result)

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
