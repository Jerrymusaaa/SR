'use client'

import { useState, useEffect, useRef } from 'react'
import { mpesaApi } from '@/lib/api/mpesa'
import { Smartphone, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Props {
  onSuccess: () => void
}

type Step = 'form' | 'waiting' | 'success' | 'failed'

export function MpesaDeposit({ onSuccess }: Props) {
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [checkoutRequestId, setCheckoutRequestId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const formatPhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`
    if (digits.startsWith('254') && digits.length === 12) return digits
    if (digits.startsWith('7') && digits.length === 9) return `254${digits}`
    return digits
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formattedPhone = formatPhone(phone)
    if (!/^254[0-9]{9}$/.test(formattedPhone)) {
      setError('Enter a valid Kenyan phone number e.g. 0712 345 678')
      setLoading(false)
      return
    }

    try {
      const res = await mpesaApi.stkPush({
        phoneNumber: formattedPhone,
        amount: Number(amount),
        description: 'SOKO wallet deposit',
      })
      setCheckoutRequestId(res.checkoutRequestId)
      setStep('waiting')
      setPollCount(0)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to initiate M-Pesa payment')
    } finally {
      setLoading(false)
    }
  }

  // Poll for payment status
  useEffect(() => {
    if (step !== 'waiting' || !checkoutRequestId) return

    pollRef.current = setInterval(async () => {
      setPollCount((c) => c + 1)
      try {
        const res = await mpesaApi.checkStatus(checkoutRequestId)
        if (res.status === 'completed') {
          setStep('success')
          clearInterval(pollRef.current!)
          setTimeout(onSuccess, 2000)
        } else if (res.status === 'failed') {
          setStep('failed')
          clearInterval(pollRef.current!)
        }
      } catch {
        // Keep polling
      }
    }, 3000)

    // Stop polling after 2 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollRef.current!)
      if (step === 'waiting') setStep('failed')
    }, 120000)

    return () => {
      clearInterval(pollRef.current!)
      clearTimeout(timeout)
    }
  }, [step, checkoutRequestId, onSuccess])

  if (step === 'waiting') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Loader2 size={28} className="text-primary animate-spin" />
        </div>
        <h3 className="font-semibold text-accent text-lg mb-2">Check your phone</h3>
        <p className="text-muted text-sm mb-1">
          An M-Pesa prompt has been sent to <span className="font-medium text-accent">{phone}</span>
        </p>
        <p className="text-muted text-sm mb-6">
          Enter your PIN to deposit <span className="font-medium text-accent">{formatCurrency(Number(amount))}</span>
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Waiting for confirmation... ({pollCount * 3}s)
        </div>
        <button
          onClick={() => { setStep('form'); clearInterval(pollRef.current!) }}
          className="mt-6 text-sm text-muted hover:text-accent underline"
        >
          Cancel
        </button>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-success" />
        </div>
        <h3 className="font-semibold text-accent text-lg mb-2">Deposit confirmed!</h3>
        <p className="text-muted text-sm">
          {formatCurrency(Number(amount))} has been added to your SOKO wallet.
        </p>
      </div>
    )
  }

  if (step === 'failed') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <XCircle size={28} className="text-danger" />
        </div>
        <h3 className="font-semibold text-accent text-lg mb-2">Payment failed</h3>
        <p className="text-muted text-sm mb-6">
          The M-Pesa payment was not completed. You may have cancelled or the request timed out.
        </p>
        <button onClick={() => setStep('form')} className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="label">M-Pesa Phone Number</label>
        <div className="relative">
          <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="tel"
            className="input pl-10"
            placeholder="0712 345 678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <p className="text-xs text-muted mt-1">Safaricom number registered to your account</p>
      </div>

      <div>
        <label className="label">Amount (KES)</label>
        <input
          type="number"
          className="input"
          placeholder="Min KES 10"
          min={10}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-2">
        {[100, 500, 1000, 2000, 5000].map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setAmount(String(amt))}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              amount === String(amt)
                ? 'bg-primary text-white border-primary'
                : 'bg-background border-border hover:border-primary hover:text-primary'
            }`}
          >
            {amt}
          </button>
        ))}
      </div>

      {amount && Number(amount) >= 10 && (
        <div className="bg-background rounded-xl px-4 py-3 text-sm">
          <div className="flex justify-between text-muted">
            <span>You will receive</span>
            <span className="font-semibold text-accent">{formatCurrency(Number(amount))}</span>
          </div>
          <div className="flex justify-between text-muted mt-1">
            <span>Processing fee</span>
            <span className="text-success">Free</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending prompt...
          </>
        ) : (
          <>
            <Smartphone size={16} />
            Send M-Pesa Prompt
          </>
        )}
      </button>

      <p className="text-xs text-center text-muted">
        You will receive an M-Pesa STK push on your phone. Enter your PIN to confirm.
      </p>
    </form>
  )
}
