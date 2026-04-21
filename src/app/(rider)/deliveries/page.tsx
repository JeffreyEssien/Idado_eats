'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatPrice } from '@/_lib/mock-data'
import type { Delivery } from '@/_lib/mock-data'
import { Badge } from '@/_components/ui/badge'
import { Button } from '@/_components/ui/button'
import { Toggle } from '@/_components/ui/toggle'
import { listDeliveries, updateDeliveryStatus } from '@/_lib/db'
import { getUser, getProfile, updateProfile } from '@/_lib/auth'

export default function AvailableDeliveriesPage() {
  const [available, setAvailable] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [isOnline, setIsOnline] = useState(false)
  const [togglingOnline, setTogglingOnline] = useState(false)

  const refresh = useCallback(async () => {
    const dels = await listDeliveries('available')
    setAvailable(dels)
  }, [])

  useEffect(() => {
    (async () => {
      const user = await getUser()
      if (user) {
        setUserId(user.$id)
        const profile = await getProfile(user.$id)
        setIsOnline(profile?.isAvailable === true)
      }
      await refresh()
      setLoading(false)
    })()
  }, [refresh])

  async function toggleOnline(val: boolean) {
    setTogglingOnline(true)
    try {
      await updateProfile(userId, { isAvailable: val })
      setIsOnline(val)
    } finally {
      setTogglingOnline(false)
    }
  }

  async function accept(id: string) {
    setAccepting(id)
    try {
      await updateDeliveryStatus(id, 'picked_up', userId)
      setAvailable((prev) => prev.filter((d) => d.$id !== id))
    } finally {
      setAccepting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="mt-3 text-sm text-muted-foreground">Finding deliveries...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Online toggle */}
      <div className={`rounded-3xl border p-4 flex items-center justify-between ${isOnline ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${isOnline ? 'bg-primary/15' : 'bg-surface'}`}>
            {isOnline ? '🟢' : '⚫'}
          </div>
          <div>
            <p className="font-bold text-sm">{isOnline ? 'You\'re Online' : 'You\'re Offline'}</p>
            <p className="text-[11px] text-muted-foreground">
              {isOnline ? 'Accepting new deliveries' : 'Toggle on to see orders'}
            </p>
          </div>
        </div>
        <Toggle checked={isOnline} onChange={toggleOnline} disabled={togglingOnline} />
      </div>

      {/* Header */}
      <div className="mt-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Available Deliveries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {available.length} order{available.length !== 1 ? 's' : ''} waiting for pickup
          </p>
        </div>
        <button
          onClick={refresh}
          className="rounded-full p-2 text-muted-foreground hover:bg-surface hover:text-foreground transition-all cursor-pointer"
          title="Refresh"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
        </button>
      </div>

      {/* Delivery cards */}
      <div className="mt-6 flex flex-col gap-4">
        {available.map((d) => (
          <div
            key={d.$id}
            className="rounded-3xl border border-border bg-card overflow-hidden transition-all hover:shadow-md"
          >
            {/* Top row: store + fee */}
            <div className="flex items-center justify-between p-5 pb-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-lg">
                  🏪
                </div>
                <div>
                  <p className="font-bold leading-tight">{d.storeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.items} item{d.items > 1 ? 's' : ''} &middot; {formatPrice(d.total)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fee</p>
                <p className="text-xl font-extrabold text-primary leading-tight">{formatPrice(d.fee)}</p>
              </div>
            </div>

            {/* Route */}
            <div className="mx-5 mt-4 rounded-2xl bg-surface/50 border border-border/50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center shrink-0">P</div>
                  <div className="w-px flex-1 min-h-[20px] border-l-2 border-dashed border-primary/25 my-1" />
                  <div className="h-7 w-7 rounded-full bg-secondary text-[10px] font-bold text-white flex items-center justify-center shrink-0">D</div>
                </div>
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pickup</p>
                    <p className="text-sm font-medium truncate">{d.storeAddress}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Drop-off</p>
                    <p className="text-sm font-medium truncate">{d.customerAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-5 pt-4">
              <Button
                className="flex-1"
                onClick={() => accept(d.$id)}
                disabled={accepting === d.$id}
              >
                {accepting === d.$id ? 'Accepting...' : 'Accept Delivery'}
              </Button>
            </div>
          </div>
        ))}

        {available.length === 0 && (
          <div className="mt-4 rounded-3xl border border-dashed border-border bg-surface/30 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface text-3xl">
              📦
            </div>
            <p className="mt-4 font-bold text-lg">No deliveries right now</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              New orders will appear here. Pull down to refresh.
            </p>
            <Button variant="outline" className="mt-5" onClick={refresh}>
              Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
