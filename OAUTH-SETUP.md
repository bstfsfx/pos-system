# OAuth API 申請說明

## Google OAuth (Google Sign-In)

### 申請步驟：

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案 → 「建立專案」→ 輸入名稱如「60嵐 POS」
3. 左側選單「API 和服務」→ 「OAuth 同意畫面」
4. 選擇「外部」→ 填寫：
   - 應用程式名稱：60嵐 POS
   - 使用者支援電子郵件：你的 Gmail
   -  Developer contact information：你的 Gmail
5. 儲存後點擊「新增範圍」→ 勾選 `email`, `profile`
6. 點擊「新增使用者」→ 輸入允許測試的 email（你的 Gmail）
7. 左側選單「憑證」→ 「建立憑證」→ 「OAuth 用戶端 ID」
8. 選擇「網站應用程式」→ 名稱輸入「60嵐 POS」
9. 授權 JavaScript 來源填寫：
   - `http://localhost:3000`（開發環境）
   - 生產環境網域
10. 授權重新導向 URI：
   - `http://localhost:3000/api/auth/google`
   - 生產環境網域
11. 取得「用戶端 ID」和「用戶端密碼」

### 環境變數設定：
```
GOOGLE_CLIENT_ID=你的用戶端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的用戶端密碼
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## LINE Login

### 申請步驟：

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 使用 LINE 帳號登入
3. 點擊「建立 Provider」→ 輸入名稱如「60嵐」→ 確認
4. 點擊「建立 Channel」→ 選擇「LINE Login」
5. 填寫 channel 資料：
   - Company name：你的公司名稱
   - App name：60嵐 POS
   - Email：你的 email
6. 切換到「LINE Login」標籤
7. 下方的「Callback URL」填寫：
   - `http://localhost:3000/api/auth/line`
   - 生產環境網域
8. 儲存後取得：
   - Channel ID
   - Channel Secret

### 環境變數設定：
```
LINE_CLIENT_ID=你的Channel ID
LINE_CLIENT_SECRET=你的Channel Secret
```

---

## Facebook Login (Meta for Developers)

### 申請步驟：

1. 前往 [Meta for Developers](https://developers.facebook.com/)
2. 使用 Facebook 帳號登入
3. 點擊「我的應用程式」→ 「建立應用程式」
4. 選擇「消費者」→ 輸入應用程式名稱如「60嵐 POS」→ 建立
5. 左侧选单「设定」→「基本资料」
6. 填写：
   - 隐私权政策网址：你的网站隐私政策（可先用 #）
   - 服务条款网址：同上
   - 应用程式网址：http://localhost:3000
7. 「状态」选择「上线」→ 确认
8. 添加产品：左侧「功能」→「Facebook 登录」→「设定」
9. 有效的 OAuth 重新导向 URI：
   - `http://localhost:3000/api/auth/facebook`
10. 设定→ 基本资料→ 取得 App ID 和 App Secret

### 环境变数设定：
```
FACEBOOK_APP_ID=你的App ID
FACEBOOK_APP_SECRET=你的App Secret
```

---

## Vercel 环境变数设定

在 Vercel Project Settings 中设定：

```
DATABASE_URL=postgresql://...@aws.neon.tech/possystem
JWT_SECRET=随机字串
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
LINE_CLIENT_ID=xxx
LINE_CLIENT_SECRET=xxx
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx
NEXT_PUBLIC_BASE_URL=https://你的网域.vercel.app
```

---

## 本地开发测试

```bash
# 安装依赖
npm install

# 设定 .env
cp .env.example .env
# 编辑 .env 填入上述值

# 本机执行 prisma
npx prisma db push
npm run dev
```

然后开启 http://localhost:3000 点选 Google/LINE/Facebook 按钮测试登入。