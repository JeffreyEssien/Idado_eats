'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/_lib/mock-data'
import type { Product } from '@/_lib/mock-data'
import { Button } from '@/_components/ui/button'
import { Badge } from '@/_components/ui/badge'
import { Card } from '@/_components/ui/card'
import { Input } from '@/_components/ui/input'
import { Textarea } from '@/_components/ui/textarea'
import { getUser, getProfile } from '@/_lib/auth'
import { listProducts, createProduct, updateProduct } from '@/_lib/db'

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [storeId, setStoreId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: '' })

  useEffect(() => {
    (async () => {
      const user = await getUser()
      if (!user) { setLoading(false); return }
      const profile = await getProfile(user.$id)
      const sid = profile?.storeId as string || ''
      setStoreId(sid)
      if (sid) {
        const p = await listProducts(sid)
        setProducts(p)
      }
      setLoading(false)
    })()
  }, [])

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!storeId) return
    setSaving(true)
    try {
      const doc = await createProduct({
        storeId,
        name: newItem.name,
        description: newItem.description,
        price: Number(newItem.price),
        category: newItem.category,
        image: '',
        inStock: true,
      })
      setProducts((prev) => [doc as unknown as Product, ...prev])
      setShowForm(false)
      setNewItem({ name: '', description: '', price: '', category: '' })
    } finally {
      setSaving(false)
    }
  }

  async function toggleStock(product: Product) {
    await updateProduct(product.$id, { inStock: !product.inStock })
    setProducts((prev) => prev.map((p) => p.$id === product.$id ? { ...p, inStock: !p.inStock } : p))
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catalogue</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your menu items and products</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <h2 className="font-semibold">New Item</h2>
          <form onSubmit={handleAddItem} className="mt-4 flex flex-col gap-4">
            <Input label="Item Name" id="itemName" placeholder="e.g. Jollof Rice & Chicken" value={newItem.name} onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))} required />
            <Textarea label="Description" id="itemDesc" placeholder="Brief description of the item" value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Price (₦)" id="itemPrice" type="number" placeholder="2500" value={newItem.price} onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))} required />
              <Input label="Category" id="itemCategory" placeholder="e.g. Main Dishes" value={newItem.category} onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))} required />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Item'}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {products.map((product) => (
          <Card key={product.$id}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-xl">🍽️</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{product.name}</h3>
                  <Badge variant={product.inStock ? 'success' : 'danger'}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{product.description}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{formatPrice(product.price)}</span>
                  <span>&middot;</span>
                  <span>{product.category}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => toggleStock(product)}>
                  {product.inStock ? 'Mark OOS' : 'Restock'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="mt-12 text-center">
          <p className="text-4xl">🍽️</p>
          <p className="mt-3 font-bold">No items yet</p>
          <p className="text-sm text-muted-foreground">Add your first product</p>
        </div>
      )}
    </div>
  )
}
