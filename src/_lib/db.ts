import { ID, Query } from 'appwrite'
import { databases } from './appwrite'
import { DATABASE_ID, COLLECTIONS } from './appwrite-config'
import type { Store, Product, Order, Delivery, Dispute } from './mock-data'

// ── Stores ──

export async function listStores(type?: string) {
  const queries = [Query.orderDesc('$createdAt'), Query.limit(50)]
  if (type && type !== 'all') queries.push(Query.equal('type', type))
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.STORES, queries)
  return res.documents as unknown as Store[]
}

export async function getStore(id: string) {
  const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.STORES, id)
  return doc as unknown as Store
}

export async function createStore(data: Omit<Store, '$id'>) {
  return databases.createDocument(DATABASE_ID, COLLECTIONS.STORES, ID.unique(), data)
}

export async function updateStore(id: string, data: Partial<Store>) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.STORES, id, data)
}

export async function listStoresByOwner(ownerId: string) {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.STORES, [
    Query.equal('ownerId', ownerId),
  ])
  return res.documents as unknown as Store[]
}

// ── Products ──

export async function listProducts(storeId: string, category?: string) {
  const queries = [Query.equal('storeId', storeId), Query.limit(100)]
  if (category) queries.push(Query.equal('category', category))
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTS, queries)
  return res.documents as unknown as Product[]
}

export async function getProduct(id: string) {
  const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, id)
  return doc as unknown as Product
}

export async function createProduct(data: Omit<Product, '$id'>) {
  return databases.createDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, ID.unique(), data)
}

export async function updateProduct(id: string, data: Partial<Product>) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, id, data)
}

// ── Orders ──

export async function createOrder(data: Omit<Order, '$id' | '$createdAt'>) {
  return databases.createDocument(DATABASE_ID, COLLECTIONS.ORDERS, ID.unique(), data)
}

export async function listOrders(userId: string) {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDERS, [
    Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
  ])
  return res.documents as unknown as Order[]
}

export async function listOrdersByStore(storeId: string) {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDERS, [
    Query.equal('storeId', storeId),
    Query.orderDesc('$createdAt'),
  ])
  return res.documents as unknown as Order[]
}

export async function getOrder(id: string) {
  const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.ORDERS, id)
  return doc as unknown as Order
}

export async function updateOrderStatus(id: string, status: string) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.ORDERS, id, { status })
}

// ── Deliveries ──

export async function listDeliveries(status?: string) {
  const queries = [Query.orderDesc('$createdAt'), Query.limit(50)]
  if (status && status !== 'all') queries.push(Query.equal('status', status))
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DELIVERIES, queries)
  return res.documents as unknown as Delivery[]
}

export async function getDelivery(id: string) {
  const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.DELIVERIES, id)
  return doc as unknown as Delivery
}

export async function createDelivery(data: Omit<Delivery, '$id' | '$createdAt'>) {
  return databases.createDocument(DATABASE_ID, COLLECTIONS.DELIVERIES, ID.unique(), data)
}

export async function updateDeliveryStatus(id: string, status: string, riderId?: string) {
  const data: Record<string, string> = { status }
  if (riderId) data.riderId = riderId
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.DELIVERIES, id, data)
}

// ── Store Status ──

export async function toggleStoreOpen(storeId: string, isOpen: boolean) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.STORES, storeId, { isOpen })
}

export async function updateStoreSchedule(storeId: string, openTime: string, closeTime: string, autoSchedule: boolean) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.STORES, storeId, { openTime, closeTime, autoSchedule })
}

// ── Disputes ──

export async function createDispute(data: Omit<Dispute, '$id' | '$createdAt' | '$updatedAt'>) {
  return databases.createDocument(DATABASE_ID, COLLECTIONS.DISPUTES, ID.unique(), data)
}

export async function listDisputesByUser(userId: string) {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DISPUTES, [
    Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
  ])
  return res.documents as unknown as Dispute[]
}

export async function listAllDisputes() {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DISPUTES, [
    Query.orderDesc('$createdAt'),
    Query.limit(100),
  ])
  return res.documents as unknown as Dispute[]
}

export async function updateDisputeStatus(id: string, status: string) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.DISPUTES, id, { status })
}

// ── Profiles (Admin) ──

export async function listAllProfiles(role?: string) {
  const queries = [Query.orderDesc('$createdAt'), Query.limit(200)]
  if (role) queries.push(Query.contains('role', role))
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, queries)
  return res.documents
}

export async function listAllOrders() {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDERS, [
    Query.orderDesc('$createdAt'),
    Query.limit(500),
  ])
  return res.documents as unknown as (Order & { $createdAt: string })[]
}
