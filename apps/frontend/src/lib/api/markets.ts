import { apiClient } from './client'
import { Market, PaginatedResponse } from '@/types'

export const marketsApi = {
  getAll: async (params?: {
    category?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }) => {
    const res = await apiClient.get<PaginatedResponse<Market>>('/markets', {
      params,
    })
    return res.data
  },

  getOne: async (id: string) => {
    const res = await apiClient.get<Market>(`/markets/${id}`)
    return res.data
  },

  create: async (data: {
    question: string
    description?: string
    category: string
    resolutionDate: string
    resolutionSource?: string
  }) => {
    const res = await apiClient.post<Market>('/markets', data)
    return res.data
  },

  resolve: async (
    id: string,
    data: { outcome: 'yes' | 'no'; resolutionNotes?: string },
  ) => {
    const res = await apiClient.patch<Market>(`/markets/${id}/resolve`, data)
    return res.data
  },

  cancel: async (id: string) => {
    const res = await apiClient.patch<Market>(`/markets/${id}/cancel`)
    return res.data
  },
}
