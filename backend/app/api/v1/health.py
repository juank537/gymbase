from fastapi import APIRouter, Request
from datetime import datetime, timezone
from ...core.dependencies import limiter

router = APIRouter(tags=["Salud"])

@router.get("/health")
@limiter.limit("20/minute")
async def health(request: Request):
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}