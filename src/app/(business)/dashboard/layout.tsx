import { DashboardSidebar } from '@/_components/layouts/dashboard-sidebar'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/catalogue', label: 'Catalogue', icon: '📦' },
  { href: '/dashboard/orders', label: 'Orders', icon: '📋' },
  { href: '/dashboard/disputes', label: 'Disputes', icon: '🎫' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export default function BusinessDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <DashboardSidebar title="Idado Eats Business" navItems={navItems} currentRole="business" />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-6 lg:py-8">{children}</div>
      </main>
    </div>
  )
}
