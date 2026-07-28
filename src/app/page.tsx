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

        {/* Social Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-wine-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-wine-500">或使用以下帳號登入</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <button
              onClick={() => window.location.href = '/api/auth/google'}
              className="flex items-center justify-center py-3 bg-white border-2 border-wine-200 rounded-lg hover:bg-wine-50 transition"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.63l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            
            <button
              onClick={() => window.location.href = '/api/auth/line'}
              className="flex items-center justify-center py-3 bg-white border-2 border-wine-200 rounded-lg hover:bg-wine-50 transition"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#06C755" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.36l-5.76 2.88c-.32.16-.64-.16-.48-.48l2.08-6.08-1.76-1.28c-.32-.24-.32-.64.08-.8l6.4-1.12c.32-.08.56.16.48.48l-1.76 6c-.08.32-.4.48-.72.32l-6-2.08c-.32-.08-.48-.4-.32-.64l3.36-4.48z"/>
              </svg>
            </button>
            
            <button
              onClick={() => window.location.href = '/api/auth/facebook'}
              className="flex items-center justify-center py-3 bg-white border-2 border-wine-200 rounded-lg hover:bg-wine-50 transition"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.471h3.047V9.402c0-3.027 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.93-1.956 1.881v2.265h3.328l-.532 3.469h-2.796v8.384C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
          </div>

          <p className="text-center text-wine-500 text-sm mt-4">
            <button onClick={() => window.location.href = '/member'} className="underline hover:text-wine-700">
              查看會員資訊
            </button>
          </p>
        </div>

        {/* Demo hint */}
        <p className="text-center text-wine-500 text-xs mt-6">
          預設帳號：admin / 密碼：admin
        </p>
      </div>
    </div>
  )
}