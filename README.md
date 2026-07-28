# 60嵐 POS 系統 (60嵐飲料店)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bstfsfx/pos-system)

**線上 Demo**: https://pos-system.vercel.app

專業的酒紅色主題 POS 系統，適用於手搖飲料店。

## 功能特色

- 🍵 商品管理：經典奶茶、水果茶、奶蓋茶等分類
- 🧋 加料選擇：珍珠、椰果、布丁、仙草
- 💳 多元支付：現金、信用卡
- 👤 權限管理：管理員、員工
- 📊 訂單追蹤

## 技術栈

- **前端**: Next.js 14, React, Tailwind CSS
- **後端**: Next.js API Routes
- **資料庫**: PostgreSQL + Prisma ORM
- **部署**: Vercel

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

复制 `.env.example` 為 `.env`，並填入您的資料庫連線資訊：

```env
DATABASE_URL="postgresql://user:password@host:5432/possystem?schema=public"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

### 3. 初始化資料庫

```bash
# 推送 Schema 到資料庫
npx prisma db push

# 播植範例資料
npm run db:seed
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

打開 http://localhost:3000 使用系統。

### 5. 預設登入

```
帳號: admin
密碼: admin
```

## 部署到 Vercel

### 前置需求

1. [Vercel 帳號](https://vercel.com)
2. [GitHub 帳號](https://github.com)
3. PostgreSQL 資料庫 (可使用 Vercel Postgres、Neon、Supabase 等)

### 部署步驟

1. **推送程式碼到 GitHub**

```bash
git init
git add .
git commit -m "Initial POS system"
gh repo create pos-system --public
git push origin main
```

2. **在 Vercel 上部署**

- 前往 [Vercel Dashboard](https://vercel.com/dashboard)
- 點擊 "New Project"
- 選擇您剛才推送到 GitHub 的儲存庫
- 設定環境變數：
  - `DATABASE_URL`: 您的 PostgreSQL 連線網址
  - `JWT_SECRET`: 隨機的安全密鑰
- 點擊 "Deploy"

3. **資料庫遷移**

部署完成後，在 Vercel 的 PowerShell 或從本地端執行：

```bash
# 設定 Vercel CLI
npx vercel link

# 推送 Prisma Schema
npx prisma db push

# 播植資料
npm run db:seed
```

## 資料庫 Schema

- `User`: 使用者帳號
- `Category`: 商品分類
- `Product`: 商品
- `Topping`: 加料選項
- `Order`: 訂單
- `OrderItem`: 訂單項目

## License

MIT
