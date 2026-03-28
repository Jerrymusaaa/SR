'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/auth.store'
import { formatDate } from '@/lib/utils'
import { User, Bell } from 'lucide-react'
import { PhantomConnect } from '@/components/solana/PhantomConnect'
import { KycVerification } from '@/components/kyc/KycVerification'

export default function ProfilePage() {
  const { user } = useAuthStore()

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-accent">Profile</h1>
        <p className="text-muted mt-1">Manage your account settings</p>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Avatar */}
        <div className="card flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary font-bold text-2xl">
            {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-accent">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email}
            </h2>
            <p className="text-muted text-sm">{user?.email}</p>
            <p className="text-xs text-muted mt-1">
              Member since {user?.createdAt ? formatDate(user.createdAt) : '—'}
            </p>
          </div>
        </div>

        {/* Account Info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-primary" />
            <h2 className="font-semibold text-accent">Account Information</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'First Name', value: user?.firstName ?? '—' },
              { label: 'Last Name', value: user?.lastName ?? '—' },
              { label: 'Email', value: user?.email ?? '—' },
              { label: 'Phone', value: user?.phone ?? '—' },
              { label: 'Role', value: user?.role ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted">{label}</span>
                <span className="text-sm font-medium text-accent capitalize">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KYC Verification */}
        <KycVerification />

        {/* Phantom Wallet */}
        <PhantomConnect />

        {/* Security */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-primary" />
            <h2 className="font-semibold text-accent">Security</h2>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-accent">Two-Factor Authentication</p>
              <p className="text-xs text-muted">
                {user?.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
              </p>
            </div>
            <button className="btn-secondary text-sm py-2 px-4">
              {user?.twoFactorEnabled ? 'Manage' : 'Enable 2FA'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
