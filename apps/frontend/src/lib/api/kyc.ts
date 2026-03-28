import { apiClient } from './client'

export const kycApi = {
  getStatus: async () => {
    const res = await apiClient.get<{
      kycStatus: string
      canDeposit: boolean
      canWithdraw: boolean
      canBet: boolean
    }>('/kyc/status')
    return res.data
  },

  createInquiry: async () => {
    const res = await apiClient.post<{
      inquiryId: string
      sessionToken: string
      inquiryUrl: string
    }>('/kyc/inquiry', {})
    return res.data
  },

  getInquiryStatus: async (inquiryId: string) => {
    const res = await apiClient.get(`/kyc/inquiry/${inquiryId}`)
    return res.data
  },

  approveManually: async (userId: string) => {
    const res = await apiClient.post(`/kyc/approve/${userId}`)
    return res.data
  },
}
