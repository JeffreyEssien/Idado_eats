'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/_components/ui/input'
import { Button } from '@/_components/ui/button'
import { signOut, getUser, getProfile, updateProfile, updatePassword } from '@/_lib/auth'
import { listOrders } from '@/_lib/db'
import { formatPrice } from '@/_lib/mock-data'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState('')
  const [memberSince, setMemberSince] = useState('')
  const [orderCount, setOrderCount] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  })

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  useEffect(() => {
    (async () => {
      const user = await getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.$id)
      setMemberSince(new Date(user.$createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))

      const [profile, orders] = await Promise.all([
        getProfile(user.$id),
        listOrders(user.$id),
      ])

      if (profile) {
        setForm({
          fullName: (profile.fullName as string) || user.name || '',
          email: (profile.email as string) || user.email || '',
          phone: (profile.phone as string) || '',
          address: (profile.address as string) || '',
        })
      }

      setOrderCount(orders.length)
      setTotalSpent(orders.reduce((sum, o) => sum + o.total, 0))
      setLoading(false)
    })()
  }, [router])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(userId, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    if (passwords.new !== passwords.confirm) {
      setPasswordError('Passwords do not match')
      return
    }
    if (passwords.new.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    setPasswordSaving(true)
    try {
      await updatePassword(passwords.old, passwords.new)
      setPasswordSaved(true)
      setPasswords({ old: '', new: '', confirm: '' })
      setTimeout(() => { setShowPasswordForm(false); setPasswordSaved(false) }, 2000)
    } catch {
      setPasswordError('Current password is incorrect')
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      {/* Avatar header */}
      <div className="flex items-center gap-5">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-3xl font-extrabold text-white shrink-0">
          {form.fullName?.[0] || '?'}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{form.fullName || 'Your Profile'}</h1>
          <p className="text-sm text-muted-foreground">{form.email}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { label: 'Orders', value: String(orderCount) },
          { label: 'Spent', value: formatPrice(totalSpent) },
          { label: 'Since', value: memberSince },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface border border-border p-4 text-center">
            <p className="text-xl font-extrabold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="mt-8 rounded-3xl border border-border bg-card p-6 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Personal info</p>
        <Input label="Full Name" id="fullName" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
        <Input label="Email" id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <Input label="Phone" id="phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <Input label="Address" id="address" value={form.address} onChange={(e) => update('address', e.target.value)} />
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
        </Button>
      </form>

      {/* Change password */}
      {showPasswordForm && (
        <form onSubmit={handlePasswordChange} className="mt-4 rounded-3xl border border-border bg-card p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Change password</p>
          {passwordError && (
            <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">{passwordError}</div>
          )}
          {passwordSaved && (
            <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">Password updated</div>
          )}
          <Input label="Current Password" id="oldPassword" type="password" value={passwords.old} onChange={(e) => setPasswords((p) => ({ ...p, old: e.target.value }))} required />
          <Input label="New Password" id="newPassword" type="password" placeholder="Min 8 characters" value={passwords.new} onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))} required />
          <Input label="Confirm New Password" id="confirmNewPassword" type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} required />
          <div className="flex gap-2">
            <Button type="submit" disabled={passwordSaving}>{passwordSaving ? 'Updating...' : 'Update Password'}</Button>
            <Button type="button" variant="ghost" onClick={() => { setShowPasswordForm(false); setPasswordError('') }}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="rounded-2xl border border-border bg-card p-4 text-left hover:bg-surface transition-colors cursor-pointer">
          <p className="text-sm font-bold">{showPasswordForm ? 'Hide' : 'Change password'}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Update your credentials</p>
        </button>
        <button onClick={handleSignOut} className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-left hover:bg-danger/10 transition-colors cursor-pointer">
          <p className="text-sm font-bold text-danger">Sign out</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">See you next time</p>
        </button>
      </div>
    </div>
  )
}
