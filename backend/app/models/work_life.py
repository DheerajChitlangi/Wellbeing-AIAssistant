from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Enum, Index, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class MeetingType(str, enum.Enum):
    ONE_ON_ONE = "one_on_one"
    TEAM = "team"
    CLIENT = "client"
    ALL_HANDS = "all_hands"
    STANDUP = "standup"
    PLANNING = "planning"
    REVIEW = "review"
    SOCIAL = "social"
    OTHER = "other"


class SocialActivityType(str, enum.Enum):
    FAMILY = "family"
    FRIENDS = "friends"
    ROMANTIC = "romantic"
    NETWORKING = "networking"
    COMMUNITY = "community"
    HOBBY = "hobby"
    OTHER = "other"


class BoundaryType(str, enum.Enum):
    WORK_HOURS = "work_hours"
    COMMUNICATION = "communication"
    WORKLOAD = "workload"
    PERSONAL_TIME = "personal_time"
    EMOTIONAL = "emotional"
    OTHER = "other"


class WorkSession(Base):
    __tablename__ = "work_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_hours = Column(Float, nullable=False)
    work_type = Column(String, nullable=True)  # coding, meetings, emails, planning, etc.
    project = Column(String, nullable=True)
    is_overtime = Column(Boolean, default=False)
    location = Column(String, nullable=True)  # office, home, hybrid
    breaks_taken = Column(Integer, default=0)
    productivity_rating = Column(Integer, nullable=True)  # 1-10 scale
    stress_level = Column(Integer, nullable=True)  # 1-10 scale
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="work_sessions")

    __table_args__ = (
        Index('ix_work_sessions_user_date', 'user_id', 'start_time'),
    )


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    meeting_type = Column(Enum(MeetingType), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    attendees_count = Column(Integer, nullable=True)
    was_productive = Column(Boolean, nullable=True)
    could_have_been_email = Column(Boolean, nullable=True)
    energy_before = Column(Integer, nullable=True)  # 1-10 scale
    energy_after = Column(Integer, nullable=True)  # 1-10 scale
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="meetings")

    __table_args__ = (
        Index('ix_meetings_user_date', 'user_id', 'start_time'),
        Index('ix_meetings_user_type', 'user_id', 'meeting_type'),
    )


class EnergyLevel(Base):
    __tablename__ = "energy_levels"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    energy_score = Column(Integer, nullable=False)  # 1-10 scale
    mental_clarity = Column(Integer, nullable=True)  # 1-10 scale
    physical_energy = Column(Integer, nullable=True)  # 1-10 scale
    emotional_state = Column(Integer, nullable=True)  # 1-10 scale
    context = Column(String, nullable=True)  # work, personal, social, etc.
    factors = Column(Text, nullable=True)  # JSON string of contributing factors
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="energy_levels")

    __table_args__ = (
        Index('ix_energy_levels_user_timestamp', 'user_id', 'timestamp'),
    )


class SocialActivity(Base):
    __tablename__ = "social_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    activity_type = Column(Enum(SocialActivityType), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_hours = Column(Float, nullable=False)
    people_count = Column(Integer, nullable=True)
    enjoyment_rating = Column(Integer, nullable=True)  # 1-10 scale
    energy_before = Column(Integer, nullable=True)  # 1-10 scale
    energy_after = Column(Integer, nullable=True)  # 1-10 scale
    location = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="social_activities")

    __table_args__ = (
        Index('ix_social_activities_user_date', 'user_id', 'start_time'),
        Index('ix_social_activities_user_type', 'user_id', 'activity_type'),
    )


class Boundary(Base):
    __tablename__ = "boundaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    boundary_type = Column(Enum(BoundaryType), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    rule = Column(Text, nullable=False)  # Specific rule or guideline
    is_active = Column(Boolean, default=True)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    success_count = Column(Integer, default=0)  # Times successfully maintained
    violation_count = Column(Integer, default=0)  # Times violated
    importance = Column(Integer, nullable=False)  # 1-5 scale
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="boundaries")
    violations = relationship("BoundaryViolation", back_populates="boundary", cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_boundaries_user_active', 'user_id', 'is_active'),
        Index('ix_boundaries_user_type', 'user_id', 'boundary_type'),
    )


class BoundaryViolation(Base):
    __tablename__ = "boundary_violations"

    id = Column(Integer, primary_key=True, index=True)
    boundary_id = Column(Integer, ForeignKey("boundaries.id"), nullable=False, index=True)
    violation_date = Column(DateTime(timezone=True), nullable=False, index=True)
    circumstances = Column(Text, nullable=False)
    impact = Column(Integer, nullable=False)  # 1-10 scale
    was_necessary = Column(Boolean, nullable=True)
    lesson_learned = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    boundary = relationship("Boundary", back_populates="violations")
