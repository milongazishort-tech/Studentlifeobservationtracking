# System Architecture Document
## Student Life Progress & Self-Improvement Tracker

---

| Field | Detail |
|---|---|
| **Document Type** | System Architecture |
| **Source** | `PRD.md` Version 2.0 |
| **Architecture Style** | Layered Monolithic Architecture |
| **Date** | November 2026 |
| **Team** | Md. Mahfuzur Rahman Milon (241071019) · Sumaia Abrar (241071010) |
| **Course** | CSE 3210 · SMUCT |

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Layered Architecture Design](#2-layered-architecture-design)
3. [Technology Stack](#3-technology-stack)
4. [Frontend Architecture — Next.js](#4-frontend-architecture--nextjs)
5. [Backend Architecture — Express.js](#5-backend-architecture--expressjs)
6. [Database Architecture — MongoDB](#6-database-architecture--mongodb)
7. [Authentication & Security](#7-authentication--security)
8. [Scoring & Business Logic Engine](#8-scoring--business-logic-engine)
9. [Scheduled Background Jobs & Missed-Day Backfilling](#9-scheduled-background-jobs--missed-day-backfilling)
10. [Notification Architecture (Web Push & Email)](#10-notification-architecture-web-push--email)
11. [API Design](#11-api-design)
12. [Folder Structure](#12-folder-structure)
13. [Environment Configuration](#13-environment-configuration)

---

## 1. Architecture Overview

### 1.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    NEXT.JS (Frontend App Router)                │   │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│   │   │  Pages   │  │Components│  │  Hooks   │  │ ServiceWorker│  │   │
│   │   │  (SSR)   │  │  (UI)    │  │ (State)  │  │  (Web Push)  │  │   │
│   │   └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ HTTPS / REST API (JSON) + Timezone Headers
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                       EXPRESS.JS (Backend Server)                       │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │   Routing    │  │  Middleware  │  │  Controllers │  │  Services │  │
│  │   Layer      │  │  (Auth/Val)  │  │  (Handlers)  │  │ (Logic)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Business Logic Layer                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │  │
│  │  │ Scoring      │  │ Life Stage   │  │ Life Insight         │   │  │
│  │  │ Engine       │  │ Classifier   │  │ Rule Engine          │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 Scheduled Jobs (node-cron)                       │  │
│  │   - Midnight Missed-Day Backfiller (0 0 * * *)                   │  │
│  │   - Reminder Dispatcher (every minute)                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ Mongoose ODM
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                         MONGODB (Database)                              │
│                                                                         │
│  ┌────────────┐ ┌───────────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │   users    │ │dailyActivities│ │ dailyScores  │ │weeklySummaries│  │
│  └────────────┘ └───────────────┘ └──────────────┘ └───────────────┘  │
│  ┌────────────────┐ ┌──────────────┐ ┌────────────────┐                │
│  │ monthlyResults │ │    cycles    │ │ pushSubscriptions│              │
│  └────────────────┘ └──────────────┘ └────────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Style — Layered Monolithic
The backend is structured into modular layers (Routing, Controller, Service, Domain Logic, Data Access), ensuring strict downward dependency. Business calculations (scoring and insights) are pure, database-agnostic functions allowing reliable unit testing.

---

## 2. Layered Architecture Design

```
┌──────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                         │
│           Next.js Pages, Components, Custom Hooks            │
│         (App Router, Form Handling, Recharts, PWA Worker)    │
└───────────────────────────────┬──────────────────────────────┘
                                │ HTTP Requests (fetch / axios) + Timezone Offset
┌───────────────────────────────▼──────────────────────────────┐
│                      API LAYER                               │
│          Express.js Routers + Middleware + Controllers       │
│     (Authentication, Input Validation, Timezone Normalizer)  │
└───────────────────────────────┬──────────────────────────────┘
                                │ Calls Service functions
┌───────────────────────────────▼──────────────────────────────┐
│                 BUSINESS LOGIC LAYER                         │
│    ScoringEngine · LifeStageClassifier · InsightRuleEngine   │
│       WeeklyAggregator · ConsistencyCalculator               │
└───────────────────────────────┬──────────────────────────────┘
                                │ Calls Repository methods
┌───────────────────────────────▼──────────────────────────────┐
│                  DATA ACCESS LAYER                           │
│    Mongoose Models · Repository Classes · Query Builders     │
└───────────────────────────────┬──────────────────────────────┘
                                │ Mongoose ODM Queries
┌───────────────────────────────▼──────────────────────────────┐
│                    DATABASE LAYER                            │
│                 MongoDB Collections                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | Next.js | 14+ (App Router) | SSR + CSR web app, responsive layout |
| **UI Styling** | Tailwind CSS | 3+ | Utility styling & mobile responsiveness |
| **Charts** | Recharts | 2+ | 30-day trend lines, weekly breakdown bars, radar chart |
| **Backend Framework** | Express.js | 4+ | REST API server |
| **Database** | MongoDB | 7+ | Document storage |
| **ODM** | Mongoose | 8+ | Schema definition and indexing |
| **Authentication** | JWT + bcryptjs | — | Stateless session & password hashing |
| **Job Scheduling** | node-cron | 3+ | Automated midnight missed-day backfill & reminders |
| **Push Notifications** | web-push | 3+ | VAPID-based in-browser web push alerts |
| **Email Service** | Nodemailer | 6+ | Account verification, password reset, milestone emails |

---

## 4. Frontend Architecture — Next.js

### 4.1 Page Structure (App Router)
```
app/
├── (auth)/
│   ├── register/page.jsx
│   ├── login/page.jsx
│   └── forgot-password/page.jsx
├── (app)/
│   ├── layout.jsx            → Main navigation shell
│   ├── dashboard/page.jsx    → Current Day counter, Streak, Today's status
│   ├── cycle/
│   │   ├── setup/page.jsx
│   │   └── journey/page.jsx  → 30-day timeline
│   ├── checklist/
│   │   ├── page.jsx          → Today's checklist form
│   │   └── yesterday/page.jsx→ Grace window entry form
│   ├── daily-score/page.jsx  → Instant score breakdown
│   ├── weekly/[week]/page.jsx→ Week 1-4 & Final Stretch report
│   ├── monthly/page.jsx      → 30-day Life Stage & Life Insight report
│   └── profile/page.jsx      → Target times, reminders & account settings
```

---

## 5. Backend Architecture — Express.js

### 5.1 Middleware Pipeline
1. `cors()`: Whitelists client domain.
2. `helmet()`: Enforces secure HTTP headers.
3. `express.json()`: Parses incoming JSON bodies.
4. `timezoneMiddleware`: Reads `x-timezone-offset` header to normalize dates to the student's local midnight.
5. `authMiddleware`: Validates JWT token and attaches `req.user = { userId }`.
6. `validateRequest`: Executes `express-validator` rules.
7. `errorHandler`: Global catch-all returning structured JSON error payloads.

---

## 6. Database Architecture — MongoDB

### 6.1 `users` Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  university: String,
  department: String,
  targetWakeUpTime: String,       // "06:30"
  targetSleepTime: String,        // "23:00"
  reminderTime: String,           // "21:30"
  reminderEnabled: Boolean,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 6.2 `pushSubscriptions` Collection
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'users', index: true },
  endpoint: String,
  keys: {
    p256dh: String,
    auth: String
  },
  createdAt: Date
}
```

### 6.3 `cycles` Collection
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'users', index: true },
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  targetWakeUpTime: String,
  targetSleepTime: String,
  cycleNumber: Number,
  createdAt: Date
}
```

### 6.4 `dailyActivities` Collection
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'users', index: true },
  cycleId: { type: ObjectId, ref: 'cycles', index: true },
  date: Date,                     // Normalized to midnight local
  dayNumber: Number,              // 1 to 30
  isOffDay: Boolean,
  isMissedDay: { type: Boolean, default: false },

  // 12 Items
  item1_earlyMorning: Boolean,
  item2_universityAttendance: { type: String, enum: ['yes', 'no', 'off_day'] },
  item3_classParticipation_attended: Number,
  item3_classParticipation_total: Number,
  item4_personalDiscipline: Boolean,
  item5_socialInteractions: Number,
  item6_dailyLearning: String,
  item7_physicalActivity: Boolean,
  item7_physicalMinutes: Number,
  item8_skillDevelopmentMinutes: Number,
  item9_classWorkRecap: Boolean,
  item10_socialMediaControl: { type: String, enum: ['controlled', 'useful', 'excessive'] },
  item11_selfReflection: String,
  item12_sleepOnTime: Boolean,

  isGraceEntry: { type: Boolean, default: false },
  submittedAt: Date
}
// Unique compound index: prevents duplicate submission for the same date
dailyActivitiesSchema.index({ userId: 1, date: 1 }, { unique: true });
```

### 6.5 `dailyScores` Collection
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'users', index: true },
  cycleId: { type: ObjectId, ref: 'cycles', index: true },
  dailyActivityId: { type: ObjectId, ref: 'dailyActivities' },
  date: Date,
  dayNumber: Number,
  totalScore: Number,             // 0.00 to 100.00%
  maxAvailablePoints: Number,     // 100 or 82 on off-days
  achievedPoints: Number,
  scores: {
    item1: Number, item2: Number, item3: Number, item4: Number,
    item5: Number, item6: Number, item7: Number, item8: Number,
    item9: Number, item10: Number, item11: Number, item12: Number
  },
  createdAt: Date
}
dailyScoresSchema.index({ userId: 1, date: 1 }, { unique: true });
```

---

## 7. Authentication & Security

- **JWT Token**: Signed with HS256 algorithm; contains `{ userId }`, expires in 7 days.
- **Same-Day Edit Authorization**: `PUT /api/checklist/today` verifies that the target activity date matches the client's current calendar date before applying updates.
- **Tenant Isolation**: Every database query explicitly mandates `userId: req.user.userId`.

---

## 8. Scoring & Business Logic Engine

### 8.1 Exact Deterministic Scoring (`ItemScorers.js`)

```javascript
const itemScorers = {
  item1: (val) => ({ achieved: val ? 8 : 0, max: 8 }),
  item2: (val) => ({ achieved: val === 'yes' ? 10 : 0, max: val === 'off_day' ? 0 : 10 }),
  item3: (att, tot, isOff) => {
    if (isOff) return { achieved: 0, max: 0 };
    if (!tot || tot < 1) return { achieved: 0, max: 8 };
    const clampedAtt = Math.min(Math.max(0, att), tot);
    return { achieved: (clampedAtt / tot) * 8, max: 8 };
  },
  item4: (val) => ({ achieved: val ? 8 : 0, max: 8 }),
  item5: (interactions) => {
    const count = Math.max(0, interactions || 0);
    const pts = count >= 3 ? 6 : count === 2 ? 4 : count === 1 ? 2 : 0;
    return { achieved: pts, max: 6 };
  },
  item6: (note) => ({ achieved: (note && note.trim().length > 0) ? 10 : 0, max: 10 }),
  item7: (active, mins) => {
    if (!active) return { achieved: 0, max: 10 };
    return { achieved: (mins >= 15) ? 10 : 5, max: 10 };
  },
  item8: (mins) => {
    const m = Math.max(0, mins || 0);
    const pts = m >= 60 ? 10 : m >= 30 ? 6 : m >= 15 ? 3 : 0;
    return { achieved: pts, max: 10 };
  },
  item9: (val) => ({ achieved: val ? 10 : 0, max: 10 }),
  item10: (val) => {
    const map = { controlled: 6, useful: 3, excessive: 0 };
    return { achieved: map[val] ?? 0, max: 6 };
  },
  item11: (journal) => ({ achieved: (journal && journal.trim().length > 0) ? 8 : 0, max: 8 }),
  item12: (val) => ({ achieved: val ? 6 : 0, max: 6 })
};
```

### 8.2 Life Stage Classifier (`LifeStageClassifier.js`)
Maps `lifeScore` to boundaries:
- **Stage 1 (0.00 – 19.99%)**: Critical / Highly Unbalanced
- **Stage 2 (20.00 – 29.99%)**: Struggling / Low Discipline
- **Stage 3 (30.00 – 39.99%)**: Inconsistent Routine
- **Stage 4 (40.00 – 49.99%)**: Emerging Awareness
- **Stage 5 (50.00 – 59.99%)**: Moderate Balance
- **Stage 6 (60.00 – 69.99%)**: Steady Progress
- **Stage 7 (70.00 – 79.99%)**: Disciplined Student
- **Stage 8 (80.00 – 89.99%)**: High Achiever
- **Stage 9 (90.00 – 94.99%)**: Exemplary Lifestyle
- **Stage 10 (95.00 – 100.00%)**: Exceptional Self-Development

---

## 9. Scheduled Background Jobs & Missed-Day Backfilling

Implemented with `node-cron`:

### 9.1 Midnight Missed-Day Backfill Job (`0 0 * * *`)
1. Searches for all `cycles` with `status: 'active'`.
2. Computes the user's expected previous date.
3. Checks if an entry exists in `dailyActivities`.
4. If missing and past the grace window:
   - Inserts dummy `dailyActivities` with `isMissedDay: true`.
   - Inserts `dailyScores` with `totalScore: 0`, `achievedPoints: 0`.
   - Resets the consecutive streak counter to 0.

---

## 10. Notification Architecture (Web Push & Email)

1. **Web Push (Primary)**:
   - Client registers a Service Worker and sends `PushSubscription` to `/api/notifications/subscribe`.
   - Backend triggers browser alerts via the `web-push` library with payload: `{"title": "Check-in Reminder", "body": "Record today's 12 life areas before midnight!"}`.
2. **Email Alerts (Secondary)**:
   - Handled via Nodemailer for registration verification, password resets, and milestone certificates (7, 14, 21, and 30-day streaks).

---

## 11. API Design

### 11.1 Checklist Endpoints
- `POST /api/checklist`: Submits today's checklist (returns `409 Conflict` if already exists).
- `PUT /api/checklist/today`: **Updates/edits today's submitted checklist**.
- `PUT /api/checklist/yesterday`: Updates yesterday's entry (within 1-day grace window).
- `GET /api/checklist/today`: Retrieves today's current recorded activity.

### 11.2 Scores & Reports
- `GET /api/scores/today`: Today's calculated score & per-item breakdown.
- `GET /api/weekly/:weekNumber`: Weekly summary (weeks 1 to 4 + final stretch).
- `GET /api/monthly/:cycleId`: Final 30-day Life Stage report.

### 11.3 Cycle Lifecycle
- `POST /api/cycles`: Starts a new 30-day cycle.
- `PATCH /api/cycles/:id/abandon`: Marks active cycle as `abandoned`.

---

## 12. Folder Structure

```
studentlife-tracker/
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   ├── checklist/
│   │   │   ├── weekly/
│   │   │   └── monthly/
│   │   └── layout.jsx
│   ├── public/
│   │   └── sw.js            ← Service Worker for Web Push Notifications
│   └── components/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   ├── scoring/
│   │   ├── cron/            ← Missed-day backfill & reminder jobs
│   │   └── notification/    ← Web Push & Nodemailer services
│   └── server.js
```

---

## 13. Environment Configuration

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/studentlife_tracker
JWT_SECRET=super_secure_jwt_secret_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@studentlifetracker.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```
