'use client'

import { useState, useEffect } from 'react'
import { formatPrice, getStatusColor, parseOrderItems } from '@/_lib/mock-data'
import type { Order } from '@/_lib/mock-data'
import { Badge } from '@/_components/ui/badge'
import { Button } from '@/_components/ui/button'
import { Card } from '@/_components/ui/card'
import { getUser, getProfile } from '@/_lib/auth'
import { listOrdersByStore, updateOrderStatus } from '@/_lib/db'

type Tab = 'all' | 'pending' | 'preparing' | 'delivered'

export default function BusinessOrdersPage() {
  const [tab, setTab] = useState<Tab>('all')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const user = await getUser()
      if (!user) { setLoading(false); return }
      const profile = await getProfile(user.$id)
      const storeId = profile?.storeId as string || ''
      if (storeId) {
        const o = await listOrdersByStore(storeId)
        setOrders(o)
      }
      setLoading(false)
    })()
  }, [])

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    await updateOrderStatus(orderId, newStatus)
    setOrders((prev) => prev.map((o) => o.$id === orderId ? { ...o, status: newStatus as Order['status'] } : o))
  }

  const filtered = tab === 'all' ? orders : orders.filter((o) => o.status === tab)

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage incoming orders</p>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {(['all', 'pending', 'preparing', 'delivered'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${tab === t ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            {t === 'all' ? 'All Orders' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {filtered.map((order) => {
          const items = parseOrderItems(order.items)
          return (
            <Card key={order.$id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.$id.slice(0, 12)}</p>
                    <Badge variant={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                  </div>
                  <div className="mt-2 flex flex-col gap-0.5 text-sm">
                    {items.map((item, i) => (
                      <span key={i} className="text-muted-foreground">{item.quantity}x {item.name}</span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Bank Transfer'} &middot;{' '}
                    {new Date(order.$createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                  <div className="mt-3 flex gap-2">
                    {order.status === 'pending' && (
                      <Button size="sm" onClick={() => handleStatusUpdate(order.$id, 'confirmed')}>Accept</Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button size="sm" onClick={() => handleStatusUpdate(order.$id, 'preparing')}>Start Preparing</Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(order.$id, 'picked_up')}>Ready for Pickup</Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center text-muted-foreground">
          <p>No orders found</p>
        </div>
      )}
    </div>
  )
}
