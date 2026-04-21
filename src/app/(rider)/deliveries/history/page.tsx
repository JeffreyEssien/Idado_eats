'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/_lib/mock-data'
import type { Delivery } from '@/_lib/mock-data'
import { Badge } from '@/_components/ui/badge'
import { listDeliveries } from '@/_lib/db'
import { getUser } from '@/_lib/auth'

export default function DeliveryHistoryPage() {
  const [past, setPast] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const user = await getUser()
      if (!user) { setLoading(false); return }
      const dels = await listDeliveries('delivered')
      // Only show this rider's deliveries
      setPast(dels.filter((d) => d.riderId === user.$id))
      setLoading(false)
    })()
  }, [])

  const totalEarnings = past.reduce((sum, d) => sum + d.fee, 0)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="mt-3 text-sm text-muted-foreground">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">History</h1>
      <p className="text-sm text-muted-foreground mt-1">Your completed deliveries</p>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Earned</p>
          <p className="mt-1 text-2xl font-extrabold text-primary">{formatPrice(totalEarnings)}</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Deliveries</p>
          <p className="mt-1 text-2xl font-extrabold">{past.length}</p>
        </div>
      </div>

      {/* List */}
      <div className="mt-6 flex flex-col gap-3">
        {past.map((d) => (
          <div key={d.$id} className="rounded-3xl border border-border bg-card p-5 transition-all hover:bg-surface/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 text-lg shrink-0">
                  ✓
                </div>
                <div className="min-w-0">
                  <p className="font-bold leading-tight truncate">{d.storeName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    To {d.customerName} &middot; {d.customerAddress}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="font-extrabold text-primary">{formatPrice(d.fee)}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {new Date(d.$createdAt).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {past.length === 0 && (
          <div className="mt-4 rounded-3xl border border-dashed border-border bg-surface/30 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface text-3xl">
              📜
            </div>
            <p className="mt-4 font-bold text-lg">No deliveries yet</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              Completed deliveries and your earnings will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
