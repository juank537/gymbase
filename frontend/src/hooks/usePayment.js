import { useState } from 'react'
import api from '../services/api'
import { extractApiError } from '../utils/errorHandler'

export const usePayment = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createPaymentIntent = async (membershipId, amount) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/payments/intent', { membership_id: membershipId, amount, currency: 'usd' })
      return data
    } catch (err) {
      const msg = extractApiError(err)
      setError(msg)
      throw new Error(msg, { cause: err })
    } finally {
      setLoading(false)
    }
  }

  const createCheckoutSession = async (membershipId, planName, amount, successUrl, cancelUrl) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/payments/checkout', {
        membership_id: membershipId,
        plan_name: planName,
        amount,
        success_url: successUrl,
        cancel_url: cancelUrl
      })
      window.location.href = data.checkout_url
      return { success: true }
    } catch (err) {
      const msg = extractApiError(err)
      setError(msg)
      throw new Error(msg, { cause: err })
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
