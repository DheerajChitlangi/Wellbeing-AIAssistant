from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.api.endpoints import (
    auth,
    wellbeing,
    financial,
    health,
    work_life,
    export_import,
    preferences,
    calendar
)

# Import error handlers and middleware
from app.core.errors import (
    http_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
    general_exception_handler,
    not_found_exception_handler,
    authentication_exception_handler,
    authorization_exception_handler,
    NotFoundError,
    AuthenticationError,
    AuthorizationError
)
from app.core.security_middleware import (
    RateLimitMiddleware,
    SecurityHeadersMiddleware,
    RequestLoggingMiddleware
)

# Import all models to ensure SQLAlchemy can resolve relationships
from app.models import *  # noqa: F401, F403

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Wellbeing Copilot API - Comprehensive health, financial, and productivity tracking"
)

# Add security middleware
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=60)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(NotFoundError, not_found_exception_handler)
app.add_exception_handler(AuthenticationError, authentication_exception_handler)
app.add_exception_handler(AuthorizationError, authorization_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Core routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(
    wellbeing.router, prefix=f"{settings.API_V1_STR}/wellbeing", tags=["wellbeing"]
)
app.include_router(
    financial.router, prefix=f"{settings.API_V1_STR}/financial", tags=["financial"]
)
app.include_router(
    health.router, prefix=f"{settings.API_V1_STR}/health", tags=["health"]
)
app.include_router(
    work_life.router, prefix=f"{settings.API_V1_STR}/worklife", tags=["work-life"]
)

# New routers - Data Management & Integration
app.include_router(
    export_import.router, prefix=f"{settings.API_V1_STR}", tags=["export-import"]
)
app.include_router(
    preferences.router, prefix=f"{settings.API_V1_STR}", tags=["preferences"]
)
app.include_router(
    calendar.router, prefix=f"{settings.API_V1_STR}", tags=["calendar"]
)


@app.get("/")
def root():
    return {
        "message": "Welcome to Wellbeing Copilot API",
        "version": settings.VERSION,
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
