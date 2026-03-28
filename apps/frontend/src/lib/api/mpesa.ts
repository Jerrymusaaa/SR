import { apiClient } from './client'

export const mpesaApi = {
  stkPush: async (data: {
    phoneNumber: string
    amount: number
    description: string
  }) => {
    const res = await apiClient.post<{
      checkoutRequestId: string
      message: string
    }>('/mpesa/stk-push', data)
    return res.data
  },

  checkStatus: async (checkoutRequestId: string) => {
    const res = await apiClient.get<{
      status: string
      amount: number
      reference: string
    }>(`/mpesa/status/${checkoutRequestId}`)
    return res.data
  },
}
