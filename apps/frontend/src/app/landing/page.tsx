'use client'

import Link from 'next/link'
import { TrendingUp, Shield, Zap, Globe } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-xl text-accent">SOKO</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted hover:text-accent transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary text-sm py-2 px-4">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary text-sm font-medium px-4 py-2 rounded-full mb-8">
          <Zap size={14} />
          Built for Kenya, Powered by Solana
        </div>
        <h1 className="text-5xl font-bold text-accent leading-tight mb-6">
          Predict the future.<br />
          <span className="text-primary">Win real money.</span>
        </h1>
        <p className="text-xl text-muted max-w-2xl mx-auto mb-10">
          Kenya&apos;s first prediction market platform. Bet on politics, sports,
          finance and more using M-Pesa, cards, or crypto.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="btn-primary text-base">
            Start Predicting
          </Link>
          <Link href="/markets" className="btn-secondary text-base">
            Browse Markets
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-20">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-accent text-center mb-12">
            Why SOKO?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'Dynamic Odds',
                desc: 'Real-time odds based on market liquidity',
              },
              {
                icon: Shield,
                title: 'KYC Verified',
                desc: 'Safe, compliant, and fraud-protected',
              },
              {
                icon: Zap,
                title: 'M-Pesa Ready',
                desc: 'Deposit and withdraw via M-Pesa instantly',
              },
              {
                icon: Globe,
                title: '$SOKO Token',
                desc: 'Earn and use our native Solana token',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-accent mb-2">{title}</h3>
                <p className="text-sm text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-accent mb-4">
          Ready to start predicting?
        </h2>
        <p className="text-muted mb-8">
          Join thousands of Kenyans already using SOKO.
        </p>
        <Link href="/register" className="btn-primary text-base">
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-6 text-center text-sm text-muted">
        © 2025 SOKO Platform. Built in Kenya 🇰🇪
      </footer>
    </div>
  )
}
