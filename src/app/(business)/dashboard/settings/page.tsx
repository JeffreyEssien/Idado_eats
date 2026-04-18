'use client'

import { useState } from 'react'
import { Input } from '@/_components/ui/input'
import { Textarea } from '@/_components/ui/textarea'
import { Select } from '@/_components/ui/select'
import { Button } from '@/_components/ui/button'
import { Card } from '@/_components/ui/card'

export default function BusinessSettingsPage() {
  const [form, setForm] = useState({
    businessName: 'Mama Nkechi Kitchen',
    type: 'restaurant',
    description: 'Authentic Nigerian dishes made with love. Jollof rice, pounded yam, egusi soup and more.',
    address: 'Block A, Shop 3, Idado Estate',
    phone: '08012345678',
    email: 'mamankechi@example.com',
    openTime: '08:00',
    closeTime: '21:00',
    bankName: '',
    accountNumber: '',
    accountName: '',
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: Update via Supabase
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Store Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your business profile</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        {/* Business info */}
        <Card>
          <h2 className="font-semibold">Business Information</h2>
          <div className="mt-4 flex flex-col gap-4">
            <Input
              label="Business Name"
              id="businessName"
              value={form.businessName}
              onChange={(e) => update('businessName', e.target.value)}
            />
            <Select
              label="Business Type"
              id="type"
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              options={[
                { value: 'restaurant', label: 'Restaurant' },
                { value: 'mart', label: 'Mart / Grocery' },
                { value: 'store', label: 'Store / Shop' },
              ]}
            />
            <Textarea
              label="Description"
              id="description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
            <Input
              label="Address"
              id="address"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </div>
        </Card>

        {/* Contact */}
        <Card>
          <h2 className="font-semibold">Contact Details</h2>
          <div className="mt-4 flex flex-col gap-4">
            <Input
              label="Phone Number"
              id="phone"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
            <Input
              label="Email"
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
        </Card>

        {/* Hours */}
        <Card>
          <h2 className="font-semibold">Operating Hours</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Opening Time"
              id="openTime"
              type="time"
              value={form.openTime}
              onChange={(e) => update('openTime', e.target.value)}
            />
            <Input
              label="Closing Time"
              id="closeTime"
              type="time"
              value={form.closeTime}
              onChange={(e) => update('closeTime', e.target.value)}
            />
          </div>
        </Card>

        {/* Bank details for transfers */}
        <Card>
          <h2 className="font-semibold">Bank Details</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Customers who choose bank transfer will pay to this account
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <Input
              label="Bank Name"
              id="bankName"
              placeholder="e.g. GTBank, Access Bank"
              value={form.bankName}
              onChange={(e) => update('bankName', e.target.value)}
            />
            <Input
              label="Account Number"
              id="accountNumber"
              placeholder="0123456789"
              value={form.accountNumber}
              onChange={(e) => update('accountNumber', e.target.value)}
            />
            <Input
              label="Account Name"
              id="accountName"
              placeholder="Account holder name"
              value={form.accountName}
              onChange={(e) => update('accountName', e.target.value)}
            />
          </div>
        </Card>

        <Button type="submit" size="lg">
          Save Settings
        </Button>
      </form>
    </div>
  )
}
