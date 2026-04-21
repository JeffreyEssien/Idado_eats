'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/_lib/mock-data'
import type { Delivery } from '@/_lib/mock-data'
import { Badge } from '@/_components/ui/badge'
import { Button } from '@/_components/ui/button'
import { listDeliveries, updateDeliveryStatus, updateOrderStatus } from '@/_lib/db'
import { getUser, getProfile, updateProfile } from '@/_lib/auth'

const steps = [
  { key: 'picked_up', label: 'Headed to store', next: 'Mark as Picked Up' },
  { key: 'in_transit', label: 'On the way to customer', next: 'Mark as Delivered' },
] as const

export default function ActiveDeliveryPage() {
  const router = useRouter()
  const [active, setActive] = useState<Delivery | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    (async () => {
      const user = await getUser()
      if (!user) { setLoading(false); return }
      const dels = await listDeliveries('picked_up')
      const mine = dels.find((d) => d.riderId === user.$id) || null
      setActive(mine)
      setLoading(false)
    })()
  }, [])

  async function markDelivered() {
    if (!active || updating) return
    setUpdating(true)
    try {
      // Update delivery status
      await updateDeliveryStatus(active.$id, 'delivered')
      // Also update the order status to delivered + attach rider info
      const user = await getUser()
      if (user) {
        const profile = await getProfile(user.$id)
        await updateOrderStatus(active.orderId, 'delivered')
        // Attach rider name/phone to the order so customer can see it
        try {
          const { databases } = await import('@/_lib/appwrite')
          const { DATABASE_ID, COLLECTIONS } = await import('@/_lib/appwrite-config')
          await databases.updateDocument(DATABASE_ID, COLLECTIONS.ORDERS, active.orderId, {
            riderName: (profile?.fullName as string) || 'Rider',
            riderPhone: (profile?.phone as string) || '',
          })
        } catch { /* non-critical */ }
      }
      setActive(null)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="mt-3 text-sm text-muted-foreground">Loading delivery...</p>
        </div>
      </div>
    )
  }

  if (!active) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Active Delivery</h1>
        <p className="text-sm text-muted-foreground mt-1">Your current delivery will show here</p>

        <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface/30 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface text-3xl">
            🚴
          </div>
          <p className="mt-4 font-bold text-lg">No active delivery</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
            Accept a delivery from the available list to get started.
          </p>
          <Button href="/deliveries" className="mt-5">View Available</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Active Delivery</h1>
          <p className="text-sm text-muted-foreground mt-1">Order {active.orderId.slice(0, 8)}...</p>
        </div>
        <Badge variant="info">In Progress</Badge>
      </div>

      {/* Earnings card */}
      <div className="mt-6 rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Delivery from</p>
            <p className="mt-0.5 text-lg font-extrabold">{active.storeName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">You earn</p>
            <p className="mt-0.5 text-2xl font-extrabold">{formatPrice(active.fee)}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
          <span>{active.items} item{active.items > 1 ? 's' : ''}</span>
          <span>&middot;</span>
          <span>Order total {formatPrice(active.total)}</span>
        </div>
      </div>

      {/* Route card */}
      <div className="mt-4 rounded-3xl border border-border bg-card p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Route</p>

        {/* Pickup */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shrink-0">1</div>
            <div className="w-px flex-1 min-h-[28px] border-l-2 border-primary my-1" />
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm">Pickup &middot; {active.storeName}</p>
              <Badge variant="success">Ready</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{active.storeAddress}</p>
          </div>
        </div>

        {/* Drop-off */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white shrink-0">2</div>
          <div className="flex-1">
            <p className="font-bold text-sm">Drop-off &middot; {active.customerName}</p>
            <p className="mt-1 text-sm text-muted-foreground">{active.customerAddress}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{active.customerPhone}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-col gap-3">
        <Button size="lg" className="w-full" onClick={markDelivered} disabled={updating}>
          {updating ? 'Updating...' : 'Mark as Delivered'}
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => window.open(`tel:${active.customerPhone}`)}
          >
            Call Customer
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={() => {
              const q = encodeURIComponent(active.customerAddress)
              window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank')
            }}
          >
            Open Map
          </Button>
        </div>
      </div>
    </div>
  )
}
