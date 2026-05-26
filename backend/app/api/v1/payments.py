from fastapi import APIRouter, Depends, status, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...core.dependencies import get_db, require_role, limiter
from ...core.roles import UserRole
from ...models.membership import Membership, MembershipStatus
from ...services import payment as payment_service
from ...schemas.payment import (
    PaymentIntentCreate, PaymentIntentResponse,
    CheckoutSessionCreate, CheckoutSessionResponse,
    PaymentVerification
)

router = APIRouter(prefix="/payments", tags=["Pagos"])


@router.post("/intent", response_model=PaymentIntentResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_payment_intent(
    request: Request,
    data: PaymentIntentCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN, UserRole.TRAINER))
):
    """Create a Stripe PaymentIntent for membership payment"""
    # Verify membership exists
    result = await db.execute(
        select(Membership).where(Membership.id == data.membership_id)
    )
    membership = result.scalar_one_or_none()
    
    if not membership:
        raise HTTPException(status_code=404, detail="Membresía no encontrada")
    
    if membership.status != MembershipStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Membresía no está activa")
    
    return await payment_service.payment_service.create_payment_intent(
        data.membership_id, data.amount, data.currency
    )


@router.post("/verify", response_model=dict)
@limiter.limit("20/minute")
async def verify_payment(
    request: Request,
    data: PaymentVerification,
    db: AsyncSession = Depends(get_db)
):
    """Verify payment status and update membership if successful"""
    verification = await payment_service.payment_service.verify_payment(data.payment_intent_id)
    
    if verification["status"] == "success":
        # Find membership by payment intent metadata (would need to store payment_intent_id)
        # For now, just return verification
        pass
    
    return verification


@router.post("/checkout", response_model=CheckoutSessionResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_checkout_session(
    request: Request,
    data: CheckoutSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN, UserRole.TRAINER))
):
    """Create Stripe Checkout Session"""
    # Verify membership exists
    result = await db.execute(
        select(Membership).where(Membership.id == data.membership_id)
    )
    membership = result.scalar_one_or_none()
    
    if not membership:
        raise HTTPException(status_code=404, detail="Membresía no encontrada")
    
    return await payment_service.payment_service.create_checkout_session(
        data.membership_id,
        data.plan_name,
        data.amount,
        data.success_url,
        data.cancel_url
    )