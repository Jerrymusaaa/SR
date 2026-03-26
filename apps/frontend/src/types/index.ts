export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: 'guest' | 'user' | 'moderator' | 'admin'
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected'
  twoFactorEnabled: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Market {
  id: string
  question: string
  description: string | null
  category: 'politics' | 'sports' | 'finance' | 'entertainment' | 'technology' | 'other'
  status: 'pending' | 'open' | 'closed' | 'resolved' | 'cancelled'
  outcome: 'yes' | 'no' | 'unresolved'
  resolutionDate: string
  totalYesAmount: number
  totalNoAmount: number
  totalVolume: number
  resolutionSource: string | null
  resolutionNotes: string | null
  creatorId: string
  creator: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface Bet {
  id: string
  userId: string
  marketId: string
  market?: Market
  position: 'yes' | 'no'
  amount: number
  potentialPayout: number
  oddsAtBet: number
  status: 'active' | 'won' | 'lost' | 'refunded'
  payout: number | null
  createdAt: string
  updatedAt: string
}

export interface Wallet {
  id: string
  userId: string
  kesBalance: number
  okoBalance: number
  lockedBalance: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'bet_placed' | 'bet_won' | 'bet_refund' | 'fee'
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  paymentMethod: 'mpesa' | 'card' | 'crypto' | 'internal'
  amount: number
  currency: string
  reference: string | null
  description: string | null
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
