import { DashboardSidebar } from '@/_components/layouts/dashboard-sidebar'

const navItems = [
  { href: '/deliveries', label: 'Available', icon: '📦' },
  { href: '/deliveries/active', label: 'Active Delivery', icon: '🚴' },
  { href: '/deliveries/history', label: 'History', icon: '📜' },
  { href: '/deliveries/settings', label: 'Settings', icon: '⚙️' },
]

export default function RiderDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <DashboardSidebar title="Idado Eats Rider" navItems={navItems} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-3xl px-4 py-6 lg:py-8">{children}</div>
      </main>
    </div>
  )
}
