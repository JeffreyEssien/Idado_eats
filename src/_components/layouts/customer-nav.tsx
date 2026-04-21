'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { signOut, getUser, getProfile, parseRoles, type UserRole } from '@/_lib/auth'

const navItems = [
  { href: '/stores', label: 'Explore', icon: '🔍' },
  { href: '/cart', label: 'Cart', icon: '🛒' },
  { href: '/orders', label: 'Orders', icon: '📦' },
  { href: '/disputes', label: 'Disputes', icon: '🎫' },
  { href: '/profile', label: 'You', icon: '👤' },
]

const roleSwitchTargets: Record<UserRole, { label: string; icon: string; href: string }> = {
  customer: { label: 'Customer', icon: '🛍️', href: '/stores' },
  business: { label: 'Business', icon: '🏪', href: '/dashboard' },
  rider: { label: 'Rider', icon: '🚴', href: '/deliveries' },
}

export function CustomerNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [otherRoles, setOtherRoles] = useState<UserRole[]>([])
  const [showSwitcher, setShowSwitcher] = useState(false)

  useEffect(() => {
    async function loadRoles() {
      const user = await getUser()
      if (!user) return
      const profile = await getProfile(user.$id)
      const roles = parseRoles(profile?.role as string)
      setOtherRoles(roles.filter((r) => r !== 'customer'))
    }
    loadRoles()
  }, [])

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Desktop — minimal top bar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/stores" className="text-lg font-extrabold tracking-tight">
            idado<span className="text-primary">.</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <nav className="flex items-center gap-1 rounded-full bg-surface border border-border p-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all ${isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            {otherRoles.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowSwitcher(!showSwitcher)}
                  className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-surface transition-all cursor-pointer"
                >
                  Switch role
                </button>
                {showSwitcher && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSwitcher(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-2xl border border-border bg-card p-1.5 shadow-lg">
                      {otherRoles.map((role) => {
                        const t = roleSwitchTargets[role]
                        return (
                          <Link
                            key={role}
                            href={t.href}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-muted-foreground hover:bg-surface hover:text-foreground transition-all"
                          >
                            <span>{t.icon}</span>{t.label}
                          </Link>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
            <button onClick={handleSignOut} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-surface transition-all cursor-pointer">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile — floating pill at bottom */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 sm:hidden">
        <div className="flex items-center justify-around rounded-full bg-secondary/95 backdrop-blur-lg p-2 shadow-xl shadow-black/20">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 transition-all ${isActive ? 'bg-primary text-white' : 'text-white/60'}`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-[9px] font-semibold">{item.label}</span>
              </Link>
            )
          })}
          {otherRoles.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSwitcher(!showSwitcher)}
                className="flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-white/60"
              >
                <span className="text-base">🔄</span>
                <span className="text-[9px] font-semibold">Switch</span>
              </button>
              {showSwitcher && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSwitcher(false)} />
                  <div className="absolute bottom-full right-0 mb-2 z-50 w-48 rounded-2xl border border-border bg-card p-1.5 shadow-lg">
                    {otherRoles.map((role) => {
                      const t = roleSwitchTargets[role]
                      return (
                        <Link
                          key={role}
                          href={t.href}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-muted-foreground hover:bg-surface hover:text-foreground transition-all"
                        >
                          <span>{t.icon}</span>{t.label}
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
