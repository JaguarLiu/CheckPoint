# 遠端工作打卡 App (PWA)

## 目標

這個專案的目標是為 5~50 人的遠端團隊提供簡單、透明、不侵犯隱私的打卡功能，讓團隊能輕鬆管理員工的出勤，並透過打卡紀錄自動計算工時與報表，解決傳統打卡機系統的局限性。

---

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | React 19 + Vite 7 + Tailwind CSS v4 + SWR |
| PWA | vite-plugin-pwa (Workbox) |
| 路由 | react-router-dom v7 |
| 後端 | Fastify 5 |
| ORM | Prisma 6 |
| 資料庫 | PostgreSQL |
| 認證 | Google OAuth + JWT |
| 套件管理 | Yarn Workspaces (Monorepo) |

---

## 系統架構圖

```mermaid
flowchart TB
User[員工 / 管理者]
PWA[React PWA 前端<br/>client/]
API[Fastify API<br/>server/]
Auth[Google Auth]
DB[(PostgreSQL)]

User --> PWA
PWA -->|/api proxy| API
API --> Auth
API --> DB
```

---

## 專案結構 (Monorepo)

```
FlashPoint/
├── package.json                ← Yarn Workspaces 根設定
├── .env.example
├── .gitignore
│
├── client/                     ← React PWA 前端
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Admin.jsx
│   │   ├── components/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   ├── PaperPiece.jsx
│   │   │   ├── PunchButton.jsx
│   │   │   └── AttendanceCard.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useAttendance.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   └── time.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js          ← 含 /api → localhost:3000 proxy
│   └── package.json
│
└── server/                     ← Fastify + Prisma 後端
    ├── src/
    │   ├── app.js              ← Fastify 入口
    │   ├── routes/
    │   │   ├── auth.js         ← Google OAuth 登入
    │   │   ├── attendance.js   ← 打卡 (punch-in / punch-out)
    │   │   ├── correction.js   ← 補打卡申請
    │   │   └── admin.js        ← 管理者 API
    │   └── plugins/
    │       ├── auth.js         ← JWT 驗證 plugin
    │       └── prisma.js       ← Prisma client plugin
    ├── prisma/
    │   └── schema.prisma
    ├── .env
    └── package.json
```

---

## 員工端 User Flow

```mermaid
flowchart TD
A[進入 App] --> B{是否已登入?}
B -- 否 --> D[登入]
D --> E[進入 Dashboard]
B -- 是 --> E[Dashboard]
E --> F{今日是否已打卡?}
F -- 未上班 --> G[點擊 上班打卡]
G --> H[取得 GPS]
H --> I[儲存 punch_in]
I --> J[狀態: 上班中]
F -- 已上班 --> K[點擊 下班打卡]
K --> L[儲存 punch_out]
L --> M[計算工時]
M --> N[狀態: 已完成]
E --> O[查看歷史紀錄]
O --> P[申請補打卡]
```

## 管理者端流程圖

```mermaid
flowchart TD
A[管理者登入] --> B[進入 Admin Dashboard]
B --> C[查看今日出勤列表]
C --> D{是否有異常?}
D -- 有 --> E[標記遲到 / 缺卡]
D -- 無 --> F[正常顯示]
B --> G[查看單一員工月曆]
G --> H[審核補打卡申請]
B --> I[匯出 Excel 報表]
```

---

## API 端點

### 認證

| Method | 路徑 | 說明 |
|--------|------|------|
| POST | `/api/auth/google` | Google OAuth 登入，回傳 JWT |
| GET | `/api/auth/me` | 取得當前登入用戶資訊 |

### 員工打卡

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/attendance/today` | 取得今日打卡紀錄 |
| POST | `/api/punch-in` | 上班打卡 (含 GPS 座標) |
| POST | `/api/punch-out` | 下班打卡 (自動計算工時) |
| GET | `/api/attendance?month=YYYY-MM` | 查詢月份考勤紀錄 |
| POST | `/api/correction-requests` | 提交補打卡申請 |
| GET | `/api/correction-requests` | 查詢自己的補打卡申請 |

### 管理者

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/attendance?date=YYYY-MM-DD` | 查看指定日期全員出勤 |
| PATCH | `/api/admin/attendance/:id` | 標記遲到 / 缺卡 |
| GET | `/api/admin/correction-requests` | 查看所有補打卡申請 |
| PATCH | `/api/admin/correction-requests/:id` | 審核補打卡申請 |

### 打卡 API 系統流程

```mermaid
sequenceDiagram
participant U as User
participant FE as React PWA
participant API as Fastify API
participant DB as PostgreSQL

U->>FE: 點擊 上班打卡
FE->>FE: 取得 GPS
FE->>API: POST /api/punch-in
API->>DB: 檢查今日是否已有紀錄
DB-->>API: 回傳結果

alt 尚未打卡
    API->>DB: 新增 punch_in
    API-->>FE: success
else 已打卡
    API-->>FE: error
end
```

### 下班打卡流程

```mermaid
sequenceDiagram
participant U as User
participant FE as React PWA
participant API as Fastify API
participant DB as PostgreSQL

U->>FE: 點擊 下班打卡
FE->>API: POST /api/punch-out
API->>DB: 取得今日 punch_in
API->>API: 計算工時
API->>DB: 更新 punch_out + duration
API-->>FE: success
```

---

## 資料庫 ER Diagram

```mermaid
erDiagram

companies ||--o{ users : has
users ||--o{ attendance_records : creates
attendance_records ||--o{ correction_requests : has

companies {
  uuid id PK
  string name
  timestamp created_at
}

users {
  uuid id PK
  string email UK
  string name
  string avatar
  string role
  uuid company_id FK
  string timezone
  timestamp created_at
}

attendance_records {
  uuid id PK
  uuid user_id FK
  date work_date
  timestamp punch_in
  timestamp punch_out
  int work_duration
  float gps_lat
  float gps_lng
  string status
  timestamp created_at
}

correction_requests {
  uuid id PK
  uuid attendance_id FK
  text reason
  string status
  timestamp created_at
}
```

---

## 開發指令

```bash
# 安裝所有依賴
yarn install

# 同時啟動前後端 dev server
yarn dev

# 只啟動前端 (Vite, port 5173)
yarn dev:client

# 只啟動後端 (Fastify, port 3000)
yarn dev:server

# 打包前端
yarn build

# 資料庫操作
yarn db:push        # 同步 schema 到 DB (開發用)
yarn db:migrate     # 建立 migration
yarn db:studio      # 開啟 Prisma Studio GUI
```

## 環境變數

複製 `.env.example` 到 `server/.env`，填入以下設定：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flashpoint?schema=public"
JWT_SECRET="your-random-secret"
PORT=3000
```

## PWA 設定

已透過 `vite-plugin-pwa` 自動產生：

- `manifest.webmanifest` — name、short_name、theme_color、icons、display: standalone
- `sw.js` — Service Worker，自動 precache 靜態資源
- Runtime caching — API 請求使用 NetworkFirst 策略
