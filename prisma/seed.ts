import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const drinkImages: Record<string, string> = {
  '原味奶茶': '/images/drinks/milk-tea.svg',
  '珍奶': '/images/drinks/bubble-tea.svg',
  '烏龍奶茶': '/images/drinks/oolong-tea.svg',
  '伯爵奶茶': '/images/drinks/earl-grey.svg',
  '紅豆奶茶': '/images/drinks/red-bean.svg',
  '燕麥奶茶': '/images/drinks/oat-milk.svg',
  '檸檬綠茶': '/images/drinks/lemon-green.svg',
  '百香雙Q': '/images/drinks/passion-fruit.svg',
  '芒果綠茶': '/images/drinks/mango-green.svg',
  '荔枝凍飲': '/images/drinks/lychee.svg',
  '柳橙綠茶': '/images/drinks/orange-green.svg',
  '葡萄柚綠茶': '/images/drinks/grapefruit.svg',
  '芝芝奶茶': '/images/drinks/cheese-milk.svg',
  '芝芝綠茶': '/images/drinks/cheese-green.svg',
  '芝芝紅豆': '/images/drinks/cheese-redbean.svg',
  '芝芝芒果': '/images/drinks/cheese-mango.svg',
  '紅豆鮮奶': '/images/drinks/red-bean-milk.svg',
  '芋頭鮮奶': '/images/drinks/taro-milk.svg',
  '花生鮮奶': '/images/drinks/peanut-milk.svg',
  '燕麥鮮奶': '/images/drinks/oat-milk.svg',
  '巧克力鮮奶': '/images/drinks/chocolate-milk.svg',
  '檸檬氣泡': '/images/drinks/lemon-sparkling.svg',
  '百香氣泡': '/images/drinks/passion-sparkling.svg',
  '芒果氣泡': '/images/drinks/mango-sparkling.svg',
  '葡萄氣泡': '/images/drinks/grape-sparkling.svg',
}

async function main() {
  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash('admin', 10)
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin',
      active: true,
    },
  })
  console.log('Created admin user:', admin.username)

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'classic-milk-tea' },
      update: {},
      create: {
        id: 'classic-milk-tea',
        name: '經典奶茶',
        description: 'Classic milk tea series',
        color: '#722F37',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { id: 'fruit-tea' },
      update: {},
      create: {
        id: 'fruit-tea',
        name: '水果茶',
        description: 'Fresh fruit tea series',
        color: '#B8860B',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { id: 'milk-cap' },
      update: {},
      create: {
        id: 'milk-cap',
        name: '奶蓋茶',
        description: 'Milk cap tea series',
        color: '#CD853F',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { id: 'fresh-milk' },
      update: {},
      create: {
        id: 'fresh-milk',
        name: '鮮奶系列',
        description: 'Fresh milk series',
        color: '#F5F5DC',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { id: 'sparkling' },
      update: {},
      create: {
        id: 'sparkling',
        name: '氣泡系列',
        description: 'Sparkling drinks series',
        color: '#87CEEB',
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { id: 'toppings' },
      update: {},
      create: {
        id: 'toppings',
        name: '加料',
        description: 'Additional toppings',
        color: '#2F4F4F',
        sortOrder: 6,
      },
    }),
  ])
  console.log('Created categories')

  await Promise.all([
    prisma.topping.upsert({
      where: { id: 'pearl' },
      update: {},
      create: { id: 'pearl', name: '珍珠', price: 0 },
    }),
    prisma.topping.upsert({
      where: { id: 'coconut' },
      update: {},
      create: { id: 'coconut', name: '椰果', price: 0 },
    }),
    prisma.topping.upsert({
      where: { id: 'pudding' },
      update: {},
      create: { id: 'pudding', name: '布丁', price: 10 },
    }),
    prisma.topping.upsert({
      where: { id: 'grass-jelly' },
      update: {},
      create: { id: 'grass-jelly', name: '仙草', price: 0 },
    }),
  ])
  console.log('Created toppings')

  const products = [
    { name: '原味奶茶', categoryId: 'classic-milk-tea', price: 30, size: 'M' },
    { name: '珍奶', categoryId: 'classic-milk-tea', price: 40, size: 'M' },
    { name: '烏龍奶茶', categoryId: 'classic-milk-tea', price: 35, size: 'M' },
    { name: '伯爵奶茶', categoryId: 'classic-milk-tea', price: 40, size: 'M' },
    { name: '紅豆奶茶', categoryId: 'classic-milk-tea', price: 40, size: 'M' },
    { name: '燕麥奶茶', categoryId: 'classic-milk-tea', price: 45, size: 'M' },
    { name: '檸檬綠茶', categoryId: 'fruit-tea', price: 35, size: 'M' },
    { name: '百香雙Q', categoryId: 'fruit-tea', price: 45, size: 'M' },
    { name: '芒果綠茶', categoryId: 'fruit-tea', price: 50, size: 'M' },
    { name: '荔枝凍飲', categoryId: 'fruit-tea', price: 45, size: 'M' },
    { name: '柳橙綠茶', categoryId: 'fruit-tea', price: 40, size: 'M' },
    { name: '葡萄柚綠茶', categoryId: 'fruit-tea', price: 45, size: 'M' },
    { name: '芝芝奶茶', categoryId: 'milk-cap', price: 55, size: 'M' },
    { name: '芝芝綠茶', categoryId: 'milk-cap', price: 55, size: 'M' },
    { name: '芝芝紅豆', categoryId: 'milk-cap', price: 60, size: 'M' },
    { name: '芝芝芒果', categoryId: 'milk-cap', price: 65, size: 'M' },
    { name: '紅豆鮮奶', categoryId: 'fresh-milk', price: 50, size: 'M' },
    { name: '芋頭鮮奶', categoryId: 'fresh-milk', price: 55, size: 'M' },
    { name: '花生鮮奶', categoryId: 'fresh-milk', price: 50, size: 'M' },
    { name: '燕麥鮮奶', categoryId: 'fresh-milk', price: 50, size: 'M' },
    { name: '巧克力鮮奶', categoryId: 'fresh-milk', price: 45, size: 'M' },
    { name: '檸檬氣泡', categoryId: 'sparkling', price: 35, size: 'M' },
    { name: '百香氣泡', categoryId: 'sparkling', price: 40, size: 'M' },
    { name: '芒果氣泡', categoryId: 'sparkling', price: 45, size: 'M' },
    { name: '葡萄氣泡', categoryId: 'sparkling', price: 40, size: 'M' },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name },
      update: {},
      create: {
        id: product.name,
        name: product.name,
        categoryId: product.categoryId,
        price: product.price,
        size: product.size,
        image: drinkImages[product.name] || null,
      },
    })
  }
  console.log('Created products')

  console.log('Database seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
