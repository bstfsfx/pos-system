import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export interface Session {
  userId: string
  username: string
  role: string
}

export async function getServerSession(request: NextRequest): Promise<Session | null> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
    new URL(request.url).searchParams.get('token')

  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret') as Session
  } catch {
    return null
  }
}

export function withAuth(handler: (session: Session) => Promise<Response>) {
  return async function (request: NextRequest) {
    const session = await getServerSession(request)
    if (!session) {
      return new Response(JSON.stringify({ error: '未授權' }), { status: 401 })
    }
    return handler(session)
  }
}