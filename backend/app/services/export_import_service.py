"""
Data Export and Import Service
Handles exporting user data to JSON/CSV and importing from CSV templates
"""

import json
import csv
import io
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.financial import Transaction, Budget, FinancialGoal
from app.models.health import Meal, Biometric, Exercise
from app.models.work_life import WorkSession, Meeting, BoundaryViolation
from app.models.productivity import Task, DeepWorkSession, Distraction, ProductivityGoal
from app.models.wellbeing import MoodEntry, SleepEntry
from app.models.analytics import Correlation, Recommendation
from app.models.preferences import DataExport


class ExportImportService:
    """Service for handling data export and import operations"""

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    # ==================== EXPORT METHODS ====================

    def export_all_data_json(
        self,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Export all user data as JSON"""

        export_data = {
            "export_metadata": {
                "user_id": self.user_id,
                "exported_at": datetime.utcnow().isoformat(),
                "date_from": date_from.isoformat() if date_from else None,
                "date_to": date_to.isoformat() if date_to else None,
            },
            "financial": self._export_financial_data(date_from, date_to),
            "health": self._export_health_data(date_from, date_to),
            "worklife": self._export_worklife_data(date_from, date_to),
            "productivity": self._export_productivity_data(date_from, date_to),
            "wellbeing": self._export_wellbeing_data(date_from, date_to),
            "intelligence": self._export_intelligence_data(date_from, date_to),
        }

        return export_data

    def _export_financial_data(
        self,
        date_from: Optional[datetime],
        date_to: Optional[datetime]
    ) -> Dict[str, Any]:
        """Export financial pillar data"""

        query_filter = [Transaction.user_id == self.user_id]
        if date_from:
            query_filter.append(Transaction.date >= date_from)
        if date_to:
            query_filter.append(Transaction.date <= date_to)

        transactions = self.db.query(Transaction).filter(and_(*query_filter)).all()
        budgets = self.db.query(Budget).filter(Budget.user_id == self.user_id).all()
        goals = self.db.query(FinancialGoal).filter(FinancialGoal.user_id == self.user_id).all()

        return {
            "transactions": [self._model_to_dict(t) for t in transactions],
            "budgets": [self._model_to_dict(b) for b in budgets],
            "goals": [self._model_to_dict(g) for g in goals],
        }

    def _export_health_data(
        self,
        date_from: Optional[datetime],
        date_to: Optional[datetime]
    ) -> Dict[str, Any]:
        """Export health pillar data"""

        meals = self.db.query(Meal).filter(Meal.user_id == self.user_id).all()
        biometrics = self.db.query(Biometric).filter(Biometric.user_id == self.user_id).all()
        exercises = self.db.query(Exercise).filter(Exercise.user_id == self.user_id).all()

        return {
            "meals": [self._model_to_dict(m) for m in meals],
            "biometrics": [self._model_to_dict(b) for b in biometrics],
            "exercises": [self._model_to_dict(e) for e in exercises],
        }

    def _export_worklife_data(
        self,
        date_from: Optional[datetime],
        date_to: Optional[datetime]
    ) -> Dict[str, Any]:
        """Export work-life pillar data"""

        sessions = self.db.query(WorkSession).filter(WorkSession.user_id == self.user_id).all()
        meetings = self.db.query(Meeting).filter(Meeting.user_id == self.user_id).all()
        violations = self.db.query(BoundaryViolation).filter(
            BoundaryViolation.user_id == self.user_id
        ).all()

        return {
            "work_sessions": [self._model_to_dict(s) for s in sessions],
            "meetings": [self._model_to_dict(m) for m in meetings],
            "boundary_violations": [self._model_to_dict(v) for v in violations],
        }

    def _export_productivity_data(
        self,
        date_from: Optional[datetime],
        date_to: Optional[datetime]
    ) -> Dict[str, Any]:
        """Export productivity pillar data"""

        tasks = self.db.query(Task).filter(Task.user_id == self.user_id).all()
        deep_work = self.db.query(DeepWorkSession).filter(
            DeepWorkSession.user_id == self.user_id
        ).all()
        distractions = self.db.query(Distraction).filter(
            Distraction.user_id == self.user_id
        ).all()
        goals = self.db.query(ProductivityGoal).filter(
            ProductivityGoal.user_id == self.user_id
        ).all()

        return {
            "tasks": [self._model_to_dict(t) for t in tasks],
            "deep_work_sessions": [self._model_to_dict(d) for d in deep_work],
            "distractions": [self._model_to_dict(d) for d in distractions],
            "goals": [self._model_to_dict(g) for g in goals],
        }

    def _export_wellbeing_data(
        self,
        date_from: Optional[datetime],
        date_to: Optional[datetime]
    ) -> Dict[str, Any]:
        """Export wellbeing data"""

        mood_entries = self.db.query(MoodEntry).filter(
            MoodEntry.user_id == self.user_id
        ).all()
        sleep_entries = self.db.query(SleepEntry).filter(
            SleepEntry.user_id == self.user_id
        ).all()

        return {
            "mood_entries": [self._model_to_dict(m) for m in mood_entries],
            "sleep_entries": [self._model_to_dict(s) for s in sleep_entries],
        }

    def _export_intelligence_data(
        self,
        date_from: Optional[datetime],
        date_to: Optional[datetime]
    ) -> Dict[str, Any]:
        """Export intelligence/analytics data"""

        correlations = self.db.query(Correlation).filter(
            Correlation.user_id == self.user_id
        ).all()
        recommendations = self.db.query(Recommendation).filter(
            Recommendation.user_id == self.user_id
        ).all()

        return {
            "correlations": [self._model_to_dict(c) for c in correlations],
            "recommendations": [self._model_to_dict(r) for r in recommendations],
        }

    def export_to_csv(self, pillar: str, entity_type: str) -> str:
        """Export specific entity type to CSV format"""

        # Map pillar and entity_type to query
        data = self._get_data_for_csv_export(pillar, entity_type)

        if not data:
            return ""

        # Convert to CSV
        output = io.StringIO()
        if data:
            fieldnames = data[0].keys()
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)

        return output.getvalue()

    def _get_data_for_csv_export(self, pillar: str, entity_type: str) -> List[Dict]:
        """Get data for specific entity type"""

        if pillar == "financial":
            if entity_type == "transactions":
                items = self.db.query(Transaction).filter(
                    Transaction.user_id == self.user_id
                ).all()
            elif entity_type == "budgets":
                items = self.db.query(Budget).filter(Budget.user_id == self.user_id).all()
            else:
                return []
        elif pillar == "health":
            if entity_type == "meals":
                items = self.db.query(Meal).filter(Meal.user_id == self.user_id).all()
            elif entity_type == "exercises":
                items = self.db.query(Exercise).filter(Exercise.user_id == self.user_id).all()
            else:
                return []
        elif pillar == "productivity":
            if entity_type == "tasks":
                items = self.db.query(Task).filter(Task.user_id == self.user_id).all()
            else:
                return []
        else:
            return []

        return [self._model_to_dict(item) for item in items]

    # ==================== IMPORT METHODS ====================

    def import_from_csv(
        self,
        csv_data: str,
        pillar: str,
        entity_type: str,
        overwrite: bool = False
    ) -> Dict[str, Any]:
        """Import data from CSV"""

        result = {
            "success": True,
            "records_imported": 0,
            "records_failed": 0,
            "errors": [],
            "warnings": [],
        }

        try:
            reader = csv.DictReader(io.StringIO(csv_data))
            rows = list(reader)

            for row_num, row in enumerate(rows, start=1):
                try:
                    self._import_row(pillar, entity_type, row, overwrite)
                    result["records_imported"] += 1
                except Exception as e:
                    result["records_failed"] += 1
                    result["errors"].append(f"Row {row_num}: {str(e)}")

            self.db.commit()

        except Exception as e:
            result["success"] = False
            result["errors"].append(f"Import failed: {str(e)}")
            self.db.rollback()

        return result

    def _import_row(
        self,
        pillar: str,
        entity_type: str,
        row: Dict[str, Any],
        overwrite: bool
    ):
        """Import a single row of data"""

        # Remove id if present (will be auto-generated)
        row.pop('id', None)
        row['user_id'] = self.user_id

        # Convert string dates to datetime objects
        for key, value in row.items():
            if 'date' in key.lower() or 'time' in key.lower() or 'at' in key.lower():
                if value and isinstance(value, str):
                    try:
                        row[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    except:
                        pass

        # Create appropriate model instance
        if pillar == "financial" and entity_type == "transactions":
            obj = Transaction(**row)
        elif pillar == "health" and entity_type == "meals":
            obj = Meal(**row)
        elif pillar == "productivity" and entity_type == "tasks":
            obj = Task(**row)
        else:
            raise ValueError(f"Unsupported entity type: {pillar}/{entity_type}")

        self.db.add(obj)

    # ==================== HELPER METHODS ====================

    def _model_to_dict(self, model) -> Dict[str, Any]:
        """Convert SQLAlchemy model instance to dictionary"""

        result = {}
        for column in model.__table__.columns:
            value = getattr(model, column.name)

            # Convert datetime to ISO format string
            if isinstance(value, datetime):
                value = value.isoformat()

            result[column.name] = value

        return result

    def create_export_record(
        self,
        export_format: str,
        export_type: str
    ) -> DataExport:
        """Create a data export record"""

        export_record = DataExport(
            user_id=self.user_id,
            export_format=export_format,
            export_type=export_type,
            status="pending",
            expires_at=datetime.utcnow() + timedelta(days=7),
        )

        self.db.add(export_record)
        self.db.commit()
        self.db.refresh(export_record)

        return export_record

    def get_csv_template(self, pillar: str, entity_type: str) -> str:
        """Generate CSV template with headers for import"""

        templates = {
            "financial.transactions": [
                "amount", "category", "description", "transaction_type", "date"
            ],
            "health.meals": [
                "meal_type", "food_items", "calories", "protein", "carbs", "fats", "meal_time"
            ],
            "productivity.tasks": [
                "title", "description", "status", "priority", "project", "due_date"
            ],
        }

        template_key = f"{pillar}.{entity_type}"
        if template_key not in templates:
            return ""

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(templates[template_key])

        return output.getvalue()

    def import_from_json(
        self,
        json_data: Dict[str, Any],
        overwrite: bool = False
    ) -> Dict[str, Any]:
        """Import data from JSON backup file"""

        result = {
            "success": True,
            "records_imported": 0,
            "records_failed": 0,
            "errors": [],
            "warnings": [],
            "details": {}
        }

        try:
            # Validate structure
            if "export_metadata" not in json_data:
                raise ValueError("Invalid backup file: missing export_metadata")

            # Import each pillar
            pillars = ["financial", "health", "worklife", "productivity", "wellbeing", "intelligence"]

            for pillar in pillars:
                if pillar not in json_data:
                    continue

                pillar_result = self._import_pillar_data(pillar, json_data[pillar], overwrite)
                result["records_imported"] += pillar_result["imported"]
                result["records_failed"] += pillar_result["failed"]
                result["errors"].extend(pillar_result["errors"])
                result["warnings"].extend(pillar_result["warnings"])
                result["details"][pillar] = pillar_result

            self.db.commit()

        except Exception as e:
            result["success"] = False
            result["errors"].append(f"Import failed: {str(e)}")
            self.db.rollback()

        return result

    def _import_pillar_data(
        self,
        pillar: str,
        pillar_data: Dict[str, Any],
        overwrite: bool
    ) -> Dict[str, Any]:
        """Import data for a specific pillar"""

        result = {
            "imported": 0,
            "failed": 0,
            "errors": [],
            "warnings": []
        }

        # Map pillar and entity types to models
        model_map = {
            "financial": {
                "transactions": Transaction,
                "budgets": Budget,
                "goals": FinancialGoal
            },
            "health": {
                "meals": Meal,
                "biometrics": Biometric,
                "exercises": Exercise
            },
            "worklife": {
                "work_sessions": WorkSession,
                "meetings": Meeting,
                "boundary_violations": BoundaryViolation
            },
            "productivity": {
                "tasks": Task,
                "deep_work_sessions": DeepWorkSession,
                "distractions": Distraction,
                "goals": ProductivityGoal
            },
            "wellbeing": {
                "mood_entries": MoodEntry,
                "sleep_entries": SleepEntry
            }
        }

        if pillar not in model_map:
            result["warnings"].append(f"Unknown pillar: {pillar}")
            return result

        # Import each entity type
        for entity_type, records in pillar_data.items():
            if entity_type not in model_map[pillar]:
                result["warnings"].append(f"Unknown entity type: {pillar}.{entity_type}")
                continue

            model_class = model_map[pillar][entity_type]

            for record in records:
                try:
                    # Remove id and set user_id
                    record.pop('id', None)
                    record['user_id'] = self.user_id

                    # Convert ISO strings back to datetime
                    for key, value in record.items():
                        if isinstance(value, str) and ('date' in key.lower() or 'time' in key.lower() or 'at' in key.lower()):
                            try:
                                record[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                            except:
                                pass

                    # Create model instance
                    obj = model_class(**record)
                    self.db.add(obj)
                    result["imported"] += 1

                except Exception as e:
                    result["failed"] += 1
                    result["errors"].append(f"{pillar}.{entity_type}: {str(e)}")

        return result
