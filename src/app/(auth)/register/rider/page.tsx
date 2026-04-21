'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { signUpOrSignIn, ensureProfileWithRole, sendWelcomeEmail } from '@/_lib/auth'

export default function RiderRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    vehicleType: '',
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
      const { user, isExisting } = await signUpOrSignIn(form.email, form.password, form.fullName)
      await ensureProfileWithRole(user.$id, 'rider', {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        vehicleType: form.vehicleType,
      })
      if (!isExisting) sendWelcomeEmail(form.fullName, form.email, 'rider')
      router.push('/deliveries')
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
      <div className="hidden sm:flex flex-col justify-between bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-10 relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full bg-white/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[250px] h-[250px] rounded-full bg-black/10 blur-[80px] pointer-events-none" />

        <Link href="/" className="relative text-xl font-extrabold">idado<span className="text-white/80">.</span></Link>
        <div className="relative">
          <span className="text-6xl">🚴</span>
          <h2 className="mt-6 text-4xl font-extrabold leading-tight">Deliver orders.<br />Earn daily.<br />Your schedule.</h2>
          <p className="mt-3 text-white/70 text-sm max-w-xs">Pick up and deliver within the estate. Flexible hours, daily payouts.</p>
        </div>
        <p className="relative text-white/40 text-xs">&copy; 2026 Idado Eats</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="sm:hidden text-xl font-extrabold">idado<span className="text-primary">.</span></Link>
          <Link href="/register" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2 sm:mt-0">
            ← Back to roles
          </Link>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Become a Rider</h1>
          <p className="mt-1 text-sm text-muted-foreground">Earn money delivering orders within the estate</p>

          {error && (
            <div className="mt-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Input label="Full Name" id="fullName" placeholder="John Doe" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email Address" id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} required />
              <Input label="Phone Number" id="phone" type="tel" placeholder="08012345678" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
            </div>
            <Input label="Home Address" id="address" placeholder="Your address" value={form.address} onChange={(e) => update('address', e.target.value)} required />
            <Input label="Vehicle Type" id="vehicleType" placeholder="e.g. Bicycle, Motorcycle, On foot" value={form.vehicleType} onChange={(e) => update('vehicleType', e.target.value)} required />

            <div className="my-1 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Security</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Input label="Password" id="password" type="password" placeholder="Create a password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
            <Input label="Confirm Password" id="confirmPassword" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required />

            <Button type="submit" className="mt-2 w-full" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up as Rider'}
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
