'use client'

import { useState } from 'react'
import { formatPrice } from '@/_lib/mock-data'
import { Button } from '@/_components/ui/button'

// Cart is client-side state — items are added from the store detail page.
// TODO: Wire up a cart context or localStorage to persist items across pages.

export default function CartPage() {
  const [cartItems] = useState<{ productId: string; name: string; price: number; quantity: number }[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('transfer')

  const subtotal = cartItems.reduce((sum, ci) => sum + ci.price * ci.quantity, 0)
  const deliveryFee = 500
  const total = subtotal + deliveryFee

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-center px-6">
        <div>
          <p className="text-5xl">🛒</p>
          <p className="mt-4 text-lg font-bold">Cart&apos;s empty</p>
          <p className="mt-1 text-sm text-muted-foreground">Go find something good</p>
          <Button href="/stores" className="mt-6">Browse stores</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Your cart</h1>

      <div className="mt-8 rounded-3xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {cartItems.map((ci) => (
            <div key={ci.productId} className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-xl">🍽️</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] truncate">{ci.name}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(ci.price)} each</p>
              </div>
              <span className="text-sm font-bold">{ci.quantity}x</span>
              <p className="font-bold text-sm w-20 text-right shrink-0">{formatPrice(ci.price * ci.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-dashed border-border px-5 py-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery</span><span>{formatPrice(deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-extrabold text-lg pt-2 border-t border-border">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pay with</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {([
            { key: 'transfer' as const, icon: '🏦', title: 'Bank Transfer', sub: 'Pay directly to store' },
            { key: 'cash' as const, icon: '💵', title: 'Cash', sub: 'Pay rider on arrival' },
          ]).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPaymentMethod(opt.key)}
              className={`rounded-2xl border-2 p-4 text-left transition-all ${paymentMethod === opt.key ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-muted-foreground/30'}`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <p className="mt-2 text-[13px] font-bold">{opt.title}</p>
              <p className="text-[10px] text-muted-foreground">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <Button className="mt-8 w-full" size="lg">
        Place order · {formatPrice(total)}
      </Button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        {paymentMethod === 'transfer' ? 'Bank details will be shown after placing' : 'Pay the rider when they arrive'}
      </p>
    </div>
  )
}
