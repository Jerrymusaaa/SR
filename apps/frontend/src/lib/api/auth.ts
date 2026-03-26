import { apiClient } from './client'
import { AuthTokens, User } from '@/types'

export const authApi = {
  register: async (data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) => {
    const res = await apiClient.post<AuthTokens & { message: string }>(
      '/auth/register',
      data,
    )
    return res.data
  },

  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post<AuthTokens & { message: string }>(
      '/auth/login',
      data,
    )
    return res.data
  },

  logout: async () => {
    const res = await apiClient.post('/auth/logout')
    return res.data
  },

  getMe: async () => {
    const res = await apiClient.get<User>('/users/me')
    return res.data
  },
}
