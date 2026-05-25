import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { active: true },
      include: {
        products: {
          where: { active: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    const toppings = await prisma.topping.findMany({
      where: { active: true },
    })

    return NextResponse.json({ categories, toppings })
  } catch (error) {
    console.error('Products error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}