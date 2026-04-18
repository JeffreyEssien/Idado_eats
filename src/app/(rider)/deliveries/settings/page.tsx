'use client'

import { useState } from 'react'
import { Input } from '@/_components/ui/input'
import { Button } from '@/_components/ui/button'
import { Card } from '@/_components/ui/card'

export default function RiderSettingsPage() {
  const [form, setForm] = useState({
    fullName: 'Emeka Johnson',
    email: 'emeka@example.com',
    phone: '08012345678',
    address: '5 Marina Close, Idado Estate',
    vehicleType: 'Motorcycle',
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
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your rider profile</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <Card>
          <h2 className="font-semibold">Personal Information</h2>
          <div className="mt-4 flex flex-col gap-4">
            <Input
              label="Full Name"
              id="fullName"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
            />
            <Input
              label="Email"
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
            <Input
              label="Phone Number"
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
            <Input
              label="Address"
              id="address"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
            <Input
              label="Vehicle Type"
              id="vehicleType"
              value={form.vehicleType}
              onChange={(e) => update('vehicleType', e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">Bank Details</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Where you receive your delivery fee payments
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
