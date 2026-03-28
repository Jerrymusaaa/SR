import { apiClient } from './client'

export const solanaApi = {
  getNetworkInfo: async () => {
    const res = await apiClient.get('/solana/network')
    return res.data
  },

  getTokenInfo: async () => {
    const res = await apiClient.get('/solana/token-info')
    return res.data
  },

  getWalletBalance: async (walletAddress: string) => {
    const res = await apiClient.get<{ sol: number; soko: number | null }>(
      `/solana/balance/${walletAddress}`,
    )
    return res.data
  },

  linkWallet: async (walletAddress: string) => {
    const res = await apiClient.post('/solana/link-wallet', { walletAddress })
    return res.data
  },

  airdrop: async (walletAddress: string) => {
    const res = await apiClient.post(`/solana/airdrop/${walletAddress}`)
    return res.data
  },
}
