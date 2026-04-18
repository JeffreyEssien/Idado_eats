'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/_components/ui/button"
import { formatPrice } from "@/_lib/mock-data"
import type { Store } from "@/_lib/mock-data"
import { listStores } from "@/_lib/db"

export default function Home() {
  const [featured, setFeatured] = useState<Store[]>([])

  useEffect(() => {
    listStores().then((stores) => setFeatured(stores.filter((s) => s.isOpen).slice(0, 3)))
  }, [])

  return (
    <div className="min-h-screen bg-secondary text-white overflow-hidden">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6 max-w-[1400px] mx-auto">
        <span className="text-xl font-extrabold tracking-tight">
          idado<span className="text-primary">.</span>
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" href="/login" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
            Log in
          </Button>
          <Button href="/register" size="sm">Join free</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 sm:px-10 pt-10 sm:pt-16 pb-32 max-w-[1400px] mx-auto">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/8 blur-[120px] pointer-events-none" />

        <div className="relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-white/70 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Serving Idado Estate
            </div>

            <h1 className="mt-8 text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tighter">
              Hungry?
              <br />
              <span className="text-primary">We got you.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-white/70 max-w-md leading-relaxed">
              Restaurants, marts, pharmacies — everything inside the estate,
              delivered to your door. No stress.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/stores" size="lg" className="text-[15px] px-8">
                Order now
              </Button>
              <Button href="/register" variant="ghost" size="lg" className="text-white/60 hover:text-white border border-white/10 hover:bg-white/5 text-[15px]">
                Create account
              </Button>
            </div>

            <div className="mt-12 flex gap-8 text-sm">
              {[
                { v: '50+', l: 'Stores' },
                { v: '15min', l: 'Avg delivery' },
                { v: '2,000+', l: 'Orders served' },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-xl font-extrabold">{s.v}</p>
                  <p className="text-[11px] text-white/50 font-semibold uppercase tracking-wider mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block relative h-[520px]">
            <div className="absolute top-0 right-0 w-[280px] rounded-3xl bg-white/[0.07] backdrop-blur-md border border-white/10 p-5 rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xl">🍽️</div>
                <div>
                  <p className="font-bold text-sm">Mama Nkechi Kitchen</p>
                  <p className="text-[11px] text-white/40">★ 4.8 · 25-35 min</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Jollof Rice & Chicken</span>
                  <span className="font-bold">{formatPrice(2500)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Pounded Yam & Egusi</span>
                  <span className="font-bold">{formatPrice(3000)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Chapman</span>
                  <span className="font-bold">{formatPrice(800)}</span>
                </div>
              </div>
              <div className="mt-4 rounded-full bg-primary py-2 text-center text-xs font-bold">
                Order · {formatPrice(6300)}
              </div>
            </div>

            <div className="absolute top-40 left-0 w-[240px] rounded-3xl bg-white/[0.07] backdrop-blur-md border border-white/10 p-5 -rotate-3 hover:rotate-0 transition-transform duration-500">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Live tracking</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center">
                  <span className="text-success text-sm">🚴</span>
                </div>
                <div>
                  <p className="text-xs font-bold">Emeka is on the way</p>
                  <p className="text-[10px] text-white/40">Arriving in 5 min</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[75%] rounded-full bg-success" />
              </div>
            </div>

            <div className="absolute bottom-10 right-10 w-[220px] rounded-3xl bg-white/[0.07] backdrop-blur-md border border-white/10 p-5 rotate-1 hover:rotate-0 transition-transform duration-500">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Payment</p>
              <div className="mt-3 flex gap-3">
                <div className="flex-1 rounded-2xl bg-white/5 p-3 text-center border border-white/10">
                  <p className="text-lg">💵</p>
                  <p className="text-[10px] font-semibold mt-1">Cash</p>
                </div>
                <div className="flex-1 rounded-2xl bg-primary/20 p-3 text-center border border-primary/30">
                  <p className="text-lg">🏦</p>
                  <p className="text-[10px] font-semibold mt-1">Transfer</p>
                </div>
              </div>
            </div>

            <div className="absolute top-[300px] right-[260px] rounded-full bg-accent px-4 py-2 text-xs font-bold text-secondary shadow-lg shadow-accent/30 -rotate-6">
              No delivery fees*
            </div>
          </div>
        </div>
      </section>

      {/* White section */}
      <section className="bg-background text-foreground rounded-t-[3rem]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-20 sm:py-28">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { emoji: '🍽️', name: 'Restaurants', desc: 'Jollof, shawarma, smoothies, grills — hot meals ready now', bg: 'from-orange-100 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/20' },
              { emoji: '🛒', name: 'Marts & Groceries', desc: 'Rice, oil, eggs, fresh vegetables — your weekly restock', bg: 'from-emerald-100 to-green-50 dark:from-emerald-950/40 dark:to-green-950/20' },
              { emoji: '🏪', name: 'Shops & Pharmacy', desc: 'Provisions, toiletries, medicine, everything in between', bg: 'from-blue-100 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/20' },
            ].map((c) => (
              <Link
                key={c.name}
                href="/stores"
                className={`group rounded-[2rem] bg-gradient-to-br ${c.bg} border border-border/50 p-7 flex flex-col gap-6 hover:-translate-y-1 transition-all duration-300`}
              >
                <span className="text-5xl">{c.emoji}</span>
                <div>
                  <p className="text-lg font-extrabold group-hover:text-primary transition-colors">{c.name}</p>
                  <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-20">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">How it works</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Three taps. That&apos;s it.
            </h2>
            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {[
                { n: '01', title: 'Pick a store', desc: 'Browse restaurants, marts, and shops. See what\'s open, what\'s popular, what\'s close.' },
                { n: '02', title: 'Build your cart', desc: 'Add what you want. Pay with cash when the rider arrives, or transfer directly to the store.' },
                { n: '03', title: 'Sit tight', desc: 'A rider picks it up and brings it to your door. Track it live. Average delivery: 15 minutes.' },
              ].map((step) => (
                <div key={step.n} className="flex gap-5">
                  <span className="text-5xl font-extrabold text-border leading-none shrink-0">{step.n}</span>
                  <div>
                    <p className="font-extrabold">{step.title}</p>
                    <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {featured.length > 0 && (
            <div className="mt-20">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Open now</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Popular stores</h2>
                </div>
                <Button href="/stores" variant="outline" size="sm">View all →</Button>
              </div>
              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                {featured.map((store) => (
                  <Link
                    key={store.$id}
                    href={`/stores/${store.$id}`}
                    className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-4 hover:bg-surface hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="h-14 w-14 rounded-2xl bg-surface flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                      {store.type === 'restaurant' ? '🍽️' : store.type === 'mart' ? '🛒' : '🏪'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[13px] truncate group-hover:text-primary transition-colors">{store.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">★ {store.rating} · {store.deliveryTime}</p>
                    </div>
                    <span className="text-muted-foreground/30 group-hover:text-primary text-lg transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-20 grid sm:grid-cols-2 gap-4">
            <div className="rounded-[2rem] bg-primary p-8 sm:p-10 text-white flex flex-col justify-between min-h-[240px]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">For business owners</p>
                <h3 className="mt-4 text-2xl font-extrabold leading-tight">
                  Your store.<br />More customers.<br />Zero hassle.
                </h3>
              </div>
              <Button href="/register/business" variant="ghost" size="sm" className="self-start mt-6 bg-white/15 text-white hover:bg-white/25">
                Register your store →
              </Button>
            </div>
            <div className="rounded-[2rem] bg-secondary text-white p-8 sm:p-10 flex flex-col justify-between min-h-[240px] relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-indigo-500/15 blur-2xl" />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">For riders</p>
                <h3 className="mt-4 text-2xl font-extrabold leading-tight">
                  Deliver orders.<br />Earn daily.<br />Your schedule.
                </h3>
              </div>
              <Button href="/register/rider" variant="ghost" size="sm" className="self-start mt-6 bg-white/10 text-white hover:bg-white/20 relative">
                Become a rider →
              </Button>
            </div>
          </div>

          <div className="mt-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to try it?
            </h2>
            <p className="mt-3 text-muted-foreground">Join hundreds of residents already ordering.</p>
            <div className="mt-8 flex justify-center gap-3">
              <Button href="/register" size="lg" className="text-[15px] px-10">Get started</Button>
            </div>
          </div>
        </div>

        <footer className="border-t border-border px-6 sm:px-10 py-8 max-w-[1400px] mx-auto flex items-center justify-between">
          <span className="text-sm font-extrabold">idado<span className="text-primary">.</span></span>
          <p className="text-[11px] text-muted-foreground">&copy; 2026 Idado Eats</p>
        </footer>
      </section>
    </div>
  )
}
