'use client'

import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/_components/ui/badge'
import { Input } from '@/_components/ui/input'
import { listAllProfiles, listAllOrders } from '@/_lib/db'
import { formatPrice, getStatusColor, parseOrderItems } from '@/_lib/mock-data'
import type { Order, OrderStatus } from '@/_lib/mock-data'

type Profile = {
  $id: string
  fullName: string
  email: string
  phone: string
  address: string
  role: string
  $createdAt: string
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [orders, setOrders] = useState<(Order & { $createdAt: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all')

  useEffect(() => {
    ;(async () => {
      try {
        const [p, o] = await Promise.all([listAllProfiles('customer'), listAllOrders()])
        setProfiles(p as unknown as Profile[])
        setOrders(o)
      } catch { /* collections may not exist yet */ }
      setLoading(false)
    })()
  }, [])

  // Map orders by userId
  const ordersByUser = useMemo(() => {
    const map: Record<string, (Order & { $createdAt: string })[]> = {}
    for (const o of orders) {
      if (!map[o.userId]) map[o.userId] = []
      map[o.userId].push(o)
    }
    return map
  }, [orders])

  // Customer stats
  const stats = useMemo(() => {
    const totalCustomers = profiles.length
    const activeCustomers = profiles.filter((p) => ordersByUser[p.$id]?.length).length
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length
    return { totalCustomers, activeCustomers, totalOrders, totalRevenue, deliveredOrders }
  }, [profiles, orders, ordersByUser])

  // Filtered customers
  const filtered = useMemo(() => {
    if (!search.trim()) return profiles
    const q = search.toLowerCase()
    return profiles.filter(
      (p) =>
        p.fullName?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.includes(q),
    )
  }, [profiles, search])

  function getUserOrders(userId: string) {
    const userOrders = ordersByUser[userId] || []
    if (orderFilter === 'all') return userOrders
    return userOrders.filter((o) => o.status === orderFilter)
  }

  function getUserStats(userId: string) {
    const userOrders = ordersByUser[userId] || []
    return {
      total: userOrders.length,
      delivered: userOrders.filter((o) => o.status === 'delivered').length,
      pending: userOrders.filter((o) => ['pending', 'confirmed', 'preparing'].includes(o.status)).length,
      inTransit: userOrders.filter((o) => o.status === 'picked_up').length,
      cancelled: userOrders.filter((o) => o.status === 'cancelled').length,
      spent: userOrders.reduce((s, o) => s + (o.total || 0), 0),
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-danger border-t-transparent animate-spin" />
          <p className="mt-3 text-sm text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Customers</h1>
      <p className="text-sm text-muted-foreground mt-1">View all registered customers and their orders</p>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Customers', value: stats.totalCustomers, icon: '👥' },
          { label: 'Active (ordered)', value: stats.activeCustomers, icon: '🛒' },
          { label: 'Total Orders', value: stats.totalOrders, icon: '📦' },
          { label: 'Revenue', value: formatPrice(stats.totalRevenue), icon: '💰' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{s.icon}</span>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mt-6">
        <Input
          label="Search"
          id="search"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customer list */}
      <div className="mt-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="mt-4 rounded-3xl border border-dashed border-border bg-surface/30 py-16 text-center">
            <p className="text-4xl">👥</p>
            <p className="mt-4 font-bold text-lg">{search ? 'No customers match your search' : 'No customers yet'}</p>
            <p className="mt-1 text-sm text-muted-foreground">Registered customers will appear here</p>
          </div>
        )}

        {filtered.map((customer) => {
          const uStats = getUserStats(customer.$id)
          const isExpanded = expanded === customer.$id
          const userOrders = getUserOrders(customer.$id)

          return (
            <div key={customer.$id} className="rounded-3xl border border-border bg-card overflow-hidden">
              {/* Customer header */}
              <button
                onClick={() => {
                  setExpanded(isExpanded ? null : customer.$id)
                  setOrderFilter('all')
                }}
                className="w-full p-5 text-left cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="h-9 w-9 rounded-full bg-danger/10 flex items-center justify-center text-danger font-bold text-sm shrink-0">
                        {customer.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold leading-tight">{customer.fullName || 'Unnamed'}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                      {customer.phone && <span>{customer.phone}</span>}
                      <span>&middot;</span>
                      <span>Joined {new Date(customer.$createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {customer.address && (
                        <>
                          <span>&middot;</span>
                          <span className="truncate max-w-[200px]">{customer.address}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-lg font-extrabold">{uStats.total}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">orders</p>
                      </div>
                      <span className="text-muted-foreground/40 text-lg">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </div>

                {/* Mini stat chips */}
                <div className="mt-3 flex gap-2 flex-wrap">
                  {uStats.delivered > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 text-success px-2.5 py-1 text-[11px] font-semibold">
                      ✓ {uStats.delivered} delivered
                    </span>
                  )}
                  {uStats.pending > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 px-2.5 py-1 text-[11px] font-semibold">
                      ⏳ {uStats.pending} pending
                    </span>
                  )}
                  {uStats.inTransit > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 px-2.5 py-1 text-[11px] font-semibold">
                      🚴 {uStats.inTransit} in transit
                    </span>
                  )}
                  {uStats.cancelled > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 text-danger px-2.5 py-1 text-[11px] font-semibold">
                      ✗ {uStats.cancelled} cancelled
                    </span>
                  )}
                  {uStats.spent > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface text-muted-foreground px-2.5 py-1 text-[11px] font-semibold">
                      {formatPrice(uStats.spent)} spent
                    </span>
                  )}
                </div>
              </button>

              {/* Expanded: order list */}
              {isExpanded && (
                <div className="border-t border-border px-5 pb-5 pt-4">
                  {/* Order status filter */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Orders:</span>
                    {(['all', 'pending', 'confirmed', 'preparing', 'picked_up', 'delivered', 'cancelled'] as const).map((s) => {
                      const count = s === 'all'
                        ? (ordersByUser[customer.$id] || []).length
                        : (ordersByUser[customer.$id] || []).filter((o) => o.status === s).length
                      if (s !== 'all' && count === 0) return null
                      return (
                        <button
                          key={s}
                          onClick={() => setOrderFilter(s)}
                          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${orderFilter === s ? 'bg-foreground text-background' : 'bg-surface text-muted-foreground hover:text-foreground'}`}
                        >
                          {s === 'all' ? 'All' : s.replace('_', ' ')} ({count})
                        </button>
                      )
                    })}
                  </div>

                  {userOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      {(ordersByUser[customer.$id] || []).length === 0
                        ? 'This customer has no orders yet'
                        : `No ${orderFilter.replace('_', ' ')} orders`}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {userOrders.map((order) => {
                        const items = parseOrderItems(order.items)
                        return (
                          <div key={order.$id} className="rounded-2xl border border-border bg-surface/50 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-bold text-sm">{order.storeName}</p>
                                  <Badge variant={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {new Date(order.$createdAt).toLocaleDateString('en-NG', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  {' '}&middot; {order.paymentMethod === 'cash' ? 'Cash on delivery' : 'Bank transfer'}
                                </p>

                                {/* Order items */}
                                {items.length > 0 && (
                                  <div className="mt-2 flex flex-col gap-0.5">
                                    {items.map((item, i) => (
                                      <p key={i} className="text-xs text-muted-foreground">
                                        {item.quantity}× {item.name} — {formatPrice(item.price * item.quantity)}
                                      </p>
                                    ))}
                                  </div>
                                )}

                                {/* Rider info */}
                                {order.riderName && (
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    Rider: <span className="font-semibold text-foreground">{order.riderName}</span>
                                    {order.riderPhone && ` (${order.riderPhone})`}
                                  </p>
                                )}
                              </div>
                              <p className="text-lg font-extrabold shrink-0">{formatPrice(order.total)}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
