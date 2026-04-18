'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/_lib/mock-data'
import type { Store, Product } from '@/_lib/mock-data'
import { Button } from '@/_components/ui/button'
import { getStore, listProducts } from '@/_lib/db'

const typeBg: Record<string, string> = {
  restaurant: 'from-orange-100 to-red-50 dark:from-orange-950/30 dark:to-red-950/15',
  mart: 'from-emerald-100 to-green-50 dark:from-emerald-950/30 dark:to-green-950/15',
  store: 'from-blue-100 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/15',
}
const typeEmoji: Record<string, string> = { restaurant: '🍽️', mart: '🛒', store: '🏪' }

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    Promise.all([getStore(id), listProducts(id)])
      .then(([s, p]) => { setStore(s); setProducts(p); setLoading(false) })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
  }

  if (notFound || !store) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-center">
        <div>
          <p className="text-5xl">🫥</p>
          <p className="mt-4 font-bold text-lg">Store not found</p>
          <Button href="/stores" variant="outline" className="mt-4">Go back</Button>
        </div>
      </div>
    )
  }

  const categories = [...new Set(products.map((p) => p.category))]
  const filteredProducts = activeCategory ? products.filter((p) => p.category === activeCategory) : products

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const cartTotal = Object.entries(cart).reduce((sum, [pid, qty]) => {
    const p = products.find((x) => x.$id === pid)
    return sum + (p ? p.price * qty : 0)
  }, 0)

  function add(pid: string) { setCart((c) => ({ ...c, [pid]: (c[pid] || 0) + 1 })) }
  function remove(pid: string) {
    setCart((c) => {
      const n = { ...c }
      if (n[pid] > 1) n[pid]--; else delete n[pid]
      return n
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <Link href="/stores" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">← Stores</Link>

      <div className={`mt-4 rounded-[2rem] bg-gradient-to-br ${typeBg[store.type]} border border-border/50 p-8 sm:p-10 relative overflow-hidden`}>
        <div className="absolute top-[-60px] right-[-60px] w-[250px] h-[250px] rounded-full bg-white/20 dark:bg-white/5 blur-[80px] pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {store.isOpen ? (
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-success bg-success/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />Open
                </span>
              ) : (
                <span className="text-[11px] font-bold text-danger bg-danger/10 px-2.5 py-1 rounded-full uppercase tracking-wider">Closed</span>
              )}
              <span className="text-[11px] font-bold text-muted-foreground bg-background/60 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">{store.type}</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">{store.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">{store.description}</p>
            <div className="mt-5 flex gap-5">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-extrabold">★ {store.rating}</span>
                <span className="text-muted-foreground text-xs">rating</span>
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-extrabold">{store.deliveryTime}</span>
                <span className="text-muted-foreground text-xs">delivery</span>
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-extrabold">{products.length}</span>
                <span className="text-muted-foreground text-xs">items</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/60 dark:bg-white/10 backdrop-blur-sm text-4xl">
            {typeEmoji[store.type]}
          </div>
        </div>
      </div>

      <div className="sticky top-14 z-20 -mx-6 px-6 py-3 bg-background/90 backdrop-blur-md border-b border-transparent [&:not(:first-child)]:border-border/50">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold tracking-wide transition-all duration-200 ${!activeCategory ? 'bg-foreground text-background shadow-md shadow-foreground/10' : 'bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'}`}
          >All</button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold tracking-wide transition-all duration-200 ${activeCategory === cat ? 'bg-foreground text-background shadow-md shadow-foreground/10' : 'bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'}`}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {filteredProducts.map((product) => (
          <div
            key={product.$id}
            className={`group flex items-center gap-4 rounded-3xl border border-border bg-card p-4 transition-all duration-200 ${product.inStock ? 'hover:bg-surface hover:shadow-md hover:shadow-black/[0.03] hover:-translate-y-0.5' : 'opacity-40'}`}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-2xl transition-transform duration-200 group-hover:scale-105">
              {typeEmoji[store.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[13px] truncate">{product.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{product.description}</p>
              <p className="mt-1.5 text-sm font-extrabold text-primary">{formatPrice(product.price)}</p>
            </div>
            {product.inStock && (
              <div className="flex items-center gap-1.5 shrink-0">
                {cart[product.$id] ? (
                  <>
                    <button onClick={() => remove(product.$id)} className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-sm font-bold hover:bg-surface transition-colors">−</button>
                    <span className="w-6 text-center text-sm font-extrabold">{cart[product.$id]}</span>
                    <button onClick={() => add(product.$id)} className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold hover:bg-primary-dark transition-all hover:scale-105">+</button>
                  </>
                ) : (
                  <button onClick={() => add(product.$id)} className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold hover:bg-primary-dark hover:scale-110 transition-all shadow-md shadow-primary/20">+</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-40 sm:w-[360px]">
          <Link
            href="/cart"
            className="flex items-center justify-between rounded-full bg-secondary text-white px-6 py-4 shadow-2xl shadow-black/30 hover:bg-secondary-dark transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-extrabold">{cartCount}</span>
              <span className="font-bold text-[15px]">View cart</span>
            </div>
            <span className="font-extrabold text-[15px]">{formatPrice(cartTotal)}</span>
          </Link>
        </div>
      )}
    </div>
  )
}
