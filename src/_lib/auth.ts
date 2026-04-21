import { ID } from 'appwrite'
import { account, databases } from './appwrite'
import { DATABASE_ID, COLLECTIONS } from './appwrite-config'

export type UserRole = 'customer' | 'business' | 'rider'

/** Parse comma-separated roles string into an array */
export function parseRoles(role: string | undefined | null): UserRole[] {
  if (!role) return []
  return role.split(',').map((r) => r.trim()).filter(Boolean) as UserRole[]
}

/** Check if a roles string contains a specific role */
export function hasRole(rolesStr: string | undefined | null, role: UserRole): boolean {
  return parseRoles(rolesStr).includes(role)
}

/** Add a role to a comma-separated roles string (no duplicates) */
function addRoleToString(rolesStr: string | undefined | null, role: UserRole): string {
  const roles = parseRoles(rolesStr)
  if (!roles.includes(role)) roles.push(role)
  return roles.join(',')
}

/**
 * Register a new account OR sign in if the account already exists.
 * Returns { user, isExisting } so callers know whether to create or update a profile.
 */
export async function signUpOrSignIn(email: string, password: string, name: string) {
  // Clear any lingering session
  try { await account.deleteSession('current') } catch { /* none */ }

  try {
    const user = await account.create(ID.unique(), email, password, name)
    await account.createEmailPasswordSession(email, password)
    try { await account.createVerification(`${window.location.origin}/verify-email`) } catch { /* optional */ }
    return { user, isExisting: false }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    // If user already exists, try signing in with the provided password
    if (msg.includes('already exists') || msg.includes('unique()')) {
      await account.createEmailPasswordSession(email, password)
      const user = await account.get()
      return { user, isExisting: true }
    }
    throw err
  }
}

/**
 * Create a new profile or add a role to an existing profile.
 */
export async function ensureProfileWithRole(
  userId: string,
  role: UserRole,
  data: Record<string, unknown>,
) {
  const existing = await getProfile(userId)
  if (existing) {
    let newRoles = addRoleToString(existing.role as string, role)
    // Every user is also a customer by default
    if (!newRoles.includes('customer')) newRoles = addRoleToString(newRoles, 'customer')
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId, {
      role: newRoles,
      ...data,
    })
  }
  // New profile — always include customer role
  const roles = role === 'customer' ? 'customer' : `customer,${role}`
  return databases.createDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId, {
    role: roles,
    ...data,
  })
}

/** @deprecated Use signUpOrSignIn instead */
export async function signUp(email: string, password: string, name: string) {
  const user = await account.create(ID.unique(), email, password, name)
  await account.createEmailPasswordSession(email, password)
  await account.createVerification(`${window.location.origin}/verify-email`)
  return user
}

export async function signIn(email: string, password: string) {
  try {
    await account.deleteSession('current')
  } catch {
    // no active session — fine
  }
  return account.createEmailPasswordSession(email, password)
}

export async function signOut() {
  return account.deleteSession('current')
}

export async function getUser() {
  try {
    return await account.get()
  } catch {
    return null
  }
}

export async function createProfile(userId: string, role: UserRole, data: Record<string, unknown>) {
  return databases.createDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId, {
    role,
    ...data,
  })
}

export async function getProfile(userId: string) {
  try {
    return await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId)
  } catch {
    return null
  }
}

export async function updateProfile(userId: string, data: Record<string, unknown>) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId, data)
}

export async function updatePassword(oldPassword: string, newPassword: string) {
  return account.updatePassword(newPassword, oldPassword)
}

export async function sendWelcomeEmail(name: string, email: string, role: UserRole) {
  try {
    await fetch('/api/welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role }),
    })
  } catch {
    // non-blocking — don't fail registration if email fails
  }
}
