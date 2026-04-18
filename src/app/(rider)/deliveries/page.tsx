'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/_lib/mock-data'
import type { Delivery } from '@/_lib/mock-data'
import { Badge } from '@/_components/ui/badge'
import { Button } from '@/_components/ui/button'
import { listDeliveries, updateDeliveryStatus } from '@/_lib/db'
import { getUser } from '@/_lib/auth'

export default function AvailableDeliveriesPage() {
  const [available, setAvailable] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    (async () => {
      const user = await getUser()
      if (user) setUserId(user.$id)
      const dels = await listDeliveries('available')
      setAvailable(dels)
      setLoading(false)
    })()
  }, [])

  async function accept(id: string) {
    await updateDeliveryStatus(id, 'picked_up', userId)
    setAvailable((prev) => prev.filter((d) => d.$id !== id))
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Deliveries</h1>
      <p className="text-sm text-muted-foreground mt-1">Pick up a new order</p>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wider text-muted-foreground">Available now</h2>
      <div className="mt-4 flex flex-col gap-4">
        {available.map((d) => (
          <div key={d.$id} className="rounded-3xl border-2 border-dashed border-primary/30 bg-primary/[0.02] p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold">{d.storeName}</p>
                  <Badge variant="warning">New</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{d.items} item{d.items > 1 ? 's' : ''}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Earn</p>
                <p className="text-xl font-extrabold text-primary">{formatPrice(d.fee)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-card border border-border p-4 text-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center shrink-0">A</div>
                <div>
                  <p className="font-bold text-xs">Pickup</p>
                  <p className="text-[11px] text-muted-foreground">{d.storeAddress}</p>
                </div>
              </div>
              <div className="ml-3 border-l-2 border-dashed border-primary/20 h-3" />
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-secondary text-[10px] font-bold text-white flex items-center justify-center shrink-0">B</div>
                <div>
                  <p className="font-bold text-xs">Drop-off</p>
                  <p className="text-[11px] text-muted-foreground">{d.customerAddress}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={() => accept(d.$id)}>Accept</Button>
              <Button variant="ghost">Skip</Button>
            </div>
          </div>
        ))}

        {available.length === 0 && (
          <div className="mt-8 text-center py-12">
            <p className="text-4xl">📦</p>
            <p className="mt-3 font-bold">All caught up</p>
            <p className="text-sm text-muted-foreground">New orders drop here</p>
          </div>
        )}
      </div>
    </div>
  )
}
