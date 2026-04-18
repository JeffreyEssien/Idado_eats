'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { formatPrice, getStatusColor, parseOrderItems } from '@/_lib/mock-data'
import type { Order } from '@/_lib/mock-data'
import { Badge } from '@/_components/ui/badge'
import { Button } from '@/_components/ui/button'
import { getOrder } from '@/_lib/db'

const steps = ['pending', 'confirmed', 'preparing', 'picked_up', 'delivered'] as const
const stepLabels = ['Placed', 'Confirmed', 'Preparing', 'On the way', 'Delivered']

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrder(id)
      .then((o) => { setOrder(o); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-center">
        <div>
          <p className="text-4xl">🫥</p>
          <p className="mt-3 font-bold">Order not found</p>
          <Button href="/orders" variant="outline" className="mt-4">Go back</Button>
        </div>
      </div>
    )
  }

  const items = parseOrderItems(order.items)
  const currentStep = steps.indexOf(order.status as (typeof steps)[number])

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link href="/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Orders</Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-mono">{order.$id.slice(0, 12)}</p>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">{order.storeName}</h1>
        </div>
        <Badge variant={getStatusColor(order.status)} className="text-xs">{order.status.replace('_', ' ')}</Badge>
      </div>

      {order.status !== 'cancelled' && (
        <div className="mt-8 rounded-3xl bg-card border border-border p-6">
          <div className="flex flex-col gap-0">
            {steps.map((step, i) => {
              const done = i <= currentStep
              const active = i === currentStep
              return (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done ? 'bg-primary text-white' : 'bg-surface text-muted-foreground'} ${active ? 'ring-4 ring-primary/20' : ''}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    {i < steps.length - 1 && <div className={`w-0.5 h-8 ${done ? 'bg-primary' : 'bg-border'}`} />}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-bold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{stepLabels[i]}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Items</p>
        </div>
        <div className="divide-y divide-border">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
              <span>{item.quantity}x {item.name}</span>
              <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-dashed border-border px-5 py-4 flex justify-between font-extrabold text-lg">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment</p>
          <p className="mt-2 font-bold text-sm">{order.paymentMethod === 'cash' ? '💵 Cash on Delivery' : '🏦 Bank Transfer'}</p>
        </div>
        {order.riderName && (
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rider</p>
            <p className="mt-2 font-bold text-sm">{order.riderName}</p>
            <p className="text-xs text-muted-foreground">{order.riderPhone}</p>
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        Ordered {new Date(order.$createdAt).toLocaleString()}
      </p>
    </div>
  )
}
