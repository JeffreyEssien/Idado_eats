'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/_components/ui/badge'
import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { Textarea } from '@/_components/ui/textarea'
import { Select } from '@/_components/ui/select'
import { getUser, getProfile, type UserRole } from '@/_lib/auth'
import { createDispute, listDisputesByUser } from '@/_lib/db'
import type { Dispute, DisputeStatus } from '@/_lib/mock-data'
import { getDisputeStatusColor } from '@/_lib/mock-data'

const categories: Record<UserRole, { value: string; label: string }[]> = {
  customer: [
    { value: 'wrong_order', label: 'Wrong order received' },
    { value: 'missing_items', label: 'Missing items' },
    { value: 'late_delivery', label: 'Late delivery' },
    { value: 'damaged_items', label: 'Damaged items' },
    { value: 'overcharged', label: 'Overcharged' },
    { value: 'rider_issue', label: 'Issue with rider' },
    { value: 'other', label: 'Other' },
  ],
  business: [
    { value: 'payment_issue', label: 'Payment not received' },
    { value: 'false_complaint', label: 'False customer complaint' },
    { value: 'rider_issue', label: 'Issue with rider' },
    { value: 'order_cancellation', label: 'Unfair cancellation' },
    { value: 'platform_issue', label: 'Platform/technical issue' },
    { value: 'other', label: 'Other' },
  ],
  rider: [
    { value: 'payment_issue', label: 'Delivery fee not paid' },
    { value: 'customer_issue', label: 'Issue with customer' },
    { value: 'store_issue', label: 'Issue with store' },
    { value: 'wrong_address', label: 'Wrong delivery address' },
    { value: 'safety_concern', label: 'Safety concern' },
    { value: 'other', label: 'Other' },
  ],
}

function generateTicketId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'TKT-'
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

export function DisputePanel({ role }: { role: UserRole }) {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    category: categories[role][0].value,
    orderId: '',
    subject: '',
    description: '',
  })

  useEffect(() => {
    (async () => {
      const user = await getUser()
      if (!user) { setLoading(false); return }
      const list = await listDisputesByUser(user.$id)
      setDisputes(list)
      setLoading(false)
    })()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const user = await getUser()
      if (!user) return
      const profile = await getProfile(user.$id)
      const ticketId = generateTicketId()
      await createDispute({
        ticketId,
        userId: user.$id,
        userName: (profile?.fullName as string) || user.name || 'Unknown',
        userRole: role,
        orderId: form.orderId,
        category: form.category,
        subject: form.subject,
        description: form.description,
        status: 'open',
      })
      const list = await listDisputesByUser(user.$id)
      setDisputes(list)
      setForm({ category: categories[role][0].value, orderId: '', subject: '', description: '' })
      setShowForm(false)
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 4000)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="mt-3 text-sm text-muted-foreground">Loading disputes...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Disputes</h1>
          <p className="text-sm text-muted-foreground mt-1">Raise and track issue tickets</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>New Ticket</Button>
        )}
      </div>

      {submitted && (
        <div className="mt-4 rounded-2xl bg-success/10 border border-success/20 px-5 py-4 text-sm text-success font-medium">
          Ticket submitted successfully. We&apos;ll review it shortly.
        </div>
      )}

      {/* New ticket form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-3xl border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">New Dispute Ticket</p>
          <div className="mt-4 flex flex-col gap-4">
            <Select
              label="Category"
              id="category"
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              options={categories[role]}
            />
            <Input
              label="Order ID (optional)"
              id="orderId"
              placeholder="Paste the order ID if applicable"
              value={form.orderId}
              onChange={(e) => setForm((p) => ({ ...p, orderId: e.target.value }))}
            />
            <Input
              label="Subject"
              id="subject"
              placeholder="Brief summary of the issue"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              required
            />
            <Textarea
              label="Description"
              id="description"
              placeholder="Describe the issue in detail..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
            />
          </div>
          <div className="mt-5 flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Tickets list */}
      <div className="mt-6 flex flex-col gap-3">
        {disputes.map((d) => (
          <div key={d.$id} className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-muted-foreground">{d.ticketId}</span>
                  <Badge variant={getDisputeStatusColor(d.status)}>{d.status.replace('_', ' ')}</Badge>
                </div>
                <p className="mt-1.5 font-bold leading-tight">{d.subject}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{d.description}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="capitalize">{d.category.replace('_', ' ')}</span>
              {d.orderId && (
                <>
                  <span>&middot;</span>
                  <span>Order: {d.orderId.slice(0, 8)}...</span>
                </>
              )}
              <span>&middot;</span>
              <span>{new Date(d.$createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        ))}

        {disputes.length === 0 && !showForm && (
          <div className="mt-4 rounded-3xl border border-dashed border-border bg-surface/30 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface text-3xl">
              🎫
            </div>
            <p className="mt-4 font-bold text-lg">No disputes</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              If you have an issue with an order, raise a ticket and we&apos;ll sort it out.
            </p>
            <Button className="mt-5" onClick={() => setShowForm(true)}>Raise a Ticket</Button>
          </div>
        )}
      </div>
    </div>
  )
}
