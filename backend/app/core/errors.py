"""
Custom Error Handlers and Exception Classes
"""

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from typing import Union
import logging

logger = logging.getLogger(__name__)


# Custom Exception Classes
class DatabaseError(Exception):
    """Database operation error"""
    def __init__(self, message: str = "Database error occurred"):
        self.message = message
        super().__init__(self.message)


class NotFoundError(Exception):
    """Resource not found error"""
    def __init__(self, resource: str, identifier: Union[int, str]):
        self.message = f"{resource} with id {identifier} not found"
        super().__init__(self.message)


class AuthenticationError(Exception):
    """Authentication error"""
    def __init__(self, message: str = "Authentication failed"):
        self.message = message
        super().__init__(self.message)


class AuthorizationError(Exception):
    """Authorization error"""
    def __init__(self, message: str = "Insufficient permissions"):
        self.message = message
        super().__init__(self.message)


class ValidationError(Exception):
    """Custom validation error"""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


# Error Handlers
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTPException"""
    logger.error(f"HTTP error: {exc.status_code} - {exc.detail} - Path: {request.url.path}")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "type": "http_error",
                "status_code": exc.status_code,
                "message": exc.detail,
                "path": str(request.url.path)
            }
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle validation errors"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })

    logger.warning(f"Validation error on {request.url.path}: {errors}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "type": "validation_error",
                "status_code": 422,
                "message": "Request validation failed",
                "details": errors,
                "path": str(request.url.path)
            }
        }
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle SQLAlchemy errors"""
    logger.error(f"Database error on {request.url.path}: {str(exc)}", exc_info=True)

    # Check for specific error types
    if isinstance(exc, IntegrityError):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "error": {
                    "type": "integrity_error",
                    "status_code": 409,
                    "message": "Database constraint violation",
                    "details": "The operation violates a database constraint (duplicate entry, foreign key, etc.)",
                    "path": str(request.url.path)
                }
            }
        )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "type": "database_error",
                "status_code": 500,
                "message": "A database error occurred",
                "path": str(request.url.path)
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle any unhandled exceptions"""
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "type": "internal_server_error",
                "status_code": 500,
                "message": "An unexpected error occurred",
                "path": str(request.url.path)
            }
        }
    )


async def not_found_exception_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    """Handle NotFoundError"""
    logger.warning(f"Resource not found on {request.url.path}: {exc.message}")

    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": {
                "type": "not_found",
                "status_code": 404,
                "message": exc.message,
                "path": str(request.url.path)
            }
        }
    )


async def authentication_exception_handler(request: Request, exc: AuthenticationError) -> JSONResponse:
    """Handle AuthenticationError"""
    logger.warning(f"Authentication error on {request.url.path}: {exc.message}")

    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "error": {
                "type": "authentication_error",
                "status_code": 401,
                "message": exc.message,
                "path": str(request.url.path)
            }
        }
    )


async def authorization_exception_handler(request: Request, exc: AuthorizationError) -> JSONResponse:
    """Handle AuthorizationError"""
    logger.warning(f"Authorization error on {request.url.path}: {exc.message}")

    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "error": {
                "type": "authorization_error",
                "status_code": 403,
                "message": exc.message,
                "path": str(request.url.path)
            }
        }
    )


# Error response helpers
def error_response(status_code: int, message: str, details: dict = None) -> HTTPException:
    """Create a standardized error response"""
    content = {
        "error": {
            "status_code": status_code,
            "message": message
        }
    }
    if details:
        content["error"]["details"] = details

    raise HTTPException(status_code=status_code, detail=content)
