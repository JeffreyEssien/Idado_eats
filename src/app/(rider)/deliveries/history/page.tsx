'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/_lib/mock-data'
import type { Delivery } from '@/_lib/mock-data'
import { Card } from '@/_components/ui/card'
import { Badge } from '@/_components/ui/badge'
import { listDeliveries } from '@/_lib/db'

export default function DeliveryHistoryPage() {
  const [past, setPast] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listDeliveries('delivered').then((dels) => {
      setPast(dels)
      setLoading(false)
    })
  }, [])

  const totalEarnings = past.reduce((sum, d) => sum + d.fee, 0)

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Delivery History</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your past deliveries and earnings</p>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="text-2xl font-bold text-primary">{formatPrice(totalEarnings)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Deliveries</p>
            <p className="text-2xl font-bold">{past.length}</p>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        {past.map((d) => (
          <Card key={d.$id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{d.storeName}</h3>
                  <Badge variant="success">Delivered</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  To: {d.customerName} &middot; {new Date(d.$createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="font-semibold text-primary">{formatPrice(d.fee)}</p>
            </div>
          </Card>
        ))}

        {past.length === 0 && (
          <div className="mt-8 text-center py-12">
            <p className="text-4xl">📜</p>
            <p className="mt-3 font-bold">No deliveries yet</p>
            <p className="text-sm text-muted-foreground">Complete your first delivery</p>
          </div>
        )}
      </div>
    </div>
  )
}
