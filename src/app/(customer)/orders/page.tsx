'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatPrice, getStatusColor, parseOrderItems } from '@/_lib/mock-data'
import type { Order } from '@/_lib/mock-data'
import { Badge } from '@/_components/ui/badge'
import { listOrders } from '@/_lib/db'
import { getUser } from '@/_lib/auth'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUser().then((user) => {
      if (!user) { setLoading(false); return }
      listOrders(user.$id).then((o) => { setOrders(o); setLoading(false) })
    })
  }, [])

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-center px-6">
        <div>
          <p className="text-5xl">📦</p>
          <p className="mt-4 text-lg font-bold">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Your order history will show up here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Orders</h1>
      <div className="mt-8 relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const items = parseOrderItems(order.items)
            return (
              <Link key={order.$id} href={`/orders/${order.$id}`} className="group relative pl-12">
                <div className={`absolute left-2.5 top-1.5 h-4 w-4 rounded-full border-[3px] border-background transition-colors ${order.status === 'delivered' ? 'bg-success' : order.status === 'pending' ? 'bg-accent' : 'bg-primary'}`} />
                <div className="rounded-3xl border border-border bg-card p-5 transition-all group-hover:bg-surface group-hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold group-hover:text-primary transition-colors">{order.storeName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                      <p className="mt-1.5 text-sm font-extrabold">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{order.$id.slice(0, 12)}</span>
                    <span>·</span>
                    <span>{new Date(order.$createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{order.paymentMethod === 'cash' ? '💵 Cash' : '🏦 Transfer'}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
