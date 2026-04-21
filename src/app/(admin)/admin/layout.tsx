'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '@/_lib/auth'

const navItems = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/users', label: 'Customers', icon: '👥' },
  { href: '/admin/stores', label: 'Stores', icon: '🏪' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/disputes', label: 'Disputes', icon: '🎫' },
  { href: '/admin/riders', label: 'Riders', icon: '🚴' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 backdrop-blur-md px-6 lg:hidden">
        <span className="text-lg font-extrabold tracking-tight">Idado Admin<span className="text-danger">.</span></span>
        <button onClick={() => setOpen(!open)} className="rounded-xl p-2 hover:bg-surface text-xl">{open ? '✕' : '☰'}</button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-card transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-14 items-center px-6">
          <span className="text-lg font-extrabold tracking-tight">Idado Admin<span className="text-danger">.</span></span>
        </div>
        <nav className="flex flex-col gap-1 px-3 mt-4">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13px] font-semibold transition-all ${active ? 'bg-danger/10 text-danger' : 'text-muted-foreground hover:bg-surface hover:text-foreground'}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-border p-3">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13px] text-muted-foreground hover:bg-surface hover:text-foreground font-semibold cursor-pointer">
            <span>🚪</span>Sign Out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:py-8">{children}</div>
      </main>
    </div>
  )
}
