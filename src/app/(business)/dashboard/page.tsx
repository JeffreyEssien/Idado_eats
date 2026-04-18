'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/_components/ui/badge'
import { formatPrice, getStatusColor, parseOrderItems } from '@/_lib/mock-data'
import type { Order, Store } from '@/_lib/mock-data'
import { getUser, getProfile } from '@/_lib/auth'
import { listOrdersByStore, listProducts } from '@/_lib/db'

export default function BusinessDashboardPage() {
  const [storeName, setStoreName] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [menuCount, setMenuCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const user = await getUser()
      if (!user) { setLoading(false); return }
      const profile = await getProfile(user.$id)
      if (!profile) { setLoading(false); return }
      setStoreName(profile.businessName as string || 'Your Store')

      // For now, list orders by the first storeId in profile
      // TODO: store the storeId in profile after store creation
      const storeId = profile.storeId as string || ''
      if (storeId) {
        const [o, p] = await Promise.all([listOrdersByStore(storeId), listProducts(storeId)])
        setOrders(o)
        setMenuCount(p.length)
      }
      setLoading(false)
    })()
  }, [])

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const todayOrders = orders.filter((o) => {
    const d = new Date(o.$createdAt)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  })

  const stats = [
    { label: 'Orders', value: String(orders.length), sub: `+${todayOrders.length} today`, icon: '📦' },
    { label: 'Revenue', value: formatPrice(totalRevenue), sub: 'All time', icon: '💰' },
    { label: 'Menu Items', value: String(menuCount), sub: 'In catalogue', icon: '🍽️' },
  ]

  const recentOrders = orders.slice(0, 5)

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1">{storeName}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <span className="text-xl">{s.icon}</span>
            </div>
            <p className="mt-3 text-2xl font-extrabold">{s.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent orders</h2>
      {recentOrders.length === 0 ? (
        <div className="mt-6 text-center py-12">
          <p className="text-4xl">📦</p>
          <p className="mt-3 font-bold">No orders yet</p>
          <p className="text-sm text-muted-foreground">Orders will appear here</p>
        </div>
      ) : (
        <div className="mt-4 rounded-3xl border border-border bg-card overflow-hidden divide-y divide-border">
          {recentOrders.map((o) => {
            const items = parseOrderItems(o.items)
            const itemCount = items.reduce((s, i) => s + i.quantity, 0)
            return (
              <div key={o.$id} className="flex items-center justify-between px-5 py-4 hover:bg-surface transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-extrabold text-primary">
                    {o.storeName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[13px]">{o.$id.slice(0, 12)}</p>
                    <p className="text-[11px] text-muted-foreground">{itemCount} item{itemCount > 1 ? 's' : ''} · {new Date(o.$createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusColor(o.status)}>{o.status}</Badge>
                  <p className="font-extrabold text-sm w-20 text-right">{formatPrice(o.total)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
