"""
Security Middleware for Rate Limiting and Request Validation
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta
from typing import Dict, Tuple
import time
import logging

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiting middleware

    For production, use Redis-based rate limiting like slowapi or fastapi-limiter
    """

    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = {}  # {ip: [timestamp1, timestamp2, ...]}

    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host

        # Skip rate limiting for health check
        if request.url.path in ["/health", "/", "/docs", "/openapi.json"]:
            return await call_next(request)

        # Get current time
        current_time = time.time()

        # Initialize if first request from this IP
        if client_ip not in self.requests:
            self.requests[client_ip] = []

        # Remove old requests (older than 1 minute)
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if current_time - req_time < 60
        ]

        # Check rate limit
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": {
                        "type": "rate_limit_exceeded",
                        "status_code": 429,
                        "message": f"Too many requests. Maximum {self.requests_per_minute} requests per minute allowed.",
                        "retry_after": 60
                    }
                }
            )

        # Add current request
        self.requests[client_ip].append(current_time)

        # Process request
        response = await call_next(request)

        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            self.requests_per_minute - len(self.requests[client_ip])
        )
        response.headers["X-RateLimit-Reset"] = str(int(current_time + 60))

        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests for monitoring and debugging"""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Log request
        logger.info(f"Request: {request.method} {request.url.path} from {request.client.host}")

        # Process request
        try:
            response = await call_next(request)
        except Exception as exc:
            logger.error(f"Request failed: {request.method} {request.url.path} - {str(exc)}")
            raise

        # Calculate duration
        duration = time.time() - start_time

        # Log response
        logger.info(
            f"Response: {request.method} {request.url.path} - "
            f"Status: {response.status_code} - Duration: {duration:.2f}s"
        )

        # Add timing header
        response.headers["X-Process-Time"] = f"{duration:.2f}s"

        return response


# Input validation helpers
def validate_pagination(skip: int = 0, limit: int = 100) -> Tuple[int, int]:
    """Validate and sanitize pagination parameters"""
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip parameter must be non-negative"
        )

    if limit < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit parameter must be positive"
        )

    if limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit parameter cannot exceed 100"
        )

    return skip, limit


def validate_date_range(date_from: datetime, date_to: datetime) -> Tuple[datetime, datetime]:
    """Validate date range"""
    if date_from > date_to:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before end date"
        )

    # Limit to 1 year range
    if (date_to - date_from).days > 365:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date range cannot exceed 1 year"
        )

    return date_from, date_to


def sanitize_string(value: str, max_length: int = 1000) -> str:
    """Sanitize string input"""
    if not value:
        return value

    # Remove null bytes
    value = value.replace('\x00', '')

    # Trim whitespace
    value = value.strip()

    # Limit length
    if len(value) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Input exceeds maximum length of {max_length} characters"
        )

    return value
