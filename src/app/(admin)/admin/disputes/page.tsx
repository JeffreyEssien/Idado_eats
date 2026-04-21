'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/_components/ui/badge'
import { Button } from '@/_components/ui/button'
import { listAllDisputes, updateDisputeStatus } from '@/_lib/db'
import type { Dispute, DisputeStatus } from '@/_lib/mock-data'
import { getDisputeStatusColor } from '@/_lib/mock-data'

const statusOptions: { value: DisputeStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const roleColors: Record<string, string> = {
  customer: 'bg-orange-500/10 text-orange-600',
  business: 'bg-emerald-500/10 text-emerald-600',
  rider: 'bg-indigo-500/10 text-indigo-600',
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | DisputeStatus>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    loadDisputes()
  }, [])

  async function loadDisputes() {
    try {
      const d = await listAllDisputes()
      setDisputes(d)
    } catch { /* collection may not exist */ }
    setLoading(false)
  }

  async function changeStatus(id: string, status: DisputeStatus) {
    setUpdating(id)
    try {
      await updateDisputeStatus(id, status)
      setDisputes((prev) => prev.map((d) => d.$id === id ? { ...d, status } : d))
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter === 'all' ? disputes : disputes.filter((d) => d.status === filter)
  const counts = {
    all: disputes.length,
    open: disputes.filter((d) => d.status === 'open').length,
    in_review: disputes.filter((d) => d.status === 'in_review').length,
    resolved: disputes.filter((d) => d.status === 'resolved').length,
    closed: disputes.filter((d) => d.status === 'closed').length,
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-danger border-t-transparent animate-spin" />
          <p className="mt-3 text-sm text-muted-foreground">Loading disputes...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Disputes</h1>
      <p className="text-sm text-muted-foreground mt-1">Review and resolve user tickets</p>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2 flex-wrap">
        {(['all', 'open', 'in_review', 'resolved', 'closed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-[12px] font-semibold tracking-wide transition-all ${filter === s ? 'bg-foreground text-background' : 'bg-surface border border-border text-muted-foreground hover:text-foreground'}`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ')} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Dispute list */}
      <div className="mt-6 flex flex-col gap-3">
        {filtered.map((d) => (
          <div key={d.$id} className="rounded-3xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === d.$id ? null : d.$id)}
              className="w-full p-5 text-left cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-muted-foreground">{d.ticketId}</span>
                    <Badge variant={getDisputeStatusColor(d.status)}>{d.status.replace('_', ' ')}</Badge>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${roleColors[d.userRole] || ''}`}>
                      {d.userRole}
                    </span>
                  </div>
                  <p className="mt-1.5 font-bold leading-tight">{d.subject}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d.userName} &middot; {d.category.replace('_', ' ')} &middot; {new Date(d.$createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-muted-foreground/40 text-lg shrink-0">{expanded === d.$id ? '▲' : '▼'}</span>
              </div>
            </button>

            {expanded === d.$id && (
              <div className="border-t border-border px-5 pb-5 pt-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{d.description}</p>
                {d.orderId && (
                  <p className="mt-2 text-xs text-muted-foreground">Order ID: <span className="font-mono">{d.orderId}</span></p>
                )}

                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">Set status:</span>
                  {statusOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={d.status === opt.value ? 'primary' : 'outline'}
                      size="sm"
                      disabled={updating === d.$id || d.status === opt.value}
                      onClick={() => changeStatus(d.$id, opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="mt-4 rounded-3xl border border-dashed border-border bg-surface/30 py-16 text-center">
            <p className="text-4xl">🎫</p>
            <p className="mt-4 font-bold text-lg">No disputes{filter !== 'all' ? ` with status "${filter.replace('_', ' ')}"` : ''}</p>
            <p className="mt-1 text-sm text-muted-foreground">Tickets from users will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
