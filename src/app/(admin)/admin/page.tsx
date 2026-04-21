'use client'

import { useState, useEffect } from 'react'
import { listAllDisputes } from '@/_lib/db'
import type { Dispute } from '@/_lib/mock-data'

export default function AdminOverviewPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const d = await listAllDisputes()
        setDisputes(d)
      } catch { /* collection may not exist yet */ }
      setLoading(false)
    })()
  }, [])

  const openDisputes = disputes.filter((d) => d.status === 'open').length
  const inReview = disputes.filter((d) => d.status === 'in_review').length
  const resolved = disputes.filter((d) => d.status === 'resolved' || d.status === 'closed').length

  const stats = [
    { label: 'Open Disputes', value: String(openDisputes), icon: '🎫', color: 'text-amber-500' },
    { label: 'In Review', value: String(inReview), icon: '🔍', color: 'text-blue-500' },
    { label: 'Resolved', value: String(resolved), icon: '✅', color: 'text-success' },
    { label: 'Total Tickets', value: String(disputes.length), icon: '📊', color: 'text-foreground' },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-danger border-t-transparent animate-spin" />
          <p className="mt-3 text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Admin Overview</h1>
      <p className="text-sm text-muted-foreground mt-1">Platform management dashboard</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <span className="text-xl">{s.icon}</span>
            </div>
            <p className={`mt-3 text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-dashed border-border bg-surface/30 p-10 text-center">
        <p className="text-4xl">🚧</p>
        <p className="mt-4 text-lg font-bold">Admin Panel — Work in Progress</p>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          Use the sidebar to navigate between sections. Full management features coming soon.
        </p>
      </div>
    </div>
  )
}
