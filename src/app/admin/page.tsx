'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type TabType = 'orders' | 'products' | 'stats'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  paymentMethod: string
  customerName: string | null
  createdAt: string
  user: { username: string; name: string | null }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    product: { name: string }
    topping: { name: string } | null
  }>
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'manager') {
      router.push('/pos')
      return
    }
    
    fetchOrders()
    fetchProducts()
  }, [router])

  const fetchOrders = async () => {
    const token = localStorage.getItem('token')
    try {
      const url = filterStatus ? `/api/orders?status=${filterStatus}` : '/api/orders'
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.orders) {
        setOrders(data.orders)
      }
    } catch (err) {
      console.error('Failed to fetch orders', err)
    }
  }

  const fetchProducts = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.categories) {
        setCategories(data.categories)
        const allProducts = data.categories.flatMap((c: any) => c.products)
        setProducts(allProducts)
      }
    } catch (err) {
      console.error('Failed to fetch products', err)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      })
      if (res.ok) {
        fetchOrders()
      }
    } catch (err) {
      console.error('Failed to update order', err)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待製作'
      case 'preparing': return '製作中'
      case 'completed': return '已完成'
      case 'cancelled': return '已取消'
      default: return status
    }
  }

  const todayStats = orders.filter(o => {
    const orderDate = new Date(o.createdAt).toDateString()
    const today = new Date().toDateString()
    return orderDate === today
  })

  const todayRevenue = todayStats.reduce((sum, o) => sum + Number(o.totalAmount), 0)
  const todayOrders = todayStats.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-wine-700 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-wine-700 font-bold text-xl">60</span>
          </div>
          <h1 className="text-xl font-bold">60嵐 後台管理</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/pos')} 
            className="px-4 py-2 bg-wine-800 rounded-lg hover:bg-wine-900 transition"
          >
            返回門市
          </button>
          <span className="text-sm opacity-80">{user?.name || user?.username}</span>
          <button onClick={logout} className="px-4 py-2 bg-wine-800 rounded-lg hover:bg-wine-900 transition">
            登出
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white shadow-md min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {[
              { id: 'orders', label: '訂單管理', icon: '📋' },
              { id: 'products', label: '商品管理', icon: '🥤' },
              { id: 'stats', label: '營業統計', icon: '📊' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  activeTab === tab.id
                    ? 'bg-wine-600 text-white'
                    : 'text-wine-700 hover:bg-wine-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Quick Stats */}
          <div className="p-4 mt-8 border-t">
            <h3 className="text-sm font-medium text-wine-700 mb-3">今日概覽</h3>
            <div className="space-y-2">
              <div className="p-3 bg-wine-50 rounded-lg">
                <div className="text-2xl font-bold text-wine-700">{todayOrders}</div>
                <div className="text-xs text-wine-600">訂單數</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">\$ {todayRevenue.toFixed(0)}</div>
                <div className="text-xs text-green-600">營業額</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-wine-800">訂單管理</h2>
                <div className="flex gap-2">
                  {['', 'pending', 'preparing', 'completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => { setFilterStatus(status); setTimeout(fetchOrders, 0) }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filterStatus === status
                          ? 'bg-wine-600 text-white'
                          : 'bg-white text-wine-700 border border-wine-300'
                      }`}
                    >
                      {status === '' ? '全部' : getStatusText(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    尚無訂單記錄
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-bold text-wine-800">{order.orderNumber}</span>
                          <span className="ml-3 text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <span className="text-lg font-bold text-wine-700">
                            \$ {Number(order.totalAmount).toFixed(0)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.product.name}
                              {item.topping && <span className="text-wine-600"> + {item.topping.name}</span>}
                              <span className="text-gray-400"> x{item.quantity}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm text-gray-500">
                          付款: {order.paymentMethod === 'cash' ? '現金' : '刷卡'} | 
                          門市: {order.user.name || order.user.username}
                        </span>
                        
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <div className="flex gap-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                              >
                                開始製作
                              </button>
                            )}
                            {order.status === 'preparing' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                              >
                                完成
                              </button>
                            )}
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                            >
                              取消
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-wine-800">商品管理</h2>
              </div>
              
              {categories.map(category => (
                <div key={category.id} className="mb-6">
                  <h3 className="text-lg font-semibold text-wine-700 mb-3 flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {category.products.map((product: any) => (
                      <div key={product.id} className="bg-white rounded-lg shadow-sm p-3">
                        <div className="font-medium text-wine-800">{product.name}</div>
                        <div className="flex justify-between mt-2">
                          <span className="text-wine-600">\$ {Number(product.price).toFixed(0)}</span>
                          <span className="text-xs text-gray-400">{product.size}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold text-wine-800 mb-6">營業統計</h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="text-gray-500 mb-2">今日訂單</div>
                  <div className="text-4xl font-bold text-wine-700">{todayOrders}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="text-gray-500 mb-2">今日營業額</div>
                  <div className="text-4xl font-bold text-green-600">\$ {todayRevenue.toFixed(0)}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="text-gray-500 mb-2">平均訂單金額</div>
                  <div className="text-4xl font-bold text-wine-700">
                    \$ {todayOrders > 0 ? Math.round(todayRevenue / todayOrders) : 0}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}