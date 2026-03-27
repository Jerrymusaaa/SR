'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { marketsApi } from '@/lib/api/markets'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ResolveMarketPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [outcome, setOutcome] = useState<'yes' | 'no' | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleResolve = async () => {
    if (!outcome) return
    setLoading(true)
    setError('')
    try {
      await marketsApi.resolve(id, { outcome, resolutionNotes: notes })
      router.push(`/markets/${id}`)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resolve market')
    } finally { setLoading(false) }
  }

  return (
    <DashboardLayout>
      <Link href={`/markets/${id}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent mb-6">
        <ArrowLeft size={16} /> Back to Market
      </Link>
      <div className="max-w-lg">
        <div className="card">
          <h1 className="text-xl font-bold text-accent mb-2">Resolve Market</h1>
          <p className="text-muted text-sm mb-6">Select the correct outcome to settle all bets.</p>
          {error && <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={() => setOutcome('yes')} className={`py-4 rounded-xl font-semibold transition-all ${outcome === 'yes' ? 'bg-success text-white' : 'bg-green-50 text-success hover:bg-green-100'}`}>✓ YES</button>
            <button onClick={() => setOutcome('no')} className={`py-4 rounded-xl font-semibold transition-all ${outcome === 'no' ? 'bg-danger text-white' : 'bg-red-50 text-danger hover:bg-red-100'}`}>✗ NO</button>
          </div>
          <div className="mb-6">
            <label className="label">Resolution Notes (optional)</label>
            <textarea className="input resize-none" rows={3} placeholder="e.g. Based on official results..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button onClick={handleResolve} disabled={!outcome || loading} className="btn-primary w-full">
            {loading ? 'Resolving...' : `Resolve as ${outcome?.toUpperCase() ?? '...'}`}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
