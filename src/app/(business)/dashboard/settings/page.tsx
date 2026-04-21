'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/_components/ui/input'
import { Textarea } from '@/_components/ui/textarea'
import { Select } from '@/_components/ui/select'
import { Button } from '@/_components/ui/button'
import { Toggle } from '@/_components/ui/toggle'
import { getUser, getProfile, updateProfile, updatePassword } from '@/_lib/auth'
import { listStoresByOwner, updateStoreSchedule, toggleStoreOpen, updateStore } from '@/_lib/db'
import type { Store } from '@/_lib/mock-data'

export default function BusinessSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [store, setStore] = useState<Store | null>(null)

  const [form, setForm] = useState({
    businessName: '',
    businessType: 'restaurant',
    description: '',
    address: '',
    phone: '',
    email: '',
    bankName: '',
    bankAccount: '',
  })

  const [schedule, setSchedule] = useState({
    openTime: '08:00',
    closeTime: '21:00',
    autoSchedule: false,
  })
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [scheduleSaved, setScheduleSaved] = useState(false)

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [locSaved, setLocSaved] = useState(false)

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
          businessName: (profile.businessName as string) || '',
          businessType: (profile.businessType as string) || 'restaurant',
          description: (profile.description as string) || '',
          address: (profile.address as string) || '',
          phone: (profile.phone as string) || '',
          email: (profile.email as string) || '',
          bankName: (profile.bankName as string) || '',
          bankAccount: (profile.bankAccount as string) || '',
        })
      }
      const stores = await listStoresByOwner(user.$id)
      if (stores[0]) {
        const s = stores[0]
        setStore(s)
        setSchedule({
          openTime: (s as any).openTime || '08:00',
          closeTime: (s as any).closeTime || '21:00',
          autoSchedule: (s as any).autoSchedule ?? false,
        })
        if (s.latitude && s.longitude) {
          setLocation({ lat: s.latitude, lng: s.longitude })
        }
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

  async function handleScheduleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!store) return
    setScheduleSaving(true)
    setScheduleSaved(false)
    try {
      await updateStoreSchedule(store.$id, schedule.openTime, schedule.closeTime, schedule.autoSchedule)
      setScheduleSaved(true)
      setTimeout(() => setScheduleSaved(false), 3000)
    } finally {
      setScheduleSaving(false)
    }
  }

  async function handleSetLocation() {
    if (!store) return
    setLocating(true)
    setLocSaved(false)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
      )
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      await updateStore(store.$id, { latitude: lat, longitude: lng } as any)
      setLocation({ lat, lng })
      setStore({ ...store, latitude: lat, longitude: lng })
      setLocSaved(true)
      setTimeout(() => setLocSaved(false), 3000)
    } catch {
      alert('Could not get your location. Please allow location access and try again.')
    } finally {
      setLocating(false)
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
      <h1 className="text-2xl font-extrabold tracking-tight">Store Settings</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage your business profile and schedule</p>

      {/* Business info */}
      <form onSubmit={handleSave} className="mt-6">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Business Information</p>
          <div className="mt-4 flex flex-col gap-4">
            <Input label="Business Name" id="businessName" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} />
            <Select
              label="Business Type"
              id="businessType"
              value={form.businessType}
              onChange={(e) => update('businessType', e.target.value)}
              options={[
                { value: 'restaurant', label: 'Restaurant' },
                { value: 'mart', label: 'Mart / Grocery' },
                { value: 'store', label: 'Store / Shop' },
              ]}
            />
            <Textarea label="Description" id="description" value={form.description} onChange={(e) => update('description', e.target.value)} />
            <Input label="Address" id="address" value={form.address} onChange={(e) => update('address', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Phone" id="phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              <Input label="Email" id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bank Details</p>
          <p className="text-xs text-muted-foreground mt-1">Customers paying via bank transfer will see these details</p>
          <div className="mt-4 flex flex-col gap-4">
            <Input label="Bank Name" id="bankName" placeholder="e.g. Access Bank, GTBank" value={form.bankName} onChange={(e) => update('bankName', e.target.value)} />
            <Input label="Account Number" id="bankAccount" placeholder="0123456789" value={form.bankAccount} onChange={(e) => update('bankAccount', e.target.value)} />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">{error}</div>
        )}
        {saved && (
          <div className="mt-4 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">Settings saved</div>
        )}

        <Button type="submit" className="mt-5 w-full" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>

      {/* Operating hours & auto schedule */}
      {store && (
        <form onSubmit={handleScheduleSave} className="mt-4">
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Operating Hours</p>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface/50 p-4">
              <div>
                <p className="text-sm font-semibold">Auto Open &amp; Close</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Automatically toggle your store based on schedule
                </p>
              </div>
              <Toggle
                checked={schedule.autoSchedule}
                onChange={(val) => setSchedule((p) => ({ ...p, autoSchedule: val }))}
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="Opening Time"
                id="openTime"
                type="time"
                value={schedule.openTime}
                onChange={(e) => setSchedule((p) => ({ ...p, openTime: e.target.value }))}
              />
              <Input
                label="Closing Time"
                id="closeTime"
                type="time"
                value={schedule.closeTime}
                onChange={(e) => setSchedule((p) => ({ ...p, closeTime: e.target.value }))}
              />
            </div>

            {schedule.autoSchedule && (
              <p className="mt-3 text-xs text-muted-foreground">
                Your store will automatically open at {schedule.openTime} and close at {schedule.closeTime} daily.
              </p>
            )}

            {scheduleSaved && (
              <div className="mt-4 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">Schedule saved</div>
            )}

            <Button type="submit" variant="outline" className="mt-5 w-full" disabled={scheduleSaving}>
              {scheduleSaving ? 'Saving...' : 'Save Schedule'}
            </Button>
          </div>
        </form>
      )}

      {/* Store location */}
      {store && (
        <div className="mt-4 rounded-3xl border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Store Location</p>
          <p className="text-xs text-muted-foreground mt-1">Used to calculate delivery fees for customers</p>

          {location ? (
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-success/5 border border-success/20 p-3">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-sm font-bold text-success">Location set</p>
                <p className="text-xs text-muted-foreground font-mono">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 p-3">
              <span className="text-lg">⚠️</span>
              <p className="text-sm text-muted-foreground">No location set — customers can&apos;t see delivery fees</p>
            </div>
          )}

          {locSaved && (
            <div className="mt-3 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">Location saved</div>
          )}

          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={handleSetLocation}
            disabled={locating}
          >
            {locating ? 'Getting location...' : location ? 'Update My Location' : 'Use My Current Location'}
          </Button>
        </div>
      )}

      {/* Change password */}
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
