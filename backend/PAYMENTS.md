# GymBase - Integración de Pagos con Stripe

## Configuración

### Backend
1. Obtener claves de Stripe: https://stripe.com
2. Configurar variables de entorno:
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### Frontend
1. Instalar Stripe JS:
```bash
npm install @stripe/stripe-js
```

2. Configurar variable de entorno:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

## Endpoints de Pago

### Crear PaymentIntent
```
POST /api/v1/payments/intent
{
  "membership_id": 1,
  "amount": 29.99,
  "currency": "usd"
}
```

### Crear Checkout Session
```
POST /api/v1/payments/checkout
{
  "membership_id": 1,
  "plan_name": "Basic Plan",
  "amount": 29.99,
  "success_url": "http://localhost:3000/payment-success",
  "cancel_url": "http://localhost:3000/payment-cancel"
}
```

### Verificar Pago
```
POST /api/v1/payments/verify
{
  "payment_intent_id": "pi_xxxxx"
}
```

## Uso en Frontend

```javascript
import { PaymentButton } from './hooks/usePayment'

function MembershipCard({ membershipId, planName, price }) {
  return (
    <PaymentButton
      membershipId={membershipId}
      amount={price}
      planName={planName}
      variant="success"
    />
  )
}
```

## Webhooks (Producción)

Configurar webhook en Stripe Dashboard:
```
POST /api/v1/payments/webhook
```

Evento: `payment_intent.succeeded`
- Actualizar estado de membresía
- Enviar email de confirmación