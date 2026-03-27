'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { MarketCard } from '@/components/shared/MarketCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { marketsApi } from '@/lib/api/markets'
import { Market } from '@/types'
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = ['all', 'politics', 'sports', 'finance', 'entertainment', 'technology', 'other']
const STATUSES = ['all', 'open', 'resolved', 'cancelled']

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('open')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchMarkets = async () => {
    setLoading(true)
    try {
      const res = await marketsApi.getAll({
        ...(search && { search }),
        ...(category !== 'all' && { category }),
        ...(status !== 'all' && { status }),
        page,
        limit: 12,
      })
      setMarkets(res.data)
      setTotalPages(res.meta.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMarkets() }, [category, status, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchMarkets()
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-accent">Markets</h1>
          <p className="text-muted mt-1">Browse and bet on prediction markets</p>
        </div>
        <Link href="/markets/create" className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <Plus size={16} />
          Create Market
        </Link>
      </div>

      <form onSubmit={handleSearch} className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" className="input pl-10 pr-4" placeholder="Search markets..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </form>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => { setCategory(c); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === c ? 'bg-primary text-white' : 'bg-white border border-border text-muted hover:text-accent'}`}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-accent text-white' : 'bg-white border border-border text-muted hover:text-accent'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="mt-20" />
      ) : markets.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-muted text-lg mb-2">No markets found</p>
          <Link href="/markets/create" className="btn-primary inline-block mt-4">Create Market</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Previous</button>
              <span className="text-sm text-muted px-4">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
