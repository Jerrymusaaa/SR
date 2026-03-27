'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { register, isLoading } = useAuthStore()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Registration failed. Please try again.')
    }
  }

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return { score: 0, label: '', color: '' }
    if (pwd.length < 6) return { score: 1, label: 'Too short', color: 'bg-danger' }
    if (pwd.length < 8) return { score: 2, label: 'Weak', color: 'bg-orange-400' }
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { score: 3, label: 'Fair', color: 'bg-yellow-400' }
    return { score: 4, label: 'Strong', color: 'bg-success' }
  }

  const strength = passwordStrength(form.password)

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-primary font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-2xl text-white">SOKO</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Join thousands of<br />
            Kenyan predictors.
          </h1>
          <p className="text-blue-100 text-lg mb-10">
            Create your free account and start predicting today.
          </p>

          <div className="space-y-3">
            {[
              'Free to sign up, no credit card needed',
              'Deposit via M-Pesa in seconds',
              'Earn $SOKO tokens on every prediction',
              'Withdraw winnings anytime',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-green-300 flex-shrink-0" />
                <span className="text-blue-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-200 text-sm relative z-10">
          © 2025 SOKO Platform. Built in Kenya 🇰🇪
        </p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-background overflow-y-auto">
        <div className="w-full max-w-md">

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-xl text-accent">SOKO</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-accent mb-2">Create your account</h2>
            <p className="text-muted">It only takes 30 seconds</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-danger text-sm px-4 py-3 rounded-xl mb-6">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First name</label>
                <input
                  name="firstName"
                  className="input"
                  placeholder="John"
                  value={form.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="label">Last name</label>
                <input
                  name="lastName"
                  className="input"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                name="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="input pr-12"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    strength.score >= 4 ? 'text-success' :
                    strength.score >= 3 ? 'text-yellow-500' : 'text-danger'
                  }`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Free Account'
              )}
            </button>

            <p className="text-xs text-center text-muted">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              You must be 18+ to use SOKO.
            </p>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
