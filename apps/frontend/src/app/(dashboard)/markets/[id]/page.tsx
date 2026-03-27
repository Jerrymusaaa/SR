'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { marketsApi } from '@/lib/api/markets'
import { betsApi } from '@/lib/api/bets'
import { walletApi } from '@/lib/api/wallet'
import { useAuthStore } from '@/store/auth.store'
import { Market, Wallet } from '@/types'
import { formatCurrency, formatDate, formatRelativeTime, getOddsFromMarket, getCategoryEmoji } from '@/lib/utils'
import { ArrowLeft, Clock, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export default function MarketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const router = useRouter()
  const [market, setMarket] = useState<Market | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [betPosition, setBetPosition] = useState<'yes' | 'no' | null>(null)
  const [betAmount, setBetAmount] = useState('')
  const [betLoading, setBetLoading] = useState(false)
  const [betSuccess, setBetSuccess] = useState('')
  const [betError, setBetError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [marketRes, walletRes] = await Promise.all([marketsApi.getOne(id), walletApi.getBalance()])
        setMarket(marketRes)
        setWallet(walletRes)
      } catch { router.push('/markets') }
      finally { setLoading(false) }
    }
    load()
  }, [id, router])

  const handleBet = async () => {
    if (!betPosition || !betAmount) return
    setBetLoading(true)
    setBetError('')
    setBetSuccess('')
    try {
      await betsApi.place({ marketId: id, position: betPosition, amount: Number(betAmount) })
      setBetSuccess(`Bet placed on ${betPosition.toUpperCase()}!`)
      setBetAmount('')
      setBetPosition(null)
      const [updated, updatedWallet] = await Promise.all([marketsApi.getOne(id), walletApi.getBalance()])
      setMarket(updated)
      setWallet(updatedWallet)
    } catch (err: any) {
      setBetError(err?.response?.data?.message || 'Failed to place bet')
    } finally { setBetLoading(false) }
  }

  if (loading) return <DashboardLayout><LoadingSpinner size="lg" className="mt-20" /></DashboardLayout>
  if (!market) return null

  const odds = getOddsFromMarket(market)
  const isOwner = user?.id === market.creatorId
  const isOpen = market.status === 'open'
  const available = wallet ? Number(wallet.kesBalance) - Number(wallet.lockedBalance) : 0

  return (
    <DashboardLayout>
      <Link href="/markets" className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent mb-6">
        <ArrowLeft size={16} /> Back to Markets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <span>{getCategoryEmoji(market.category)}</span>
              <span className="text-sm text-muted capitalize">{market.category}</span>
              <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${market.status === 'open' ? 'bg-blue-50 text-primary' : 'bg-gray-100 text-muted'}`}>
                {market.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl font-bold text-accent mb-3">{market.question}</h1>
            {market.description && <p className="text-muted text-sm mb-4">{market.description}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5"><Clock size={14} />Resolves {formatDate(market.resolutionDate)} ({formatRelativeTime(market.resolutionDate)})</span>
              <span className="flex items-center gap-1.5"><TrendingUp size={14} />Vol: {formatCurrency(market.totalVolume)}</span>
              <span className="flex items-center gap-1.5"><Users size={14} />By {market.creator?.firstName ?? 'Anonymous'}</span>
            </div>
            {market.outcome !== 'unresolved' && (
              <div className={`mt-4 px-4 py-3 rounded-xl text-sm font-medium ${market.outcome === 'yes' ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'}`}>
                ✓ Resolved: {market.outcome.toUpperCase()}{market.resolutionNotes && ` — ${market.resolutionNotes}`}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="font-semibold text-accent mb-4">Current Odds</h2>
            <div className="space-y-3">
              {(['yes', 'no'] as const).map((pos) => (
                <div key={pos}>
                  <div className="flex justify-between text-sm font-medium mb-1.5">
                    <span className={pos === 'yes' ? 'text-success' : 'text-danger'}>{pos.toUpperCase()}</span>
                    <span className={pos === 'yes' ? 'text-success' : 'text-danger'}>{odds[pos]}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${pos === 'yes' ? 'bg-success' : 'bg-danger'}`} style={{ width: `${odds[pos]}%` }} />
                  </div>
                  <p className="text-xs text-muted mt-1">Pool: {formatCurrency(pos === 'yes' ? market.totalYesAmount : market.totalNoAmount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isOpen && (
            <div className="card">
              <h2 className="font-semibold text-accent mb-4">Place a Bet</h2>
              {betSuccess && <div className="bg-green-50 text-success text-sm px-4 py-3 rounded-xl mb-4">{betSuccess}</div>}
              {betError && <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl mb-4">{betError}</div>}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(['yes', 'no'] as const).map((pos) => (
                  <button key={pos} onClick={() => setBetPosition(pos)}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all ${betPosition === pos ? (pos === 'yes' ? 'bg-success text-white' : 'bg-danger text-white') : (pos === 'yes' ? 'bg-green-50 text-success hover:bg-green-100' : 'bg-red-50 text-danger hover:bg-red-100')}`}>
                    {pos.toUpperCase()} {odds[pos]}%
                  </button>
                ))}
              </div>
              <div className="mb-4">
                <label className="label">Amount (KES)</label>
                <input type="number" className="input" placeholder="Min 10" min={10} value={betAmount} onChange={(e) => setBetAmount(e.target.value)} />
                <p className="text-xs text-muted mt-1.5">Available: {formatCurrency(available)}</p>
              </div>
              <div className="flex gap-2 mb-4">
                {[50, 100, 500, 1000].map((amt) => (
                  <button key={amt} onClick={() => setBetAmount(String(amt))} className="flex-1 py-1.5 text-xs font-medium bg-background border border-border rounded-lg hover:border-primary hover:text-primary transition-colors">{amt}</button>
                ))}
              </div>
              <button onClick={handleBet} disabled={!betPosition || !betAmount || Number(betAmount) < 10 || betLoading} className="btn-primary w-full">
                {betLoading ? 'Placing bet...' : 'Place Bet'}
              </button>
            </div>
          )}

          {isOwner && isOpen && (
            <div className="card">
              <h2 className="font-semibold text-accent mb-4">Market Actions</h2>
              <div className="space-y-2">
                <Link href={`/markets/${id}/resolve`} className="btn-primary w-full text-center block text-sm py-2.5">Resolve Market</Link>
                <button onClick={async () => { if (confirm('Cancel this market?')) { await marketsApi.cancel(id); router.push('/markets') } }} className="btn-danger w-full text-sm py-2.5">Cancel Market</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
