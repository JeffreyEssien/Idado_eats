'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/_components/ui/input'
import { Button } from '@/_components/ui/button'
import { getUser, getProfile, updateProfile, updatePassword } from '@/_lib/auth'

export default function RiderSettingsPage() {
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    vehicleType: '',
    bankName: '',
    bankAccount: '',
  })

  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState({ type: '' as 'success' | 'error' | '', text: '' })

  useEffect(() => {
    (async () => {
      const user = await getUser()
      if (!user) return
      setUserId(user.$id)
      const profile = await getProfile(user.$id)
      if (profile) {
        setForm({
          fullName: (profile.fullName as string) || '',
          email: (profile.email as string) || '',
          phone: (profile.phone as string) || '',
          address: (profile.address as string) || '',
          vehicleType: (profile.vehicleType as string) || '',
          bankName: (profile.bankName as string) || '',
          bankAccount: (profile.bankAccount as string) || '',
        })
      }
      setLoading(false)
    })()
  }, [])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    setSaved(false)
    try {
      await updateProfile(userId, form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg({ type: '', text: '' })
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'Passwords do not match' })
      return
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }
    setPwSaving(true)
    try {
      await updatePassword(pwForm.oldPassword, pwForm.newPassword)
      setPwMsg({ type: 'success', text: 'Password updated successfully' })
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' })
    } catch (err: unknown) {
      setPwMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update password' })
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="mt-3 text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage your rider profile</p>

      {/* Profile form */}
      <form onSubmit={handleSave} className="mt-6">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Personal Information</p>
          <div className="mt-4 flex flex-col gap-4">
            <Input label="Full Name" id="fullName" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email" id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
              <Input label="Phone" id="phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
            <Input label="Address" id="address" value={form.address} onChange={(e) => update('address', e.target.value)} />
            <Input label="Vehicle Type" id="vehicleType" placeholder="e.g. Bicycle, Motorcycle" value={form.vehicleType} onChange={(e) => update('vehicleType', e.target.value)} />
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bank Details</p>
          <p className="text-xs text-muted-foreground mt-1">Displayed to customers for delivery fee payment</p>
          <div className="mt-4 flex flex-col gap-4">
            <Input label="Bank Name" id="bankName" placeholder="e.g. Access Bank, GTBank" value={form.bankName} onChange={(e) => update('bankName', e.target.value)} />
            <Input label="Account Number" id="bankAccount" placeholder="0123456789" value={form.bankAccount} onChange={(e) => update('bankAccount', e.target.value)} />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">{error}</div>
        )}
        {saved && (
          <div className="mt-4 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">Profile saved</div>
        )}

        <Button type="submit" className="mt-5 w-full" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>

      {/* Password form */}
      <form onSubmit={handlePasswordChange} className="mt-4">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Change Password</p>
          <div className="mt-4 flex flex-col gap-4">
            <Input label="Current Password" id="oldPassword" type="password" value={pwForm.oldPassword} onChange={(e) => setPwForm((p) => ({ ...p, oldPassword: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="New Password" id="newPassword" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} required />
              <Input label="Confirm" id="confirmPw" type="password" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} required />
            </div>
          </div>

          {pwMsg.text && (
            <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${pwMsg.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'}`}>
              {pwMsg.text}
            </div>
          )}

          <Button type="submit" variant="outline" className="mt-5 w-full" disabled={pwSaving}>
            {pwSaving ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </div>
  )
}
