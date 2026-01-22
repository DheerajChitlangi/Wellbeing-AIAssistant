from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Enum, Index, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class DistractionType(str, enum.Enum):
    SOCIAL_MEDIA = "social_media"
    EMAIL = "email"
    CHAT = "chat"
    PHONE = "phone"
    NOISE = "noise"
    PEOPLE = "people"
    THOUGHTS = "thoughts"
    OTHER = "other"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.TODO, index=True)
    priority = Column(Enum(TaskPriority), nullable=False, default=TaskPriority.MEDIUM, index=True)
    project = Column(String, nullable=True, index=True)
    category = Column(String, nullable=True)
    estimated_minutes = Column(Integer, nullable=True)
    actual_minutes = Column(Integer, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    tags = Column(Text, nullable=True)  # JSON string
    energy_required = Column(Integer, nullable=True)  # 1-10 scale
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="tasks")
    subtasks = relationship("Task", back_populates="parent_task", remote_side=[id])
    parent_task = relationship("Task", back_populates="subtasks", remote_side=[parent_task_id])

    __table_args__ = (
        Index('ix_tasks_user_status', 'user_id', 'status'),
        Index('ix_tasks_user_priority', 'user_id', 'priority'),
        Index('ix_tasks_user_due', 'user_id', 'due_date'),
        Index('ix_tasks_user_project', 'user_id', 'project'),
    )


class DeepWorkSession(Base):
    __tablename__ = "deep_work_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    project = Column(String, nullable=True)
    focus_score = Column(Integer, nullable=False)  # 1-10 scale
    interruptions = Column(Integer, default=0)
    context = Column(String, nullable=True)  # Location, tools used, etc.
    energy_before = Column(Integer, nullable=True)  # 1-10 scale
    energy_after = Column(Integer, nullable=True)  # 1-10 scale
    output_quality = Column(Integer, nullable=True)  # 1-10 self-rated
    was_planned = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="deep_work_sessions")
    task = relationship("Task")

    __table_args__ = (
        Index('ix_deep_work_user_date', 'user_id', 'start_time'),
    )


class ProductivityGoal(Base):
    __tablename__ = "productivity_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    goal_type = Column(String, nullable=False)  # daily, weekly, monthly, yearly, project
    metric = Column(String, nullable=False)  # tasks_completed, deep_work_hours, etc.
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0)
    unit = Column(String, nullable=False)  # tasks, hours, etc.
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    is_completed = Column(Boolean, default=False)
    priority = Column(Integer, default=3)  # 1-5 scale
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="productivity_goals")

    __table_args__ = (
        Index('ix_productivity_goals_user_active', 'user_id', 'is_active'),
        Index('ix_productivity_goals_user_type', 'user_id', 'goal_type'),
    )


class Distraction(Base):
    __tablename__ = "distractions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    distraction_type = Column(Enum(DistractionType), nullable=False, index=True)
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes = Column(Integer, nullable=True)
    impact = Column(Integer, nullable=False)  # 1-10 scale
    deep_work_session_id = Column(Integer, ForeignKey("deep_work_sessions.id"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    was_avoidable = Column(Boolean, nullable=True)
    prevention_strategy = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="distractions")
    deep_work_session = relationship("DeepWorkSession")
    task = relationship("Task")

    __table_args__ = (
        Index('ix_distractions_user_timestamp', 'user_id', 'timestamp'),
        Index('ix_distractions_user_type', 'user_id', 'distraction_type'),
    )


class FlowState(Base):
    __tablename__ = "flow_states"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    deep_work_session_id = Column(Integer, ForeignKey("deep_work_sessions.id"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    activity = Column(String, nullable=False)
    intensity = Column(Integer, nullable=False)  # 1-10 scale
    challenge_level = Column(Integer, nullable=False)  # 1-10 scale
    skill_level = Column(Integer, nullable=False)  # 1-10 scale
    conditions = Column(Text, nullable=True)  # JSON string of conditions that led to flow
    triggers = Column(Text, nullable=True)  # What initiated the flow state
    output_description = Column(Text, nullable=True)
    satisfaction = Column(Integer, nullable=True)  # 1-10 scale
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="flow_states")
    deep_work_session = relationship("DeepWorkSession")
    task = relationship("Task")

    __table_args__ = (
        Index('ix_flow_states_user_time', 'user_id', 'start_time'),
    )


class Pomodoro(Base):
    __tablename__ = "pomodoros"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=25)
    was_completed = Column(Boolean, default=True)
    was_interrupted = Column(Boolean, default=False)
    focus_rating = Column(Integer, nullable=True)  # 1-10 scale
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="pomodoros")
    task = relationship("Task")

    __table_args__ = (
        Index('ix_pomodoros_user_time', 'user_id', 'start_time'),
    )
