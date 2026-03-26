import { apiClient } from './client'
import { Bet } from '@/types'

export const betsApi = {
  place: async (data: {
    marketId: string
    position: 'yes' | 'no'
    amount: number
  }) => {
    const res = await apiClient.post<Bet>('/bets', data)
    return res.data
  },

  getMyBets: async () => {
    const res = await apiClient.get<Bet[]>('/bets/my-bets')
    return res.data
  },

  getMarketBets: async (marketId: string) => {
    const res = await apiClient.get<Bet[]>(`/bets/market/${marketId}`)
    return res.data
  },
}
