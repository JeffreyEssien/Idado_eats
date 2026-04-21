'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { signIn, getUser, getProfile, updateProfile, parseRoles, type UserRole } from '@/_lib/auth'

const roleConfig: Record<UserRole, { label: string; icon: string; href: string }> = {
  customer: { label: 'Customer', icon: '🛍️', href: '/stores' },
  business: { label: 'Business', icon: '🏪', href: '/dashboard' },
  rider: { label: 'Rider', icon: '🚴', href: '/deliveries' },
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<UserRole[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      const user = await getUser()
      if (!user) throw new Error('Login failed')
      const profile = await getProfile(user.$id)
      let userRoles = parseRoles(profile?.role as string)

      // Auto-add customer role if missing
      if (profile && !userRoles.includes('customer')) {
        const updated = [...userRoles, 'customer'].join(',')
        try { await updateProfile(user.$id, { role: updated }) } catch {}
        userRoles = [...userRoles, 'customer']
      }

      if (userRoles.length > 1) {
        setRoles(userRoles)
        setLoading(false)
        return
      }

      const role = userRoles[0] ?? 'customer'
      router.push(roleConfig[role].href)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function selectRole(role: UserRole) {
    router.push(roleConfig[role].href)
  }

  // ── Role picker screen ──
  if (roles.length > 1) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="text-xl font-extrabold">idado<span className="text-primary">.</span></Link>
          <h1 className="mt-8 text-2xl font-extrabold tracking-tight">Choose a role</h1>
          <p className="mt-1 text-sm text-muted-foreground">You have multiple roles on this account</p>
          <div className="mt-8 flex flex-col gap-3">
            {roles.map((role) => {
              const cfg = roleConfig[role]
              return (
                <button
                  key={role}
                  onClick={() => selectRole(role)}
                  className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="text-3xl">{cfg.icon}</span>
                  <span className="font-bold">{cfg.label}</span>
                  <span className="ml-auto text-muted-foreground/40 text-lg">→</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Login form ──
  return (
    <div className="min-h-screen grid sm:grid-cols-2">
      {/* Left — brand panel */}
      <div className="hidden sm:flex flex-col justify-between bg-secondary text-white p-10 relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <span className="relative text-xl font-extrabold">idado<span className="text-primary">.</span></span>
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight">Your estate,<br />delivered.</h2>
          <p className="mt-3 text-white/50 text-sm max-w-xs">Food, groceries, essentials — from the stores you already love.</p>

          <div className="mt-10 flex gap-6 text-sm">
            {[
              { v: '50+', l: 'Stores' },
              { v: '15min', l: 'Avg delivery' },
              { v: '2,000+', l: 'Orders' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-lg font-extrabold">{s.v}</p>
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/30 text-xs">&copy; 2026 Idado Eats</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="sm:hidden text-xl font-extrabold">idado<span className="text-primary">.</span></Link>
          <h1 className="mt-6 sm:mt-0 text-2xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue</p>

          {error && (
            <div className="mt-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input label="Email" id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" id="password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            New here?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
