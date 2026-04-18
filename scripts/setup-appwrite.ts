/**
 * Run: npx tsx scripts/setup-appwrite.ts
 *
 * Requires APPWRITE_API_KEY in .env.local (create one in Appwrite Console → Settings → API Keys)
 * with scopes: databases.read, databases.write, collections.read, collections.write, attributes.read, attributes.write
 */

import { Client, Databases, Permission, Role, DatabasesIndexType } from 'node-appwrite'
import { config } from 'dotenv'
config({ path: '.env.local' })

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!)

const db = new Databases(client)
const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function run() {
  // ── Create database ──
  try {
    await db.create(DB, 'Idado Eats')
    console.log('✓ Database created')
  } catch (e: any) {
    if (e.code === 409) console.log('• Database already exists')
    else throw e
  }

  // ── Profiles ──
  try {
    await db.createCollection(DB, 'profiles', 'Profiles', [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ])
    console.log('✓ profiles collection created')
  } catch (e: any) {
    if (e.code === 409) console.log('• profiles already exists')
    else throw e
  }
  await sleep(1000)

  const profileAttrs: [string, string, number?, boolean?, any?][] = [
    ['string', 'role', 20, true],
    ['string', 'fullName', 100, true],
    ['string', 'email', 320, true],
    ['string', 'phone', 20, true],
    ['string', 'address', 255, false],
    ['string', 'businessName', 100, false],
    ['string', 'businessType', 20, false],
    ['string', 'description', 1000, false],
    ['string', 'vehicleType', 50, false],
  ]
  for (const [type, key, size, required] of profileAttrs) {
    try {
      if (type === 'string') await db.createStringAttribute(DB, 'profiles', key, size!, required ?? false)
      console.log(`  ✓ profiles.${key}`)
    } catch (e: any) {
      if (e.code === 409) console.log(`  • profiles.${key} exists`)
      else console.error(`  ✗ profiles.${key}:`, e.message)
    }
    await sleep(500)
  }

  // ── Stores ──
  try {
    await db.createCollection(DB, 'stores', 'Stores', [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ])
    console.log('✓ stores collection created')
  } catch (e: any) {
    if (e.code === 409) console.log('• stores already exists')
    else throw e
  }
  await sleep(1000)

  const storeAttrs: [string, string, any, boolean?][] = [
    ['string', 'name', 100, true],
    ['string', 'type', 20, true],
    ['string', 'description', 1000, true],
    ['string', 'image', 500, false],
    ['float', 'rating', null, false],
    ['string', 'deliveryTime', 30, false],
    ['boolean', 'isOpen', null, false],
    ['string', 'ownerId', 36, true],
  ]
  for (const [type, key, size, required] of storeAttrs) {
    try {
      if (type === 'string') await db.createStringAttribute(DB, 'stores', key, size, required ?? false)
      else if (type === 'float') await db.createFloatAttribute(DB, 'stores', key, required ?? false)
      else if (type === 'boolean') await db.createBooleanAttribute(DB, 'stores', key, required ?? false)
      console.log(`  ✓ stores.${key}`)
    } catch (e: any) {
      if (e.code === 409) console.log(`  • stores.${key} exists`)
      else console.error(`  ✗ stores.${key}:`, e.message)
    }
    await sleep(500)
  }

  // ── Products ──
  try {
    await db.createCollection(DB, 'products', 'Products', [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ])
    console.log('✓ products collection created')
  } catch (e: any) {
    if (e.code === 409) console.log('• products already exists')
    else throw e
  }
  await sleep(1000)

  const productAttrs: [string, string, any, boolean?][] = [
    ['string', 'storeId', 36, true],
    ['string', 'name', 100, true],
    ['string', 'description', 500, false],
    ['integer', 'price', null, true],
    ['string', 'image', 500, false],
    ['string', 'category', 50, true],
    ['boolean', 'inStock', null, false],
  ]
  for (const [type, key, size, required] of productAttrs) {
    try {
      if (type === 'string') await db.createStringAttribute(DB, 'products', key, size, required ?? false)
      else if (type === 'integer') await db.createIntegerAttribute(DB, 'products', key, required ?? false)
      else if (type === 'boolean') await db.createBooleanAttribute(DB, 'products', key, required ?? false)
      console.log(`  ✓ products.${key}`)
    } catch (e: any) {
      if (e.code === 409) console.log(`  • products.${key} exists`)
      else console.error(`  ✗ products.${key}:`, e.message)
    }
    await sleep(500)
  }

  // ── Orders ──
  try {
    await db.createCollection(DB, 'orders', 'Orders', [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ])
    console.log('✓ orders collection created')
  } catch (e: any) {
    if (e.code === 409) console.log('• orders already exists')
    else throw e
  }
  await sleep(1000)

  const orderAttrs: [string, string, any, boolean?][] = [
    ['string', 'userId', 36, true],
    ['string', 'storeId', 36, true],
    ['string', 'storeName', 100, true],
    ['string', 'items', 5000, true],       // JSON stringified
    ['integer', 'total', null, true],
    ['string', 'status', 20, true],
    ['string', 'paymentMethod', 20, true],
    ['string', 'riderName', 100, false],
    ['string', 'riderPhone', 20, false],
  ]
  for (const [type, key, size, required] of orderAttrs) {
    try {
      if (type === 'string') await db.createStringAttribute(DB, 'orders', key, size, required ?? false)
      else if (type === 'integer') await db.createIntegerAttribute(DB, 'orders', key, required ?? false)
      console.log(`  ✓ orders.${key}`)
    } catch (e: any) {
      if (e.code === 409) console.log(`  • orders.${key} exists`)
      else console.error(`  ✗ orders.${key}:`, e.message)
    }
    await sleep(500)
  }

  // ── Deliveries ──
  try {
    await db.createCollection(DB, 'deliveries', 'Deliveries', [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ])
    console.log('✓ deliveries collection created')
  } catch (e: any) {
    if (e.code === 409) console.log('• deliveries already exists')
    else throw e
  }
  await sleep(1000)

  const deliveryAttrs: [string, string, any, boolean?][] = [
    ['string', 'orderId', 36, true],
    ['string', 'storeName', 100, true],
    ['string', 'storeAddress', 255, true],
    ['string', 'customerName', 100, true],
    ['string', 'customerAddress', 255, true],
    ['string', 'customerPhone', 20, true],
    ['integer', 'items', null, true],
    ['integer', 'total', null, true],
    ['integer', 'fee', null, true],
    ['string', 'status', 20, true],
    ['string', 'riderId', 36, false],
  ]
  for (const [type, key, size, required] of deliveryAttrs) {
    try {
      if (type === 'string') await db.createStringAttribute(DB, 'deliveries', key, size, required ?? false)
      else if (type === 'integer') await db.createIntegerAttribute(DB, 'deliveries', key, required ?? false)
      console.log(`  ✓ deliveries.${key}`)
    } catch (e: any) {
      if (e.code === 409) console.log(`  • deliveries.${key} exists`)
      else console.error(`  ✗ deliveries.${key}:`, e.message)
    }
    await sleep(500)
  }

  // ── Indexes ──
  console.log('\nCreating indexes...')
  const indexes: [string, string, DatabasesIndexType, string[]][] = [
    ['profiles', 'idx_role', DatabasesIndexType.Key, ['role']],
    ['stores', 'idx_type', DatabasesIndexType.Key, ['type']],
    ['stores', 'idx_owner', DatabasesIndexType.Key, ['ownerId']],
    ['products', 'idx_store', DatabasesIndexType.Key, ['storeId']],
    ['products', 'idx_category', DatabasesIndexType.Key, ['category']],
    ['orders', 'idx_user', DatabasesIndexType.Key, ['userId']],
    ['orders', 'idx_status', DatabasesIndexType.Key, ['status']],
    ['deliveries', 'idx_status', DatabasesIndexType.Key, ['status']],
    ['deliveries', 'idx_rider', DatabasesIndexType.Key, ['riderId']],
  ]
  for (const [col, name, type, attrs] of indexes) {
    try {
      await db.createIndex(DB, col, name, type, attrs)
      console.log(`  ✓ ${col}.${name}`)
    } catch (e: any) {
      if (e.code === 409) console.log(`  • ${col}.${name} exists`)
      else console.error(`  ✗ ${col}.${name}:`, e.message)
    }
    await sleep(1000)
  }

  console.log('\n✅ Done! All collections and attributes are set up.')
}

run().catch(console.error)
