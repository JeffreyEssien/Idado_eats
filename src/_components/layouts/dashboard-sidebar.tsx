'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { signOut, getUser, getProfile, parseRoles, type UserRole } from '@/_lib/auth'

type NavItem = { href: string; label: string; icon: string }

const roleSwitchTargets: Record<UserRole, { label: string; icon: string; href: string }> = {
  customer: { label: 'Customer', icon: '🛍️', href: '/stores' },
  business: { label: 'Business', icon: '🏪', href: '/dashboard' },
  rider: { label: 'Rider', icon: '🚴', href: '/deliveries' },
}

export function DashboardSidebar({ title, navItems, currentRole }: { title: string; navItems: NavItem[]; currentRole: UserRole }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [otherRoles, setOtherRoles] = useState<UserRole[]>([])

  useEffect(() => {
    async function loadRoles() {
      const user = await getUser()
      if (!user) return
      const profile = await getProfile(user.$id)
      const roles = parseRoles(profile?.role as string)
      setOtherRoles(roles.filter((r) => r !== currentRole))
    }
    loadRoles()
  }, [currentRole])

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 backdrop-blur-md px-6 lg:hidden">
        <span className="text-lg font-extrabold tracking-tight">{title}<span className="text-primary">.</span></span>
        <button onClick={() => setOpen(!open)} className="rounded-xl p-2 hover:bg-surface text-xl">{open ? '✕' : '☰'}</button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-card transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-14 items-center px-6">
          <span className="text-lg font-extrabold tracking-tight">{title}<span className="text-primary">.</span></span>
        </div>
        <nav className="flex flex-col gap-1 px-3 mt-4">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13px] font-semibold transition-all ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-surface hover:text-foreground'}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-border p-3">
          {otherRoles.length > 0 && (
            <div className="mb-1">
              {otherRoles.map((role) => {
                const t = roleSwitchTargets[role]
                return (
                  <Link
                    key={role}
                    href={t.href}
                    className="w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13px] text-muted-foreground hover:bg-surface hover:text-foreground font-semibold"
                  >
                    <span>{t.icon}</span>Switch to {t.label}
                  </Link>
                )
              })}
            </div>
          )}
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13px] text-muted-foreground hover:bg-surface hover:text-foreground font-semibold cursor-pointer">
            <span>🚪</span>Sign Out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  )
}
