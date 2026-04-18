import { CustomerNav } from '@/_components/layouts/customer-nav'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CustomerNav />
      <main className="flex-1 pb-24 sm:pb-0">{children}</main>
    </div>
  )
}
