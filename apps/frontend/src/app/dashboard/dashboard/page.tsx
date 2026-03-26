'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { MarketCard } from '@/components/shared/MarketCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuthStore } from '@/store/auth.store'
import { marketsApi } from '@/lib/api/markets'
import { walletApi } from '@/lib/api/wallet'
import { Market, Wallet } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Wallet as WalletIcon, Activity } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [markets, setMarkets] = useState<Market[]>([])
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [marketsRes, walletRes] = await Promise.all([
          marketsApi.getAll({ status: 'open', limit: 6 }),
          walletApi.getBalance(),
        ])
        setMarkets(marketsRes.data)
        setWallet(walletRes)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-accent">
          Good morning, {user?.firstName ?? 'there'} 👋
        </h1>
        <p className="text-muted mt-1">Here&apos;s what&apos;s happening on OKO today</p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="mt-20" />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <WalletIcon size={22} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted">Available Balance</p>
                <p className="text-xl font-bold text-accent">
                  {wallet
                    ? formatCurrency(
                        Number(wallet.kesBalance) - Number(wallet.lockedBalance),
                      )
                    : 'KES 0.00'}
                </p>
              </div>
            </div>

            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={22} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-muted">Active Markets</p>
                <p className="text-xl font-bold text-accent">{markets.length}</p>
              </div>
            </div>

            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Activity size={22} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted">KYC Status</p>
                <p className="text-xl font-bold text-accent capitalize">
                  {user?.kycStatus ?? 'None'}
                </p>
              </div>
            </div>
          </div>

          {/* Markets */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-accent">Trending Markets</h2>
            <a href="/markets" className="text-sm text-primary font-medium hover:underline">
              View all →
            </a>
          </div>

          {markets.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-muted">No open markets yet.</p>
              <a href="/markets" className="btn-primary mt-4 inline-block">
                Browse Markets
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {markets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
