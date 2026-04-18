'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/_lib/mock-data'
import type { Delivery } from '@/_lib/mock-data'
import { Card } from '@/_components/ui/card'
import { Badge } from '@/_components/ui/badge'
import { Button } from '@/_components/ui/button'
import { listDeliveries, updateDeliveryStatus } from '@/_lib/db'

export default function ActiveDeliveryPage() {
  const [active, setActive] = useState<Delivery | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listDeliveries('picked_up').then((dels) => {
      setActive(dels[0] || null)
      setLoading(false)
    })
  }, [])

  async function markDelivered() {
    if (!active) return
    await updateDeliveryStatus(active.$id, 'delivered')
    setActive(null)
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
  }

  if (!active) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Active Delivery</h1>
        <div className="mt-12 text-center text-muted-foreground">
          <p className="text-4xl">🚴</p>
          <p className="mt-4 text-lg font-medium">No active delivery</p>
          <p className="text-sm">Accept a delivery from the available list</p>
          <Button href="/deliveries" className="mt-4">View Available</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Active Delivery</h1>
        <Badge variant="info">In Progress</Badge>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{active.orderId}</p>
            <h2 className="text-lg font-semibold">{active.storeName}</h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Delivery Fee</p>
            <p className="text-lg font-bold text-primary">{formatPrice(active.fee)}</p>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <h3 className="font-semibold">Route</h3>
        <div className="mt-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">1</div>
            <div>
              <p className="font-medium">Pickup - {active.storeName}</p>
              <p className="text-sm text-muted-foreground">{active.storeAddress}</p>
              <Badge variant="success" className="mt-1">Picked Up</Badge>
            </div>
          </div>
          <div className="ml-4 border-l-2 border-primary py-3" />
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">2</div>
            <div>
              <p className="font-medium">Drop-off - {active.customerName}</p>
              <p className="text-sm text-muted-foreground">{active.customerAddress}</p>
              <p className="text-sm text-muted-foreground">{active.customerPhone}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        <Button size="lg" className="w-full" onClick={markDelivered}>Mark as Delivered</Button>
        <Button variant="outline" size="lg" className="w-full" onClick={() => window.open(`tel:${active.customerPhone}`)}>
          Call Customer
        </Button>
      </div>
    </div>
  )
}
