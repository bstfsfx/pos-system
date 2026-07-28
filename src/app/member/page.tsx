'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MemberInfo {
  id: string
  email: string | null
  name: string | null
  phone: string | null
  provider: string
  points: number
  picture: string | null
}

function MemberLoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [member, setMember] = useState<MemberInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = searchParams.get('token')
    const provider = searchParams.get('provider')
    const error = searchParams.get('error')

    if (error) {
      alert('登入失敗，請重試')
      router.push('/')
      return
    }

    if (token && provider) {
      localStorage.setItem('memberToken', token)
      localStorage.setItem('memberProvider', provider)
      
      fetchMemberInfo(token)
    } else {
      const storedToken = localStorage.getItem('memberToken')
      if (storedToken) {
        fetchMemberInfo(storedToken)
      } else {
        router.push('/')
      }
    }
  }, [searchParams, router])

  const fetchMemberInfo = async (token: string) => {
    try {
      const res = await fetch('/api/auth/member/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.member) {
        setMember(data.member)
      }
    } catch (err) {
      console.error('Failed to fetch member', err)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('memberToken')
    localStorage.removeItem('memberProvider')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-wine-600">載入中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-wine-700 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-wine-700 font-bold text-xl">60</span>
          </div>
          <h1 className="text-xl font-bold">60嵐 會員專區</h1>
        </div>
        <button onClick={logout} className="px-4 py-2 bg-wine-800 rounded-lg hover:bg-wine-900 transition">
          登出
        </button>
      </header>

      <div className="max-w-md mx-auto mt-8 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-wine-100 mb-4">
            {member?.picture ? (
              <img src={member.picture} alt={member.name || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-wine-600">
                {member?.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-wine-800 mb-2">{member?.name}</h2>
          <p className="text-wine-600 mb-4">{member?.email}</p>
          
          <div className="inline-block px-4 py-1 bg-wine-100 text-wine-700 rounded-full text-sm mb-6">
            {member?.provider === 'google' && 'Google 帳號'}
            {member?.provider === 'line' && 'LINE 帳號'}
            {member?.provider === 'facebook' && 'Facebook 帳號'}
          </div>
        </div>

        <div className="bg-gradient-to-r from-wine-600 to-wine-700 rounded-2xl shadow-lg p-6 text-center text-white mt-6">
          <div className="text-sm opacity-80 mb-1">我的點數</div>
          <div className="text-5xl font-bold">{member?.points || 0}</div>
          <div className="text-sm opacity-80 mt-2">點</div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between">
            <span className="text-gray-600">手機</span>
            <span className="text-wine-800">{member?.phone || '未設定'}</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/pos')}
          className="w-full mt-6 py-3 bg-wine-600 text-white font-bold rounded-lg hover:bg-wine-700"
        >
          開始點餐
        </button>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-wine-600">載入中...</div>
    </div>
  )
}

export default function MemberLoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MemberLoginContent />
    </Suspense>
  )
}
