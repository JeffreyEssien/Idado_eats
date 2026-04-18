import { ID, Query } from 'appwrite'
import { databases } from './appwrite'
import { DATABASE_ID, COLLECTIONS } from './appwrite-config'
import type { Store, Product, Order, Delivery } from './mock-data'

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

export async function updateDeliveryStatus(id: string, status: string, riderId?: string) {
  const data: Record<string, string> = { status }
  if (riderId) data.riderId = riderId
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.DELIVERIES, id, data)
}
