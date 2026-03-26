'use client'

import Link from 'next/link'
import { Market } from '@/types'
import {
  formatCurrency,
  formatRelativeTime,
  getOddsFromMarket,
  getCategoryEmoji,
} from '@/lib/utils'

interface Props {
  market: Market
}

export function MarketCard({ market }: Props) {
  const odds = getOddsFromMarket(market)

  return (
    <Link href={`/markets/${market.id}`}>
      <div className="card hover:shadow-md transition-shadow duration-200 cursor-pointer h-full flex flex-col">
        {/* Category + Timer */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted flex items-center gap-1">
            <span>{getCategoryEmoji(market.category)}</span>
            <span className="capitalize">{market.category}</span>
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              market.status === 'open'
                ? 'bg-blue-50 text-primary'
                : market.status === 'resolved'
                  ? 'bg-gray-100 text-muted'
                  : 'bg-yellow-50 text-yellow-600'
            }`}
          >
            {market.status === 'open'
              ? `Closes ${formatRelativeTime(market.resolutionDate)}`
              : market.status.charAt(0).toUpperCase() + market.status.slice(1)}
          </span>
        </div>

        {/* Question */}
        <p className="font-semibold text-accent leading-snug mb-4 flex-1">
          {market.question}
        </p>

        {/* Odds bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-success">YES {odds.yes}%</span>
            <span className="text-danger">NO {odds.no}%</span>
          </div>
          <div className="h-2 rounded-full bg-red-100 overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${odds.yes}%` }}
            />
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Vol: {formatCurrency(market.totalVolume)}</span>
          {market.outcome !== 'unresolved' && (
            <span
              className={
                market.outcome === 'yes' ? 'text-success font-medium' : 'text-danger font-medium'
              }
            >
              Resolved: {market.outcome.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
