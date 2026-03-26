import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const then = new Date(date)
  const diff = then.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return 'Expired'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `${days} days`
  if (days < 30) return `${Math.ceil(days / 7)} weeks`
  return `${Math.ceil(days / 30)} months`
}

export function formatOdds(odds: number) {
  return `${(odds * 100).toFixed(0)}%`
}

export function getOddsFromMarket(market: {
  totalYesAmount: number
  totalNoAmount: number
}) {
  const yes = Number(market.totalYesAmount)
  const no = Number(market.totalNoAmount)
  const total = yes + no
  if (total === 0) return { yes: 50, no: 50 }
  return {
    yes: Number(((yes / total) * 100).toFixed(1)),
    no: Number(((no / total) * 100).toFixed(1)),
  }
}

export function getCategoryEmoji(category: string) {
  const map: Record<string, string> = {
    politics: '🏛️',
    sports: '⚽',
    finance: '📈',
    entertainment: '🎬',
    technology: '💻',
    other: '🔮',
  }
  return map[category] || '🔮'
}
