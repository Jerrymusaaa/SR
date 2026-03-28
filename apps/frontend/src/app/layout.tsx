import type { Metadata } from 'next'
import '../styles/globals.css'
import { SolanaWalletProvider } from '@/components/solana/WalletProvider'

export const metadata: Metadata = {
  title: 'SOKO — Kenyan Prediction Markets',
  description: 'Predict, bet, and win on real-world events in Kenya',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
      </body>
    </html>
  )
}
