from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response, JSONResponse
from contextlib import asynccontextmanager
from .core.config import get_settings
from datetime import datetime, timezone
import logging
import json


logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("gymbase")

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers.update({
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Cache-Control": "no-store, no-cache, must-revalidate"
        })
        return response

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = datetime.now(timezone.utc)
        response = await call_next(request)
        latency = (datetime.now(timezone.utc) - start).total_seconds()
        if request.url.path.startswith("/api/") and response.status_code >= 400:
            logger.warning(f"AUDIT | {request.method} {request.url.path} | {response.status_code} | {latency:.3f}s")
        return response

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 GymBase API iniciado | Modo: Desarrollo")
    yield
    logger.info("🛑 GymBase API detenido")

app = FastAPI(title=settings.project_name, version="0.2.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda r, e: JSONResponse({"detail": "Demasiadas peticiones"}, status_code=429))
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(AuditMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
# falta el fichero auth en api/v1, pero lo añado para que se vea la estructura de rutas
# falta el fichero users en api/v1, pero lo añado para que se vea la estructura de rutass
from .api.v1.auth import router as auth_router
from .api.v1.users import router as users_router
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")


@app.get("/health")
@limiter.limit("20/minute")
async def health(request: Request):
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}