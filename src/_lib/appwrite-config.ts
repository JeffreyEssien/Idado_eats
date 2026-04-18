export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!

export const COLLECTIONS = {
  STORES: 'stores',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  DELIVERIES: 'deliveries',
  PROFILES: 'profiles',
} as const
