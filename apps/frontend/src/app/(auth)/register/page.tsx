'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })
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
      setError(err?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">O</span>
            </div>
            <span className="font-bold text-2xl text-accent">OKO</span>
          </Link>
          <p className="text-muted mt-3">Create your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl">
                {Array.isArray(error) ? error.join(', ') : error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input name="firstName" className="input" placeholder="John" value={form.firstName} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input name="lastName" className="input" placeholder="Doe" value={form.lastName} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" className="input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" name="password" className="input" placeholder="Min 8 characters" value={form.password} onChange={handleChange} required minLength={8} />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
