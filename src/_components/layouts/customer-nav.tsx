'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/_lib/auth'

const navItems = [
  { href: '/stores', label: 'Explore', icon: '🔍' },
  { href: '/cart', label: 'Cart', icon: '🛒' },
  { href: '/orders', label: 'Orders', icon: '📦' },
  { href: '/profile', label: 'You', icon: '👤' },
]

export function CustomerNav() {
  const pathname = usePathname()
  const router = useRouter()

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
        </div>
      </nav>
    </>
  )
}
