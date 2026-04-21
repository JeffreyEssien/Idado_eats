'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { formatPrice, getStatusColor, parseOrderItems } from '@/_lib/mock-data'
import type { Order } from '@/_lib/mock-data'
import { Badge } from '@/_components/ui/badge'
import { Button } from '@/_components/ui/button'
import { getOrder, getStore } from '@/_lib/db'
import { getProfile } from '@/_lib/auth'

const steps = ['pending', 'confirmed', 'preparing', 'picked_up', 'delivered'] as const
const stepLabels = ['Placed', 'Confirmed', 'Preparing', 'On the way', 'Delivered']

type BankInfo = { bankName: string; bankAccount: string; holderName: string }

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [storeBankDetails, setStoreBankDetails] = useState<BankInfo | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const o = await getOrder(id)
        setOrder(o)

        // Fetch store owner's bank details for transfer payments
        if (o.paymentMethod === 'transfer' && o.storeId) {
          try {
            const store = await getStore(o.storeId)
            if (store?.ownerId) {
              const ownerProfile = await getProfile(store.ownerId)
              if (ownerProfile?.bankName && ownerProfile?.bankAccount) {
                setStoreBankDetails({
                  bankName: ownerProfile.bankName as string,
                  bankAccount: ownerProfile.bankAccount as string,
                  holderName: (ownerProfile.businessName as string) || (ownerProfile.fullName as string) || 'Store',
                })
              }
            }
          } catch { /* non-critical */ }
        }
      } catch { /* order not found */ }
      setLoading(false)
    })()
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

      {/* Progress tracker */}
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

      {/* Items */}
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
        <div className="border-t-2 border-dashed border-border px-5 py-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Items subtotal</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery fee</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span>{formatPrice(order.total + (order.deliveryFee || 0))}</span>
          </div>
        </div>
      </div>

      {/* Payment section */}
      <div className="mt-6 flex flex-col gap-3">

        {/* ── Bank Transfer ── */}
        {order.paymentMethod === 'transfer' && (
          <>
            <div className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">🏦 Transfer to store</p>
                <span className="text-lg font-extrabold text-primary">{formatPrice(order.total + (order.deliveryFee || 0))}</span>
              </div>
              {storeBankDetails ? (
                <div className="mt-3 space-y-2">
                  <BankCard label="Account Name" value={storeBankDetails.holderName} />
                  <BankCard label="Bank" value={storeBankDetails.bankName} />
                  <BankCard label="Account Number" value={storeBankDetails.bankAccount} copyable />
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Use order ID <span className="font-mono font-bold">{order.$id.slice(0, 8)}</span> as payment reference
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground italic">Store hasn&apos;t added bank details yet — contact them directly</p>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              This includes {formatPrice(order.total)} for items + {formatPrice(order.deliveryFee || 0)} delivery fee
            </p>
          </>
        )}

        {/* ── Cash ── */}
        {order.paymentMethod === 'cash' && (
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">💵 Cash payment</p>
            <p className="mt-2 text-sm">
              Give the rider <span className="font-extrabold">{formatPrice(order.total + (order.deliveryFee || 0))}</span> when they arrive.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Items: {formatPrice(order.total)} + Delivery: {formatPrice(order.deliveryFee || 0)}. The rider remits the item cost to the store.
            </p>
          </div>
        )}

        {/* Rider info */}
        {order.riderName && (
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Rider</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {order.riderName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm">{order.riderName}</p>
                {order.riderPhone && (
                  <a href={`tel:${order.riderPhone}`} className="text-xs text-primary hover:underline">{order.riderPhone}</a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        Ordered {new Date(order.$createdAt).toLocaleString()}
      </p>
    </div>
  )
}

function BankCard({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-background border border-border p-3">
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`font-bold text-sm ${copyable ? 'font-mono tracking-wide' : ''}`}>{value}</p>
      </div>
      {copyable && (
        <button
          onClick={() => navigator.clipboard.writeText(value)}
          className="text-xs text-primary font-semibold hover:underline cursor-pointer"
        >
          Copy
        </button>
      )}
    </div>
  )
}
