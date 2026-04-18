import { ID } from 'appwrite'
import { account, databases } from './appwrite'
import { DATABASE_ID, COLLECTIONS } from './appwrite-config'

export type UserRole = 'customer' | 'business' | 'rider'

export async function signUp(email: string, password: string, name: string) {
  const user = await account.create(ID.unique(), email, password, name)
  await account.createEmailPasswordSession(email, password)
  return user
}

export async function signIn(email: string, password: string) {
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
