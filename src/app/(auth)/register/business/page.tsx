'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { Select } from '@/_components/ui/select'
import { Textarea } from '@/_components/ui/textarea'
import { signUp, createProfile } from '@/_lib/auth'

export default function BusinessRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    ownerName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: 'restaurant',
    description: '',
    address: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const user = await signUp(form.email, form.password, form.ownerName)
      await createProfile(user.$id, 'business', {
        fullName: form.ownerName,
        email: form.email,
        phone: form.phone,
        businessName: form.businessName,
        businessType: form.businessType,
        description: form.description,
        address: form.address,
      })
      router.push('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid sm:grid-cols-2">
      {/* Left — brand panel */}
      <div className="hidden sm:flex flex-col justify-between bg-gradient-to-br from-emerald-500 to-green-600 text-white p-10 relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full bg-white/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[250px] h-[250px] rounded-full bg-black/10 blur-[80px] pointer-events-none" />

        <Link href="/" className="relative text-xl font-extrabold">idado<span className="text-white/80">.</span></Link>
        <div className="relative">
          <span className="text-6xl">🏪</span>
          <h2 className="mt-6 text-4xl font-extrabold leading-tight">Your store.<br />More customers.<br />Zero hassle.</h2>
          <p className="mt-3 text-white/70 text-sm max-w-xs">List your business, receive orders, and let riders handle delivery.</p>
        </div>
        <p className="relative text-white/40 text-xs">&copy; 2026 Idado Eats</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          <Link href="/" className="sm:hidden text-xl font-extrabold">idado<span className="text-primary">.</span></Link>
          <Link href="/register" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2 sm:mt-0">
            ← Back to roles
          </Link>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Register Your Business</h1>
          <p className="mt-1 text-sm text-muted-foreground">Get your store listed and start receiving orders</p>

          {error && (
            <div className="mt-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Input label="Owner's Full Name" id="ownerName" placeholder="Jane Doe" value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email Address" id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} required />
              <Input label="Phone Number" id="phone" type="tel" placeholder="08012345678" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
            </div>

            <div className="my-1 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Business info</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Input label="Business Name" id="businessName" placeholder="My Awesome Store" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} required />
            <Select
              label="Business Type"
              id="businessType"
              value={form.businessType}
              onChange={(e) => update('businessType', e.target.value)}
              options={[
                { value: 'restaurant', label: 'Restaurant' },
                { value: 'mart', label: 'Mart / Grocery' },
                { value: 'store', label: 'Store / Shop' },
              ]}
            />
            <Textarea label="Business Description" id="description" placeholder="Tell customers what you sell..." value={form.description} onChange={(e) => update('description', e.target.value)} required />
            <Input label="Business Address (within estate)" id="address" placeholder="Block A, Shop 5, Idado Estate" value={form.address} onChange={(e) => update('address', e.target.value)} required />

            <div className="my-1 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Security</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Input label="Password" id="password" type="password" placeholder="Create a password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
            <Input label="Confirm Password" id="confirmPassword" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required />

            <Button type="submit" className="mt-2 w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register Business'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
