import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const orders = await prisma.order.findMany({
      where: status ? { status } : undefined,
      include: {
        items: {
          include: {
            product: true,
            topping: true,
          },
        },
        user: {
          select: { username: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const body = await request.json()
    const { items, paymentMethod, customerName, customerPhone, notes } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 })
    }

    // Generate order number
    const today = new Date()
    const orderNumber = `ORD${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}${Math.random().toString().slice(2, 8)}`

    // Calculate total
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })
      if (!product) continue

      let toppingPrice = 0
      if (item.toppingId) {
        const topping = await prisma.topping.findUnique({
          where: { id: item.toppingId },
        })
        if (topping) {
          toppingPrice = Number(topping.price)
        }
      }

      const unitPrice = Number(product.price) + toppingPrice
      totalAmount += unitPrice * item.quantity

      orderItems.push({
        productId: item.productId,
        toppingId: item.toppingId || null,
        quantity: item.quantity,
        unitPrice,
      })
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount,
        paymentMethod,
        customerName,
        customerPhone,
        notes,
        userId: session.userId,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
            topping: true,
          },
        },
      },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}