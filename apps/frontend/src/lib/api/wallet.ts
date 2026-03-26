import { apiClient } from './client'
import { Wallet, Transaction, PaginatedResponse } from '@/types'

export const walletApi = {
  getBalance: async () => {
    const res = await apiClient.get<Wallet>('/wallet/balance')
    return res.data
  },

  deposit: async (data: {
    amount: number
    paymentMethod: string
    phoneNumber?: string
  }) => {
    const res = await apiClient.post<Transaction>('/wallet/deposit', data)
    return res.data
  },

  withdraw: async (data: {
    amount: number
    paymentMethod: string
    phoneNumber?: string
    cryptoAddress?: string
  }) => {
    const res = await apiClient.post<Transaction>('/wallet/withdraw', data)
    return res.data
  },

  getTransactions: async (params?: {
    type?: string
    status?: string
    page?: number
    limit?: number
  }) => {
    const res = await apiClient.get<PaginatedResponse<Transaction>>(
      '/wallet/transactions',
      { params },
    )
    return res.data
  },
}
