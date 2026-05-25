'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '登入失敗')
        return
      }

      // Store token and redirect
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/pos')
    } catch (err) {
      setError('網路錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-wine-900 via-wine-700 to-wine-500">
      <div className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-wine-600 rounded-full mb-4">
            <span className="text-3xl text-white font-bold">60</span>
          </div>
          <h1 className="text-2xl font-bold text-wine-800">60嵐 POS 系統</h1>
          <p className="text-wine-600 text-sm mt-1">Point of Sale System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-wine-700 font-medium mb-2">帳號</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-wine-200 rounded-lg focus:outline-none focus:border-wine-600 transition-colors"
              placeholder="請輸入帳號"
              required
            />
          </div>

          <div>
            <label className="block text-wine-700 font-medium mb-2">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-wine-200 rounded-lg focus:outline-none focus:border-wine-600 transition-colors"
              placeholder="請輸入密碼"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-wine-600 text-white font-semibold rounded-lg hover:bg-wine-700 transition-colors disabled:opacity-50"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        {/* Demo hint */}
        <p className="text-center text-wine-500 text-xs mt-6">
          預設帳號：admin / 密碼：admin
        </p>
      </div>
    </div>
  )
}