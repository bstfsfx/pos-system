import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    
    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (payload.type !== 'member') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 })
    }

    const member = await prisma.member.findUnique({
      where: { id: payload.memberId },
    })

    if (!member) {
      return NextResponse.json({ error: '會員不存在' }, { status: 404 })
    }

    return NextResponse.json({ 
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        phone: member.phone,
        provider: member.provider,
        points: member.points,
        picture: member.picture,
      }
    })
  } catch (error) {
    console.error('Member info error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}