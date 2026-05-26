import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy'

export const usePayment = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createPaymentIntent = async (membershipId, amount) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/v1/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membership_id: membershipId, amount, currency: 'usd' })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Error al crear pago')
      }
      return await response.json()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createCheckoutSession = async (membershipId, planName, amount, successUrl, cancelUrl) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/v1/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membership_id: membershipId, plan_name: planName, amount, success_url: successUrl, cancel_url: cancelUrl })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Error al crear checkout')
      }
      const { checkout_url } = await response.json()
      window.location.href = checkout_url
      return { success: true }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createPaymentIntent, createCheckoutSession, loading, error }
}

export const PaymentButton = ({ membershipId, amount, planName, variant = 'primary' }) => {
  const { createCheckoutSession, loading, error } = usePayment()

  const handlePayment = async () => {
    const origin = window.location.origin
    await createCheckoutSession(
      membershipId,
      planName,
      amount,
      `${origin}/payment-success`,
      `${origin}/payment-cancel`
    )
  }

  const variants = {
    primary: 'btn-primary',
    success: 'btn-success',
    outline: 'btn-outline'
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        className={`btn ${variants[variant]} w-full`}
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? <span className="loading loading-spinner"></span> : `Pagar $${amount}`}
      </button>
      {error && <div className="alert alert-error text-sm py-2">{error}</div>}
    </div>
  )
}