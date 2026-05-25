import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
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

  // Create categories
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
      where: { id: 'toppings' },
      update: {},
      create: {
        id: 'toppings',
        name: '加料',
        description: 'Additional toppings',
        color: '#2F4F4F',
        sortOrder: 4,
      },
    }),
  ])
  console.log('Created categories')

  // Create toppings
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

  // Create sample products
  const products = [
    // Classic Milk Tea series
    { name: '原味奶茶', categoryId: 'classic-milk-tea', price: 30, size: 'M' },
    { name: '珍奶', categoryId: 'classic-milk-tea', price: 40, size: 'M' },
    { name: '烏龍奶茶', categoryId: 'classic-milk-tea', price: 35, size: 'M' },
    { name: '伯爵奶茶', categoryId: 'classic-milk-tea', price: 40, size: 'M' },
    // Fruit Tea series
    { name: '檸檬綠茶', categoryId: 'fruit-tea', price: 35, size: 'M' },
    { name: '百香雙Q', categoryId: 'fruit-tea', price: 45, size: 'M' },
    { name: '芒果綠茶', categoryId: 'fruit-tea', price: 50, size: 'M' },
    { name: '荔枝凍飲', categoryId: 'fruit-tea', price: 45, size: 'M' },
    // Milk Cap series
    { name: '芝芝奶茶', categoryId: 'milk-cap', price: 55, size: 'M' },
    { name: '芝芝綠茶', categoryId: 'milk-cap', price: 55, size: 'M' },
    { name: '芝芝紅豆', categoryId: 'milk-cap', price: 60, size: 'M' },
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