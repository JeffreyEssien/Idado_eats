/**
 * Run: npx tsx scripts/seed-appwrite.ts
 * Seeds the Appwrite database with initial store and product data.
 */

import { Client, Databases, ID } from 'node-appwrite'
import { config } from 'dotenv'
config({ path: '.env.local' })

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!)

const db = new Databases(client)
const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!

const stores = [
  { name: 'Mama Nkechi Kitchen', type: 'restaurant', description: 'Authentic Nigerian dishes made with love. Jollof rice, pounded yam, egusi soup and more.', image: '', rating: 4.8, deliveryTime: '25-35 min', isOpen: true, ownerId: 'seed' },
  { name: 'FreshMart Express', type: 'mart', description: 'Your one-stop shop for fresh groceries, household items, and daily essentials.', image: '', rating: 4.5, deliveryTime: '15-25 min', isOpen: true, ownerId: 'seed' },
  { name: 'Chops & Grill', type: 'restaurant', description: 'Grilled chicken, shawarma, burgers, and small chops for every occasion.', image: '', rating: 4.6, deliveryTime: '20-30 min', isOpen: true, ownerId: 'seed' },
  { name: 'Daily Needs Store', type: 'store', description: 'Provisions, drinks, snacks, toiletries and everything you need daily.', image: '', rating: 4.3, deliveryTime: '10-20 min', isOpen: false, ownerId: 'seed' },
  { name: 'The Smoothie Bar', type: 'restaurant', description: 'Fresh fruit smoothies, parfaits, and healthy drinks.', image: '', rating: 4.7, deliveryTime: '15-20 min', isOpen: true, ownerId: 'seed' },
  { name: 'PharmaCare', type: 'store', description: 'Over-the-counter medicine, vitamins, first aid, and personal care products.', image: '', rating: 4.9, deliveryTime: '15-25 min', isOpen: true, ownerId: 'seed' },
]

async function run() {
  console.log('Seeding stores...')
  const storeIds: string[] = []

  for (const store of stores) {
    const doc = await db.createDocument(DB, 'stores', ID.unique(), store)
    storeIds.push(doc.$id)
    console.log(`  ✓ ${store.name} (${doc.$id})`)
  }

  console.log('\nSeeding products...')

  const productSets: Record<number, { name: string; description: string; price: number; category: string; inStock: boolean }[]> = {
    0: [ // Mama Nkechi Kitchen
      { name: 'Jollof Rice & Chicken', description: 'Smoky party jollof with grilled chicken', price: 2500, category: 'Main Dishes', inStock: true },
      { name: 'Pounded Yam & Egusi', description: 'Smooth pounded yam with rich egusi soup', price: 3000, category: 'Main Dishes', inStock: true },
      { name: 'Fried Rice & Turkey', description: 'Nigerian fried rice with seasoned turkey', price: 2800, category: 'Main Dishes', inStock: true },
      { name: 'Pepper Soup', description: 'Spicy goat meat pepper soup', price: 2000, category: 'Soups', inStock: true },
      { name: 'Chapman', description: 'Classic Nigerian cocktail drink', price: 800, category: 'Drinks', inStock: true },
      { name: 'Moi Moi', description: 'Steamed bean pudding', price: 500, category: 'Sides', inStock: false },
    ],
    1: [ // FreshMart Express
      { name: 'Fresh Tomatoes (basket)', description: 'Locally sourced fresh tomatoes', price: 1500, category: 'Vegetables', inStock: true },
      { name: 'Rice (5kg)', description: 'Premium long grain rice', price: 7500, category: 'Grains', inStock: true },
      { name: 'Palm Oil (1L)', description: 'Pure red palm oil', price: 2000, category: 'Cooking', inStock: true },
      { name: 'Eggs (1 crate)', description: 'Fresh eggs, 30 pieces', price: 3500, category: 'Dairy & Eggs', inStock: true },
      { name: 'Onions (bag)', description: 'Fresh red onions', price: 1200, category: 'Vegetables', inStock: true },
      { name: 'Groundnut Oil (2L)', description: 'Premium cooking oil', price: 3800, category: 'Cooking', inStock: true },
    ],
    2: [ // Chops & Grill
      { name: 'Shawarma (Large)', description: 'Chicken shawarma with all the fixings', price: 2000, category: 'Wraps', inStock: true },
      { name: 'Grilled Chicken', description: 'Half chicken, flame-grilled with spices', price: 3500, category: 'Grills', inStock: true },
      { name: 'Beef Burger', description: 'Double patty with cheese and sauce', price: 2500, category: 'Burgers', inStock: true },
      { name: 'Small Chops (50pcs)', description: 'Samosa, spring rolls, puff puff mix', price: 5000, category: 'Party', inStock: true },
      { name: 'Suya (10 sticks)', description: 'Spicy beef suya skewers', price: 3000, category: 'Grills', inStock: true },
    ],
    3: [ // Daily Needs Store
      { name: 'Indomie (carton)', description: 'Instant noodles, 40 packs', price: 6000, category: 'Provisions', inStock: true },
      { name: 'Peak Milk (tin)', description: 'Evaporated milk 400g', price: 1200, category: 'Dairy', inStock: true },
      { name: 'Coca-Cola (pack of 12)', description: '35cl cans', price: 3600, category: 'Drinks', inStock: true },
      { name: 'Dettol Soap (6 pack)', description: 'Antibacterial bath soap', price: 2400, category: 'Toiletries', inStock: true },
    ],
    4: [ // The Smoothie Bar
      { name: 'Tropical Paradise', description: 'Mango, pineapple, passion fruit blend', price: 1500, category: 'Smoothies', inStock: true },
      { name: 'Green Goddess', description: 'Spinach, banana, apple, ginger', price: 1800, category: 'Smoothies', inStock: true },
      { name: 'Berry Blast', description: 'Mixed berries with yogurt', price: 2000, category: 'Smoothies', inStock: true },
      { name: 'Fruit Parfait', description: 'Layered yogurt, granola, and fresh fruits', price: 2500, category: 'Bowls', inStock: true },
      { name: 'Fresh Orange Juice', description: 'Freshly squeezed, no sugar added', price: 1000, category: 'Juices', inStock: true },
    ],
    5: [ // PharmaCare
      { name: 'Paracetamol (pack)', description: 'Pain relief tablets, 12 pack', price: 500, category: 'Medicine', inStock: true },
      { name: 'Vitamin C (60 tabs)', description: 'Immune support supplement', price: 2500, category: 'Vitamins', inStock: true },
      { name: 'First Aid Kit', description: 'Basic first aid essentials', price: 4500, category: 'First Aid', inStock: true },
      { name: 'Hand Sanitizer (500ml)', description: 'Antibacterial gel', price: 1500, category: 'Personal Care', inStock: true },
      { name: 'Face Masks (50 pack)', description: 'Disposable surgical masks', price: 3000, category: 'Personal Care', inStock: true },
    ],
  }

  for (let i = 0; i < storeIds.length; i++) {
    const prods = productSets[i] || []
    for (const p of prods) {
      await db.createDocument(DB, 'products', ID.unique(), {
        storeId: storeIds[i],
        image: '',
        ...p,
      })
      console.log(`  ✓ ${stores[i].name} → ${p.name}`)
    }
  }

  console.log('\nSeeding sample orders...')
  const sampleOrders = [
    {
      userId: 'seed',
      storeId: storeIds[0],
      storeName: 'Mama Nkechi Kitchen',
      items: JSON.stringify([
        { name: 'Jollof Rice & Chicken', quantity: 2, price: 2500 },
        { name: 'Chapman', quantity: 2, price: 800 },
      ]),
      total: 6600,
      status: 'delivered',
      paymentMethod: 'transfer',
      riderName: 'Emeka Johnson',
      riderPhone: '08012345678',
    },
    {
      userId: 'seed',
      storeId: storeIds[1],
      storeName: 'FreshMart Express',
      items: JSON.stringify([
        { name: 'Rice (5kg)', quantity: 1, price: 7500 },
        { name: 'Palm Oil (1L)', quantity: 2, price: 2000 },
      ]),
      total: 11500,
      status: 'preparing',
      paymentMethod: 'cash',
      riderName: '',
      riderPhone: '',
    },
    {
      userId: 'seed',
      storeId: storeIds[2],
      storeName: 'Chops & Grill',
      items: JSON.stringify([
        { name: 'Shawarma (Large)', quantity: 3, price: 2000 },
      ]),
      total: 6000,
      status: 'pending',
      paymentMethod: 'transfer',
      riderName: '',
      riderPhone: '',
    },
  ]

  for (const order of sampleOrders) {
    const doc = await db.createDocument(DB, 'orders', ID.unique(), order)
    console.log(`  ✓ Order ${doc.$id} — ${order.storeName}`)
  }

  console.log('\nSeeding sample deliveries...')
  const sampleDeliveries = [
    {
      orderId: 'seed-ord-1',
      storeName: 'Chops & Grill',
      storeAddress: 'Block A, Shop 5, Idado Estate',
      customerName: 'Funmi Adeyemi',
      customerAddress: '12 Palm Avenue, Idado Estate',
      customerPhone: '08098765432',
      items: 1,
      total: 6000,
      fee: 500,
      status: 'available',
      riderId: '',
    },
    {
      orderId: 'seed-ord-2',
      storeName: 'FreshMart Express',
      storeAddress: 'Block C, Shop 2, Idado Estate',
      customerName: 'Tunde Bakare',
      customerAddress: '7 Ocean View Close, Idado Estate',
      customerPhone: '08011223344',
      items: 2,
      total: 11500,
      fee: 700,
      status: 'picked_up',
      riderId: '',
    },
  ]

  for (const del of sampleDeliveries) {
    const doc = await db.createDocument(DB, 'deliveries', ID.unique(), del)
    console.log(`  ✓ Delivery ${doc.$id} — ${del.storeName}`)
  }

  console.log('\n✅ Seeding complete!')
}

run().catch(console.error)
