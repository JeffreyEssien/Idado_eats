'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/_lib/mock-data'
import { Button } from '@/_components/ui/button'
import { useCart } from '@/_components/providers/cart-provider'
import { useAuth } from '@/_components/providers/auth-provider'
import { createOrder, getStore } from '@/_lib/db'
import { getCurrentPosition, haversineKm, calculateDeliveryFee } from '@/_lib/delivery-fee'

export default function CartPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { items, addItem, removeItem, clearCart, totalPrice } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('transfer')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [feeLoading, setFeeLoading] = useState(false)
  const [feeError, setFeeError] = useState('')
  const [distanceKm, setDistanceKm] = useState<number | null>(null)

  const total = totalPrice + (deliveryFee ?? 0)

  // Calculate delivery fee when cart has items
  useEffect(() => {
    if (items.length === 0) return
    calculateFee()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length > 0 ? items[0].storeId : ''])

  async function calculateFee() {
    setFeeLoading(true)
    setFeeError('')
    try {
      const store = await getStore(items[0].storeId)
      if (!store.latitude || !store.longitude) {
        // Store has no coordinates — use minimum fee
        setDeliveryFee(500)
        setFeeError('Store location not set — using minimum fee')
        return
      }

      const pos = await getCurrentPosition()
      const dist = haversineKm(pos.lat, pos.lng, store.latitude, store.longitude)
      setDistanceKm(dist)
      setDeliveryFee(calculateDeliveryFee(dist))
    } catch {
      // Geolocation denied or failed — use minimum fee
      setDeliveryFee(500)
      setFeeError('Could not get your location — using minimum fee')
    } finally {
      setFeeLoading(false)
    }
  }

  // Redirect unauthenticated users
  if (!authLoading && !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-center px-6">
        <div>
          <p className="text-4xl">🔒</p>
          <p className="mt-4 text-lg font-bold">Sign in to view your cart</p>
          <p className="mt-1 text-sm text-muted-foreground">You need an account to place orders</p>
          <div className="mt-6 flex flex-col gap-3 items-center">
            <Button onClick={() => router.push('/register')}>Create Account</Button>
            <Button onClick={() => router.push('/login')} variant="outline">Sign In</Button>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
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

  async function handlePlaceOrder() {
    if (!user || deliveryFee === null) return
    setPlacing(true)
    setError('')
    try {
      const orderItems = items.map((e) => ({
        name: e.product.name,
        quantity: e.quantity,
        price: e.product.price,
      }))
      await createOrder({
        userId: user.$id,
        storeId: items[0].storeId,
        storeName: items[0].storeName,
        items: JSON.stringify(orderItems),
        total: totalPrice,
        deliveryFee,
        status: 'pending',
        paymentMethod,
      })
      clearCart()
      router.push('/orders')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place order'
      setError(msg)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Your cart</h1>
      <p className="text-sm text-muted-foreground mt-1">From {items[0].storeName}</p>

      {error && (
        <div className="mt-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {items.map((entry) => (
            <div key={entry.product.$id} className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-xl">🍽️</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] truncate">{entry.product.name}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(entry.product.price)} each</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => removeItem(entry.product.$id)} className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-xs font-bold hover:bg-surface transition-colors">−</button>
                <span className="w-6 text-center text-sm font-extrabold">{entry.quantity}</span>
                <button onClick={() => addItem(entry.product, entry.storeId, entry.storeName)} className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold hover:bg-primary-dark transition-colors">+</button>
              </div>
              <p className="font-bold text-sm w-20 text-right shrink-0">{formatPrice(entry.product.price * entry.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-dashed border-border px-5 py-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              Delivery
              {distanceKm !== null && (
                <span className="text-[10px] bg-surface rounded-full px-2 py-0.5">{distanceKm.toFixed(1)} km</span>
              )}
            </span>
            {feeLoading ? (
              <span className="text-xs animate-pulse">Calculating...</span>
            ) : deliveryFee !== null ? (
              <span>{formatPrice(deliveryFee)}</span>
            ) : (
              <span className="text-xs">—</span>
            )}
          </div>
          {feeError && (
            <p className="text-[11px] text-amber-600">{feeError}</p>
          )}
          <div className="flex justify-between font-extrabold text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pay with</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {([
            { key: 'transfer' as const, icon: '🏦', title: 'Bank Transfer', sub: 'Pay store directly' },
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

      <Button className="mt-8 w-full" size="lg" onClick={handlePlaceOrder} disabled={placing || deliveryFee === null}>
        {placing ? 'Placing order...' : `Place order · ${formatPrice(total)}`}
      </Button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        {paymentMethod === 'transfer'
          ? 'Store bank details shown after placing. Delivery fee included.'
          : 'Pay the total to the rider on arrival. Rider remits item cost to store.'}
      </p>
    </div>
  )
}
