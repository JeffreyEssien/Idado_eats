'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Store } from '@/_lib/mock-data'
import { listStores } from '@/_lib/db'

type FilterType = 'all' | 'restaurant' | 'mart' | 'store'

const typeEmoji: Record<string, string> = { restaurant: '🍽️', mart: '🛒', store: '🏪' }
const typeBg: Record<string, string> = {
  restaurant: 'from-orange-100 to-red-50 dark:from-orange-950/30 dark:to-red-950/15',
  mart: 'from-emerald-100 to-green-50 dark:from-emerald-950/30 dark:to-green-950/15',
  store: 'from-blue-100 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/15',
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listStores().then((s) => { setStores(s); setLoading(false) })
  }, [])

  const openStores = stores.filter((s) => s.isOpen)
  const filtered = stores.filter((s) => {
    if (filter !== 'all' && s.type !== filter) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading stores...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="rounded-[2rem] bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 border border-border/40 p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          What are you <span className="text-primary">craving?</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {openStores.length} stores open right now
        </p>
        <div className="mt-5 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="Search stores or items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background pl-10 pr-5 py-3.5 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:shadow-md focus:shadow-primary/5"
          />
        </div>
      </div>

      {!search && filter === 'all' && openStores.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Popular now</h2>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 snap-x">
            {openStores.slice(0, 4).map((store) => (
              <Link key={store.$id} href={`/stores/${store.$id}`} className="group flex-shrink-0 w-[260px] snap-start">
                <div className={`rounded-3xl bg-gradient-to-br ${typeBg[store.type]} border border-border/50 p-5 h-[170px] flex flex-col justify-between transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/5`}>
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-white/60 dark:bg-white/10 flex items-center justify-center text-2xl backdrop-blur-sm">
                      {typeEmoji[store.type]}
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-success bg-success/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />Open
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{store.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                      <span className="font-semibold">★ {store.rating}</span>
                      <span className="text-border">·</span>
                      <span>{store.deliveryTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-2 flex-wrap">
        {(['all', 'restaurant', 'mart', 'store'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-full px-4 py-2 text-[12px] font-semibold tracking-wide transition-all duration-200 ${filter === type ? 'bg-foreground text-background shadow-md shadow-foreground/10' : 'bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'}`}
          >
            {type === 'all' ? 'All' : `${typeEmoji[type]} ${type[0].toUpperCase() + type.slice(1)}s`}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {filtered.map((store) => (
          <Link
            key={store.$id}
            href={`/stores/${store.$id}`}
            className="group flex items-center gap-5 rounded-3xl border border-border bg-card p-4 pr-6 transition-all duration-200 hover:bg-surface hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.03]"
          >
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${typeBg[store.type]} text-3xl transition-transform duration-200 group-hover:scale-105`}>
              {typeEmoji[store.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold group-hover:text-primary transition-colors truncate">{store.name}</h3>
                {store.isOpen ? (
                  <span className="shrink-0 h-2 w-2 rounded-full bg-success" />
                ) : (
                  <span className="shrink-0 text-[10px] font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full">Closed</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{store.description}</p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">★ {store.rating}</span>
              <span>{store.deliveryTime}</span>
            </div>
            <span className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all text-lg">→</span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="mt-20 text-center">
          <p className="text-5xl">🫥</p>
          <p className="mt-4 font-bold text-lg">Nothing here</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search or filter</p>
        </div>
      )}
    </div>
  )
}
