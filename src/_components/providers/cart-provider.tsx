'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import type { Product } from '@/_lib/mock-data'

export type CartEntry = {
  product: Product
  quantity: number
  storeId: string
  storeName: string
}

type CartContextType = {
  items: CartEntry[]
  addItem: (product: Product, storeId: string, storeName: string) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  getQuantity: (productId: string) => number
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  getQuantity: () => 0,
  totalItems: 0,
  totalPrice: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartEntry[]>([])

  const addItem = useCallback((product: Product, storeId: string, storeName: string) => {
    setItems((prev) => {
      // If adding from a different store, clear cart first
      if (prev.length > 0 && prev[0].storeId !== storeId) {
        return [{ product, quantity: 1, storeId, storeName }]
      }
      const existing = prev.find((e) => e.product.$id === product.$id)
      if (existing) {
        return prev.map((e) =>
          e.product.$id === product.$id ? { ...e, quantity: e.quantity + 1 } : e
        )
      }
      return [...prev, { product, quantity: 1, storeId, storeName }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const existing = prev.find((e) => e.product.$id === productId)
      if (!existing) return prev
      if (existing.quantity > 1) {
        return prev.map((e) =>
          e.product.$id === productId ? { ...e, quantity: e.quantity - 1 } : e
        )
      }
      return prev.filter((e) => e.product.$id !== productId)
    })
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const getQuantity = useCallback(
    (productId: string) => items.find((e) => e.product.$id === productId)?.quantity || 0,
    [items]
  )

  const totalItems = items.reduce((sum, e) => sum + e.quantity, 0)
  const totalPrice = items.reduce((sum, e) => sum + e.product.price * e.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, getQuantity, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
