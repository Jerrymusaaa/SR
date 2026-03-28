'use client'

import { useState, useEffect } from 'react'
import { kycApi } from '@/lib/api/kyc'
import { useAuthStore } from '@/store/auth.store'
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

export function KycVerification() {
  const { user, fetchUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [inquiryUrl, setInquiryUrl] = useState('')
  const [inquiryId, setInquiryId] = useState('')
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(false)

  const startVerification = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await kycApi.createInquiry()
      setInquiryUrl(res.inquiryUrl)
      setInquiryId(res.inquiryId)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to start verification')
    } finally {
      setLoading(false)
    }
  }

  // Poll for status after user opens Persona
  useEffect(() => {
    if (!inquiryId || !polling) return

    const interval = setInterval(async () => {
      try {
        await fetchUser()
        if (user?.kycStatus === 'approved' || user?.kycStatus === 'rejected') {
          clearInterval(interval)
          setPolling(false)
          setInquiryUrl('')
        }
      } catch {
        // keep polling
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [inquiryId, polling, fetchUser, user?.kycStatus])

  const statusConfig = {
    none: {
      icon: Shield,
      iconBg: 'bg-gray-100',
      iconColor: 'text-muted',
      title: 'Identity Not Verified',
      desc: 'Complete KYC to unlock deposits, withdrawals, and higher bet limits.',
      showButton: true,
    },
    pending: {
      icon: Clock,
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      title: 'Verification In Progress',
      desc: 'Your identity verification is being reviewed. This usually takes a few minutes.',
      showButton: false,
    },
    approved: {
      icon: CheckCircle2,
      iconBg: 'bg-green-50',
      iconColor: 'text-success',
      title: 'Identity Verified',
      desc: 'Your account is fully verified. You have access to all SOKO features.',
      showButton: false,
    },
    rejected: {
      icon: XCircle,
      iconBg: 'bg-red-50',
      iconColor: 'text-danger',
      title: 'Verification Failed',
      desc: 'Your identity verification was unsuccessful. Please try again with valid documents.',
      showButton: true,
    },
  }

  const status = user?.kycStatus ?? 'none'
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.none
  const Icon = config.icon

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={18} className="text-primary" />
        <h2 className="font-semibold text-accent">Identity Verification (KYC)</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {!inquiryUrl ? (
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon size={22} className={config.iconColor} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-accent mb-1">{config.title}</h3>
            <p className="text-sm text-muted mb-4">{config.desc}</p>

            {status === 'approved' && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Deposits', enabled: true },
                  { label: 'Withdrawals', enabled: true },
                  { label: 'High Limits', enabled: true },
                ].map(({ label, enabled }) => (
                  <div key={label} className="bg-green-50 rounded-lg px-3 py-2 text-center">
                    <CheckCircle2 size={14} className="text-success mx-auto mb-1" />
                    <p className="text-xs text-success font-medium">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {status === 'pending' && (
              <div className="flex items-center gap-2 text-sm text-yellow-600">
                <Loader2 size={14} className="animate-spin" />
                Checking verification status...
              </div>
            )}

            {config.showButton && (
              <button
                onClick={startVerification}
                disabled={loading}
                className="btn-primary flex items-center gap-2 text-sm py-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Shield size={15} />
                    {status === 'rejected' ? 'Retry Verification' : 'Start Verification'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield size={24} className="text-primary" />
          </div>
          <h3 className="font-semibold text-accent mb-2">Ready to verify</h3>
          <p className="text-sm text-muted mb-4">
            Click the button below to open the secure Persona verification page.
            Have your national ID or passport ready.
          </p>
          
            href={inquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setPolling(true)}
            className="btn-primary inline-flex items-center gap-2 text-sm mb-3"
          >
            <ExternalLink size={15} />
            Open Verification Page
          </a>
          <p className="text-xs text-muted">
            Opens in a new tab. Come back here after completing verification.
          </p>
          {polling && (
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted">
              <Loader2 size={12} className="animate-spin" />
              Waiting for verification result...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
