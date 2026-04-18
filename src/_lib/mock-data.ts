export type Store = {
  $id: string
  name: string
  type: 'restaurant' | 'store' | 'mart'
  description: string
  image: string
  rating: number
  deliveryTime: string
  isOpen: boolean
  ownerId: string
}

export type Product = {
  $id: string
  storeId: string
  name: string
  description: string
  price: number
  image: string
  category: string
  inStock: boolean
}

export type CartItem = {
  product: Product
  quantity: number
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'picked_up' | 'delivered' | 'cancelled'

export type Order = {
  $id: string
  userId: string
  storeId: string
  storeName: string
  items: string // JSON stringified
  total: number
  status: OrderStatus
  paymentMethod: 'cash' | 'transfer'
  $createdAt: string
  riderName?: string
  riderPhone?: string
}

export type Delivery = {
  $id: string
  orderId: string
  storeName: string
  storeAddress: string
  customerName: string
  customerAddress: string
  customerPhone: string
  items: number
  total: number
  fee: number
  status: 'available' | 'picked_up' | 'delivered'
  riderId?: string
  $createdAt: string
}

export function formatPrice(amount: number): string {
  return `\u20A6${amount.toLocaleString()}`
}

export function getStatusColor(status: OrderStatus | Delivery['status']): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'pending':
    case 'available':
      return 'warning'
    case 'confirmed':
    case 'preparing':
    case 'picked_up':
      return 'info'
    case 'delivered':
      return 'success'
    case 'cancelled':
      return 'danger'
    default:
      return 'default'
  }
}

export function parseOrderItems(items: string): { name: string; quantity: number; price: number }[] {
  try { return JSON.parse(items) } catch { return [] }
}
