from pydantic import BaseModel

class PaymentIntentCreate(BaseModel):
    membership_id: int
    amount: float
    currency: str = "usd"

class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str

class CheckoutSessionCreate(BaseModel):
    membership_id: int
    plan_name: str
    amount: float
    success_url: str
    cancel_url: str

class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str

class PaymentVerification(BaseModel):
    payment_intent_id: str