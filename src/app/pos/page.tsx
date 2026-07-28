'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  categoryId: string
  category: { id: string; name: string; color: string }
  size?: string
}

interface Topping {
  id: string
  name: string
  price: number
}

interface CartItem {
  product: Product
  topping?: Topping
  quantity: number
}

export default function POSPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [toppings, setToppings] = useState<Topping[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedTopping, setSelectedTopping] = useState<Topping | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastOrder, setLastOrder] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/')
      return
    }
    setUser(JSON.parse(userData))
    fetchProducts()
  }, [router])

  const fetchProducts = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.categories) {
        setCategories(data.categories)
        setToppings(data.toppings)
        if (data.categories.length > 0) {
          setSelectedCategory(data.categories[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to load products', err)
    }
  }

  const addToCart = () => {
    if (!selectedProduct) return
    
    const existingIndex = cart.findIndex(
      item => item.product.id === selectedProduct.id && item.topping?.id === selectedTopping?.id
    )

    if (existingIndex >= 0) {
      const newCart = [...cart]
      newCart[existingIndex].quantity += quantity
      setCart(newCart)
    } else {
      setCart([...cart, { product: selectedProduct, topping: selectedTopping || undefined, quantity }])
    }

    setSelectedProduct(null)
    setSelectedTopping(null)
    setQuantity(1)
  }

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart]
    const newQty = newCart[index].quantity + delta
    if (newQty <= 0) {
      newCart.splice(index, 1)
    } else {
      newCart[index].quantity = newQty
    }
    setCart(newCart)
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => {
      const toppingPrice = item.topping?.price || 0
      return sum + (Number(item.product.price) + toppingPrice) * item.quantity
    }, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const items = cart.map(item => ({
        productId: item.product.id,
        toppingId: item.topping?.id,
        quantity: item.quantity,
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          paymentMethod,
          customerName,
          customerPhone,
        }),
      })

      const data = await res.json()
      if (data.order) {
        setLastOrder(data.order)
        setShowSuccess(true)
        setCart([])
        setShowCheckout(false)
        setCustomerName('')
        setCustomerPhone('')
      }
    } catch (err) {
      console.error('Checkout failed', err)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const currentProducts = categories.find(c => c.id === selectedCategory)?.products || []
  const currentProductsWithCategory = currentProducts.map((p: any) => ({
    ...p,
    category: categories.find(c => c.id === selectedCategory),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-wine-700 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-wine-700 font-bold text-xl">60</span>
          </div>
          <h1 className="text-xl font-bold">60嵐 POS 系統</h1>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <button 
              onClick={() => router.push('/admin')} 
              className="px-4 py-2 bg-wine-800 rounded-lg hover:bg-wine-900 transition"
            >
              後台管理
            </button>
          )}
          <span className="text-sm opacity-80">歡迎, {user?.name || user?.username}</span>
          <button onClick={logout} className="px-4 py-2 bg-wine-800 rounded-lg hover:bg-wine-900 transition">
            登出
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Products */}
        <div className="flex-1 flex flex-col p-4">
          {/* Categories */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-wine-600 text-white shadow-lg'
                    : 'bg-white text-wine-700 hover:bg-wine-50'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto flex-1">
            {currentProductsWithCategory.map((product: any) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product)
                  setSelectedTopping(null)
                  setQuantity(1)
                }}
                className={`p-3 rounded-xl bg-white shadow-sm hover:shadow-lg transition-all text-left ${
                  selectedProduct?.id === product.id ? 'ring-2 ring-wine-500' : ''
                }`}
              >
                {product.image && (
                  <div className="w-full h-20 mb-2 rounded-lg overflow-hidden bg-gray-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="text-lg font-bold text-wine-800">{product.name}</div>
                <div className="text-wine-600 mt-1">\$ {Number(product.price).toFixed(0)}</div>
                {product.size && (
                  <div className="text-xs text-gray-500 mt-1">{product.size}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Cart & Options */}
        <div className="w-96 bg-white shadow-xl flex flex-col">
          {showSuccess ? (
            /* Success Message */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-wine-800 mb-2">訂單已建立</h2>
              <p className="text-wine-600 mb-4">訂單編號: {lastOrder?.orderNumber}</p>
              <p className="text-3xl font-bold text-wine-700">\$ {Number(lastOrder?.totalAmount).toFixed(0)}</p>
              <button
                onClick={() => setShowSuccess(false)}
                className="mt-8 px-6 py-3 bg-wine-600 text-white rounded-lg hover:bg-wine-700 transition"
              >
                繼續點餐
              </button>
            </div>
          ) : showCheckout ? (
            /* Checkout Panel */
            <div className="flex-1 flex flex-col p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-wine-800">結帳</h2>
                <button onClick={() => setShowCheckout(false)} className="text-wine-600 hover:text-wine-800">
                  ← 返回
                </button>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-wine-800">{item.product.name}</div>
                        {item.topping && (
                          <div className="text-sm text-wine-600">+ {item.topping.name}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-wine-700">
                          \$ {((Number(item.product.price) + (item.topping?.price || 0)) * item.quantity).toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">x{item.quantity}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold text-wine-800 mb-4">
                  <span>總計</span>
                  <span>\$ {getTotal().toFixed(0)}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-wine-700 mb-1">付款方式</label>
                    <div className="flex gap-2">
                      {['cash', 'card'].map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`flex-1 py-2 rounded-lg border ${
                            paymentMethod === method
                              ? 'bg-wine-600 text-white border-wine-600'
                              : 'border-wine-300 text-wine-700'
                          }`}
                        >
                          {method === 'cash' ? '現金' : '刷卡'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="顧客姓名 (選填)"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="tel"
                    placeholder="電話 (選填)"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-3 bg-wine-600 text-white font-bold rounded-lg hover:bg-wine-700 disabled:opacity-50"
                  >
                    {loading ? '處理中...' : '確認結帳'}
                  </button>
                </div>
              </div>
            </div>
          ) : selectedProduct ? (
            /* Product Options Panel */
            <div className="flex-1 flex flex-col p-4">
              <h2 className="text-xl font-bold text-wine-800 mb-4">{selectedProduct.name}</h2>
              <p className="text-2xl text-wine-600 mb-6">\$ {Number(selectedProduct.price).toFixed(0)}</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-wine-700 mb-2">加料 (選一)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedTopping(null)}
                    className={`py-2 rounded-lg border ${
                      !selectedTopping
                        ? 'bg-wine-600 text-white border-wine-600'
                        : 'border-wine-300'
                    }`}
                  >
                    無
                  </button>
                  {toppings.map(topping => (
                    <button
                      key={topping.id}
                      onClick={() => setSelectedTopping(topping)}
                      className={`py-2 rounded-lg border text-left px-3 ${
                        selectedTopping?.id === topping.id
                          ? 'bg-wine-600 text-white border-wine-600'
                          : 'border-wine-300'
                      }`}
                    >
                      {topping.name} {topping.price > 0 && `+$${topping.price}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-wine-700 mb-2">數量</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-wine-100 text-wine-700 rounded-lg text-xl font-bold"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-wine-800 w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-wine-100 text-wine-700 rounded-lg text-xl font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={addToCart}
                className="w-full py-3 bg-wine-600 text-white font-bold rounded-lg hover:bg-wine-700"
              >
                加入購物車 ({((Number(selectedProduct.price) + (selectedTopping?.price || 0)) * quantity).toFixed(0)})
              </button>
            </div>
          ) : (
            /* Cart Panel */
            <div className="flex-1 flex flex-col p-4">
              <h2 className="text-xl font-bold text-wine-800 mb-4">購物車 ({cart.length})</h2>
              
              <div className="flex-1 overflow-y-auto space-y-2">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    購物車是空的<br/>請選擇商品
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-wine-800">{item.product.name}</div>
                        {item.topping && (
                          <div className="text-xs text-wine-600">+ {item.topping.name}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(idx, -1)}
                          className="w-7 h-7 bg-wine-100 text-wine-700 rounded"
                        >
                          -
                        </button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, 1)}
                          className="w-7 h-7 bg-wine-100 text-wine-700 rounded"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="ml-2 text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-xl font-bold text-wine-800 mb-4">
                    <span>總計</span>
                    <span>\$ {getTotal().toFixed(0)}</span>
                  </div>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-3 bg-wine-600 text-white font-bold rounded-lg hover:bg-wine-700"
                  >
                    前往結帳
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}