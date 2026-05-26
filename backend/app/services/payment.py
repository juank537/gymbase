import stripe
from typing import Dict, Any
from datetime import datetime, timezone
from fastapi import HTTPException, status
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

class PaymentService:
    @staticmethod
    async def create_payment_intent(
        membership_id: int,
        amount: float,
        currency: str = "usd"
    ) -> Dict[str, Any]:
        """Create a Stripe PaymentIntent for membership payment"""
        if not stripe.api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stripe configuration missing"
            )
        
        try:
            # Convert amount to cents (Stripe expects smallest currency unit)
            amount_cents = int(amount * 100)
            
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                metadata={
                    "membership_id": str(membership_id),
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                automatic_payment_methods={"enabled": True}
            )
            
            return {
                "client_secret": payment_intent.client_secret,
                "payment_intent_id": payment_intent.id
            }
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Payment error: {str(e)}"
            )
    
    @staticmethod
    async def verify_payment(payment_intent_id: str) -> Dict[str, Any]:
        """Verify payment status"""
        if not stripe.api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stripe configuration missing"
            )
        
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if payment_intent.status == "succeeded":
                return {
                    "status": "success",
                    "payment_intent_id": payment_intent.id,
                    "amount": payment_intent.amount / 100,
                    "currency": payment_intent.currency
                }
            elif payment_intent.status == "requires_payment_method":
                return {"status": "requires_payment"}
            elif payment_intent.status == "requires_action":
                return {"status": "requires_action"}
            else:
                return {"status": payment_intent.status}
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Payment verification error: {str(e)}"
            )
    
    @staticmethod
    async def create_checkout_session(
        membership_id: int,
        plan_name: str,
        amount: float,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, str]:
        """Create Stripe Checkout Session"""
        if not stripe.api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stripe configuration missing"
            )
        
        try:
            amount_cents = int(amount * 100)
            
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": plan_name,
                            "description": f"Membership payment ID: {membership_id}"
                        },
                        "unit_amount": amount_cents
                    },
                    "quantity": 1
                }],
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={"membership_id": str(membership_id)}
            )
            
            return {
                "checkout_url": session.url,
                "session_id": session.id
            }
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Checkout creation error: {str(e)}"
            )

payment_service = PaymentService()