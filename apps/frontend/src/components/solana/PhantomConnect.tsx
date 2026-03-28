'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { solanaApi } from '@/lib/api/solana'
import { formatCurrency } from '@/lib/utils'
import { Coins, Link, CheckCircle2, Loader2 } from 'lucide-react'

export function PhantomConnect() {
  const { publicKey, connected } = useWallet()
  const [balance, setBalance] = useState<{ sol: number; soko: number | null } | null>(null)
  const [linking, setLinking] = useState(false)
  const [linked, setLinked] = useState(false)
  const [airdropping, setAirdropping] = useState(false)
  const [airdropMsg, setAirdropMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(null)
      return
    }

    const fetchBalance = async () => {
      try {
        const bal = await solanaApi.getWalletBalance(publicKey.toBase58())
        setBalance(bal)
      } catch {
        setError('Failed to fetch wallet balance')
      }
    }

    fetchBalance()
  }, [connected, publicKey])

  const handleLinkWallet = async () => {
    if (!publicKey) return
    setLinking(true)
    setError('')
    try {
      await solanaApi.linkWallet(publicKey.toBase58())
      setLinked(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to link wallet')
    } finally {
      setLinking(false)
    }
  }

  const handleAirdrop = async () => {
    if (!publicKey) return
    setAirdropping(true)
    setAirdropMsg('')
    setError('')
    try {
      await solanaApi.airdrop(publicKey.toBase58())
      setAirdropMsg('1 SOL airdropped to your wallet!')
      const bal = await solanaApi.getWalletBalance(publicKey.toBase58())
      setBalance(bal)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Airdrop failed')
    } finally {
      setAirdropping(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Coins size={18} className="text-primary" />
        <h2 className="font-semibold text-accent">$SOKO Token & Phantom Wallet</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {airdropMsg && (
        <div className="bg-green-50 text-success text-sm px-4 py-3 rounded-xl mb-4">
          {airdropMsg}
        </div>
      )}

      {!connected ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Coins size={24} className="text-purple-600" />
          </div>
          <p className="text-sm text-muted mb-4">
            Connect your Phantom wallet to use $SOKO tokens
          </p>
          <WalletMultiButton className="!bg-primary !rounded-xl !text-sm !font-semibold !py-2.5 !px-6" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connected address */}
          <div className="bg-background rounded-xl px-4 py-3">
            <p className="text-xs text-muted mb-1">Connected Wallet</p>
            <p className="text-sm font-mono text-accent truncate">
              {publicKey?.toBase58()}
            </p>
          </div>

          {/* Balances */}
          {balance && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-xl px-4 py-3">
                <p className="text-xs text-muted mb-1">SOL Balance</p>
                <p className="text-lg font-bold text-accent">
                  {balance.sol.toFixed(4)} SOL
                </p>
              </div>
              <div className="bg-background rounded-xl px-4 py-3">
                <p className="text-xs text-muted mb-1">$SOKO Balance</p>
                <p className="text-lg font-bold text-accent">
                  {balance.soko !== null ? `${balance.soko.toLocaleString()} SOKO` : '—'}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!linked ? (
              <button
                onClick={handleLinkWallet}
                disabled={linking}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
              >
                {linking ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Link size={15} />
                )}
                {linking ? 'Linking...' : 'Link to Account'}
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-success text-sm font-medium py-2.5 rounded-xl">
                <CheckCircle2 size={15} />
                Wallet Linked
              </div>
            )}

            <button
              onClick={handleAirdrop}
              disabled={airdropping}
              className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4"
            >
              {airdropping ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                '🪂'
              )}
              {airdropping ? 'Dropping...' : 'Get devnet SOL'}
            </button>
          </div>

          <div className="flex justify-end">
            <WalletMultiButton className="!bg-gray-100 !text-muted !rounded-xl !text-xs !py-2 !px-4 hover:!bg-gray-200" />
          </div>
        </div>
      )}
    </div>
  )
}
