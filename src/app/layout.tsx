import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '60嵐 POS 系統',
  description: '60嵐飲料店 POS 系統 - Point of Sale System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className="bg-wine-50">{children}</body>
    </html>
  )
}