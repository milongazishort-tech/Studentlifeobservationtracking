# Student Life Progress & Self-Improvement Tracker

A production-grade, full-stack lifestyle and habit optimization platform built specifically for university students. Designed around a continuous 30-day tracking cycle, a deterministic 100-point scoring algorithm across 12 core life areas, automated midnight missed-day penalty backfills, progressive 7-day weekly delta reports, and an end-of-month 10-level Life Stage assessment.

---

## 🌟 Key Features

- **12 Core Life Areas Tracking**: Evaluates early morning wakeups, university attendance, class participation, personal discipline, meaningful social interactions, self-directed learning, physical fitness, skill development, academic recap, social media control, self-reflection journaling, and consistent sleep hygiene.
- **Deterministic 100-Point Scoring Engine**:
  - Normal academic days: Scaled out of 100 points.
  - University off-days: Omits attendance and participation, scaling habits out of 82 points without penalizing students.
  - Divide-by-zero protection and pure function scoring architecture.
- **30-Day Cycle State Machine**:
  - Enforces a single active cycle per student with frozen wakeup/sleep target baselines.
  - Auto-calculates Day 1 through Day 30 calendar indexing.
  - 24-hour yesterday grace window for late submissions.
  - Streak protection: Same-day edits recalculate scores but never duplicate streak increments.
- **Midnight Missed-Day Backfill Automation**:
  - Background cron job running at `0 0 * * *` identifies unlogged days.
  - Automatically inserts 0% score penalty records and resets the active streak to 0.
- **Weekly & 30-Day Analytics**:
  - **Weekly Reports**: 7-day aggregation pipelines with $\Delta$ comparison from previous weeks, best/lowest days, 12-area breakdown, and personalized improvement tips.
  - **Monthly Assessment**: 30-day radar charts, top 3 strengths, bottom 3 weaknesses, consistency rates, and classification into 10 official Life Stages (from *Stage 1: Ground Zero* to *Stage 10: Master of Student Life*).
- **Notification Engine**:
  - Web Push (VAPID) service worker notifications for nightly check-in reminders.
  - Automatic cleanup of deactivated push subscriptions (410 Gone / 404 Not Found).
  - Milestone congratulatory emails at 7, 14, 21, and 30 consecutive tracked days.
- **Enterprise-Grade Security**:
  - Argon2/bcrypt (12 rounds) salted password hashing.
  - Strict input sanitization against XSS across all free-text fields.
  - Rate limiting on authentication routes (10 requests per 15-minute window).
  - Cascaded deletion: Account deletion permanently cleanses records across all 7 database collections.

---

## 🏗️ Architecture & Technology Stack

```
studentlife observation/
├── backend/                       # Express.js REST API
│   ├── config/                    # MongoDB connection & VAPID setup
│   ├── controllers/               # Route controllers (Auth, Cycle, Checklist, Reports, Notifications)
│   ├── middleware/                # JWT authGuard, rateLimiter, error handlers
│   ├── models/                    # 7 Mongoose Schemas (User, Cycle, DailyActivity, DailyScore, etc.)
│   ├── routes/                    # API v1 routes
│   ├── services/                  # Business logic (Scoring, Aggregations, Cron, WebPush, Email)
│   ├── tests/                     # 10 Jest test suites (94 tests, 100% pass rate)
│   └── server.js                  # Application entry point
├── frontend/                      # Next.js 14+ App Router Client
│   ├── app/                       # App router pages ((auth), (app), dashboard, checklist, weekly, monthly)
│   ├── components/                # UI components, layout, charts (Recharts)
│   ├── context/                   # AuthContext with token injection
│   ├── lib/                       # Axios client with timezone headers
│   └── public/                    # Service worker (sw.js) and static assets
├── docker-compose.yml             # Container orchestration
└── README.md
```

### Technology Matrix
| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14+ (App Router), React 18, Tailwind CSS, Recharts, Lucide React, Axios |
| **Backend** | Node.js 20, Express.js, Mongoose 8+, `node-cron`, `web-push`, `nodemailer` |
| **Database** | MongoDB 7+ (WiredTiger engine, compound indexes, multi-document transactions) |
| **Testing** | Jest, Supertest |
| **DevOps** | Docker, Docker Compose, Multi-stage Alpine builds |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or v20+
- [MongoDB](https://www.mongodb.com/) v7.0+ (Local instance or MongoDB Atlas)
- npm or yarn

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/studentlife_tracker
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long!
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:3000
   BCRYPT_ROUNDS=12

   # Web Push Notifications (Generate via: npx web-push generate-vapid-keys)
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   VAPID_SUBJECT=mailto:admin@studentlifetracker.com

   # Email Configuration (e.g. Mailtrap or Gmail SMTP)
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_pass
   EMAIL_FROM=noreply@studentlifetracker.com
   ```
4. Start the development backend:
   ```bash
   npm run dev
   ```
   The API will be accessible at `http://localhost:5000/api/v1`.

---

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
   ```
4. Start the development frontend:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running the Test Suite

The test suite covers pure scoring logic, multi-document database transactions, cycle lifecycle validation, cron backfill simulations, and end-to-end user flows.

```bash
cd backend
npm test
```

### Full Test Breakdown (10 Suites, 94 Tests, 100% Pass)
- `tests/e2e.test.js`: Full-system end-to-end integration (registration -> cycle setup -> 30 check-ins -> updates -> missed-day reset -> weekly reports -> 30-day life stage).
- `tests/scoring_and_checklist.test.js`: Core 12-item scoring rules and off-day denominator logic.
- `tests/auth_user_flow.test.js`: Authentication, verification, login, profile updates, and cascade deletion.
- `tests/cycle_lifecycle.test.js`: Active cycle single-state constraints and Day 1–30 progress calculations.
- `tests/missed_day_backfill.test.js`: Cron missed-day 0% score backfill and streak zeroing.
- `tests/aggregation_and_reporting.test.js`: 7-day weekly metrics, delta calculations, and 30-day Life Stage classifications.
- `tests/notifications_and_reminders.test.js`: Web push subscriptions and reminder dispatch queueing.
- `tests/models.test.js`: Schema validation and index enforcement across all collections.
- `tests/errorHandler.test.js`: Centralized AppError envelope verification.
- `tests/errors.test.js`: Unit tests for domain error classes.

---

## 🐳 Production Deployment with Docker Compose

Run the entire multi-container production stack (MongoDB, Express API, and Next.js Standalone Client) using Docker Compose:

```bash
docker-compose up --build -d
```

### Container Endpoints:
- **Frontend Web App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **MongoDB**: `localhost:27017`

To inspect container logs:
```bash
docker-compose logs -f backend
```

To stop all containers:
```bash
docker-compose down
```

---

## 📖 API Documentation Summary (`/api/v1`)

All endpoints return a standardized JSON envelope:
- **Success**: `{ success: true, data: { ... }, message?: "..." }`
- **Error**: `{ success: false, error: { code: "...", message: "...", field?: "...", timestamp: "..." } }`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new student profile | No |
| `POST` | `/auth/login` | Authenticate and obtain JWT token | No (Rate Limited) |
| `GET` | `/auth/verify-email/:token` | Verify email address | No |
| `POST` | `/auth/forgot-password` | Request password reset email | No |
| `POST` | `/auth/reset-password` | Set new password with token | No |
| `GET` | `/users/me` | Fetch active user profile | Yes |
| `PUT` | `/users/me` | Update target times and preferences | Yes |
| `DELETE` | `/users/me` | Permanently delete account and all data | Yes |
| `POST` | `/cycles` | Start a new 30-day tracking cycle | Yes |
| `GET` | `/cycles/active` | Get current active cycle & progress | Yes |
| `GET` | `/cycles/history` | List previous completed/abandoned cycles | Yes |
| `POST` | `/cycles/active/abandon` | Abandon the current active cycle | Yes |
| `POST` | `/checklist` | Submit today's 12-item checklist | Yes |
| `PUT` | `/checklist/today` | Edit today's submitted checklist | Yes |
| `PUT` | `/checklist/yesterday` | Backfill or edit yesterday via grace window | Yes |
| `GET` | `/weekly/:weekNumber` | Fetch 7-day weekly analytics & focus tip | Yes |
| `GET` | `/monthly/:cycleId` | Fetch 30-day radar chart & Life Stage | Yes |
| `POST` | `/notifications/subscribe` | Register browser Web Push endpoint | Yes |
| `DELETE` | `/notifications/unsubscribe` | Unregister Web Push subscription | Yes |

---

## 📄 License
This project is licensed under the MIT License.
