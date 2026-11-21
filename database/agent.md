# AI Agent Master Instruction & Implementation Blueprint
## Student Life Progress & Self-Improvement Tracker

---

| Metadata Field | Value |
|---|---|
| **Document Purpose** | Comprehensive AI Agent System Prompt, Execution Persona, Architecture Spec & Engineering Guardrails |
| **Project Name** | Student Life Progress & Self-Improvement Tracker |
| **System Architecture** | Next.js 14+ (App Router) + Express.js (Node.js 20 LTS) + MongoDB 7+ (Mongoose 8+) |
| **Document Suite** | `PRD.md`, `arcthitecture.md`, `database.md`, `databse-schema.md`, `api-spec.md`, `prompt.md` (located in `/database` & project root) |
| **Target AI Consumer** | Antigravity AI, Claude Code, Cursor, Copilot Workspace, Windsurf, Devin, or autonomous coding agents |
| **Current Project State** | **Phases 0–7 Complete & Verified** (All 9 backend test suites, 81 tests passing). Ready for Frontend Phases 8–11. |

---

## Table of Contents
1. [AI Execution Persona & Operating Philosophy](#1-ai-execution-persona--operating-philosophy)
2. [Project Vision & Core Domain Concept](#2-project-vision--core-domain-concept)
3. [Repository Structure & Technology Matrix](#3-repository-structure--technology-matrix)
4. [Critical Business Invariants & Mathematical Rules (DO NOT BREAK)](#4-critical-business-invariants--mathematical-rules-do-not-break)
   - 4.1 The 12-Item Deterministic Scoring Matrix
   - 4.2 The 10 Life Stage Boundaries
   - 4.3 Streak Lifecycle & Update Non-Duplication Guardrail
   - 4.4 Partial Update Merging Rule (Critical Bug Prevention)
   - 4.5 Timezone Normalization Requirement
5. [Database Architecture & Mongoose Rules](#5-database-architecture--mongoose-rules)
6. [API Specification & Standard Error Envelope](#6-api-specification--standard-error-envelope)
7. [Current Implementation & Verification Status](#7-current-implementation--verification-status)
8. [Remaining Phases: Step-by-Step Roadmap (Phases 8–11)](#8-remaining-phases-step-by-step-roadmap-phases-811)
   - Phase 8: Frontend Foundation, Axios Interceptors & Auth Shell
   - Phase 9: Daily Dashboard, 12-Item Checklist UI & Live Scoring
   - Phase 10: Visual Analytics, Weekly Trends & Monthly Radar View
   - Phase 11: Production Deployment, Service Worker & Dockerization
9. [Technical Quirks, Traps & Troubleshooting Guide](#9-technical-quirks-traps--troubleshooting-guide)
10. [Pre-Commit / Pre-Completion Verification Checklist](#10-pre-commit--pre-completion-verification-checklist)

---

## 1. AI Execution Persona & Operating Philosophy

You are an elite **Principal Full-Stack Architect and Lead Systems Engineer**. When an AI agent is instructed to develop, extend, or maintain this codebase, it must adhere strictly to these engineering tenets:

1. **Deterministic Logic Over Approximation:**
   - Formulas, boundaries, and point conversions are mathematically frozen. Never invent scoring formulas or approximate Life Stage percent boundaries.
2. **Strict Layer Isolation:**
   - `Routes` $\rightarrow$ `Middleware` $\rightarrow$ `Controllers` $\rightarrow$ `Services` $\rightarrow$ `Models` / `Domain Engines`.
   - Controllers never perform database queries directly. Routes never contain business logic. React UI components never contain database access logic.
3. **Pure Functions for Core Computation:**
   - The scoring engine (`ItemScorers.js`, `ScoringEngine.js`), classification engine (`LifeStageClassifier.js`), and insight rule engine (`InsightRuleEngine.js`) MUST be pure, deterministic functions free of database, network, or date mutation side effects.
4. **ACID Transactions with Fallback:**
   - Every multi-document mutation (e.g. DailyActivity + DailyScore + Cycle streak increment) must execute inside a MongoDB transaction (`session.startTransaction()`). Always include a fallback to non-transactional execution for standalone test environments lacking replica sets.
5. **No Spec Drift:**
   - Do not add random UI dependencies or rewrite API endpoints. All features must map 1:1 with the documentation suite (`PRD.md`, `api-spec.md`, `database.md`).

---

## 2. Project Vision & Core Domain Concept

### 2.1 The Problem
University students balance academics, physical fitness, sleep schedule, skill development, and social commitments without a private, holistic feedback loop. Generic habit trackers only track binary checkboxes without context.

### 2.2 The Solution
A structured, private **30-day self-observation cycle**:
$$\text{Daily Checklist (12 items)} \longrightarrow \text{Daily Score (0–100\%)} \longrightarrow \text{Weekly Analytics} \longrightarrow \text{30-Day Life Stage (1 of 10) + Life Insight}$$

### 2.3 Core Tenets
- **Student Privacy First**: Every record is strictly indexed and scoped to `req.user.userId`. No public leaderboards.
- **Non-Judgmental Self-Reflection**: Life Stages encourage personal growth, not academic punishment.
- **Fairness & Flexibility**: Off-day adjustments dynamically reduce the denominator (from 100 to 82) so students are not penalized for scheduled university holidays.

---

## 3. Repository Structure & Technology Matrix

### 3.1 Technology Matrix
- **Backend Runtime:** Node.js 20 LTS + Express.js 4+
- **Database & ODM:** MongoDB 7.0+ (MongoDB Atlas) + Mongoose 8.0+
- **Frontend Framework:** Next.js 14+ (App Router) + React 18
- **Styling & Icons:** Tailwind CSS 3+ + Lucide React
- **Data Visualization:** Recharts 2+ (Line, Bar, Radar charts)
- **Security & Auth:** Stateless JWT (`HS256`, 7-day expiration) + `bcryptjs` (12 rounds) + `helmet` + `express-rate-limit`
- **Background Automation:** `node-cron` (midnight backfill & reminder dispatch)
- **Notifications:** `web-push` (VAPID) + `nodemailer` (SMTP)
- **Testing:** Jest + Supertest (`--runInBand` for live MongoDB testing)

### 3.2 Canonical Directory Structure
```
studentlife-tracker/
├── backend/
│   ├── config/
│   │   └── db.js                    # Mongoose 8.0+ connection with retries & graceful shutdown
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT Bearer verification
│   │   ├── validate.middleware.js   # express-validator runner
│   │   ├── rateLimiter.middleware.js# authLimiter (10/15m) & apiLimiter (100/15m)
│   │   └── errorHandler.middleware.js # Unified AppError formatter
│   ├── models/
│   │   ├── User.model.js            # collection: 'users'
│   │   ├── Cycle.model.js           # collection: 'cycles' (partial unique active index)
│   │   ├── DailyActivity.model.js   # collection: 'dailyActivities' (unique compound userId + date)
│   │   ├── DailyScore.model.js      # collection: 'dailyScores' (unique compound userId + date)
│   │   ├── WeeklySummary.model.js   # collection: 'weeklySummaries' (unique compound userId + cycleId + weekNumber)
│   │   ├── MonthlyResult.model.js   # collection: 'monthlyResults' (unique compound userId + cycleId)
│   │   └── PushSubscription.model.js# collection: 'pushSubscriptions' (unique compound userId + endpoint)
│   ├── routes/
│   │   ├── auth.routes.js           # /api/v1/auth/*
│   │   ├── user.routes.js           # /api/v1/users/*
│   │   ├── cycle.routes.js          # /api/v1/cycles/*
│   │   ├── checklist.routes.js      # /api/v1/checklist/*
│   │   ├── score.routes.js          # /api/v1/scores/*
│   │   ├── weekly.routes.js         # /api/v1/weekly/*
│   │   ├── monthly.routes.js        # /api/v1/monthly/*
│   │   └── notification.routes.js   # /api/v1/notifications/*
│   ├── controllers/                 # Express controllers delegating to services
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── cycle.service.js
│   │   ├── checklist.service.js
│   │   ├── scoring/
│   │   │   ├── ItemScorers.js       # Pure functions for Items 1–12
│   │   │   └── ScoringEngine.js     # Denominator adjustments (100 vs 82)
│   │   ├── classification/
│   │   │   ├── LifeStageClassifier.js # 10 Life Stages mapping
│   │   │   └── InsightRuleEngine.js   # Rule-based narrative engine
│   │   ├── aggregation/
│   │   │   ├── WeeklyAggregator.js    # 7-day aggregation & delta calculation
│   │   │   └── MonthlyAggregator.js   # 30-day top strengths & weaknesses
│   │   ├── cron/
│   │   │   ├── missedDayBackfill.job.js # Midnight 0% backfill & streak reset
│   │   │   └── reminderDispatcher.job.js# Minute-level reminder dispatcher
│   │   └── notification/
│   │       ├── webPush.js             # VAPID notification dispatcher
│   │       └── EmailSender.js         # Milestone congratulations emails (7, 14, 21, 30 days)
│   ├── validators/                  # express-validator rule sets
│   ├── utils/
│   │   ├── errors.js                # Custom AppError classes
│   │   ├── date.utils.js            # normalizeToMidnight & calculateDayNumber
│   │   └── email.js                 # Nodemailer transport
│   ├── tests/                       # 9 comprehensive Jest test suites (81 tests)
│   ├── server.js                    # Express app instantiation & cron registration
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.jsx
│   │   │   ├── register/page.jsx
│   │   │   ├── forgot-password/page.jsx
│   │   │   └── reset-password/page.jsx
│   │   ├── (app)/
│   │   │   ├── dashboard/page.jsx
│   │   │   ├── cycle/setup/page.jsx
│   │   │   ├── checklist/page.jsx
│   │   │   ├── checklist/yesterday/page.jsx
│   │   │   ├── daily-score/page.jsx
│   │   │   ├── weekly/[week]/page.jsx
│   │   │   ├── monthly/page.jsx
│   │   │   └── profile/page.jsx
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   │   ├── ui/                      # Button, Input, Modal, Badge, ProgressBar
│   │   ├── checklist/               # Form inputs for all 12 items
│   │   ├── dashboard/               # DayCounter, ScoreCard, StreakBadge, GraceBanner
│   │   ├── reports/                 # Recharts Bar, Line & Radar components
│   │   └── layout/                  # Navbar, Sidebar, AuthGuard
│   ├── context/
│   │   ├── AuthContext.jsx          # Token, User state, login(), logout(), register()
│   │   └── CycleContext.jsx         # Active cycle state, dayNumber, streak
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useCycle.js
│   ├── lib/
│   │   └── axios.js                 # Interceptor injecting Bearer & x-timezone-offset
│   ├── public/
│   │   └── sw.js                    # Web Push service worker
│   └── package.json
│
├── database/                        # Original architectural & requirement documents
│   ├── PRD.md
│   ├── arcthitecture.md
│   ├── database.md
│   ├── databse-schema.md
│   ├── api-spec.md
│   └── prompt.md
├── agent.md                         # This master instruction file
└── prompt.md                        # Master step-by-step implementation prompt
```

---

## 4. Critical Business Invariants & Mathematical Rules (DO NOT BREAK)

### 4.1 The 12-Item Deterministic Scoring Matrix

Scoring MUST be executed by `backend/services/scoring/ItemScorers.js`.

| # | Item Name | Category | Input Type | Max Pts | Exact Scoring Rule |
|---|---|---|---|:---:|---|
| **1** | Early Morning | Personal | Boolean | 8 | `val === true` $\rightarrow$ **8 pts**; `false` $\rightarrow$ **0 pts** |
| **2** | University Attendance | Academic | Enum (`yes`, `no`, `off_day`) | 10 | `'yes'` $\rightarrow$ **10 pts**; `'no'` $\rightarrow$ **0 pts**; `'off_day'` $\rightarrow$ **Excluded from calculation** |
| **3** | Class Participation | Academic | Fraction ($a / b$) | 8 | $\min\left(8, \max\left(0, \frac{a}{b} \times 8\right)\right)$ where $b \ge 1, 0 \le a \le b$; on `off_day` $\rightarrow$ **Excluded** |
| **4** | Personal Discipline | Personal | Boolean | 8 | `val === true` $\rightarrow$ **8 pts**; `false` $\rightarrow$ **0 pts** |
| **5** | Social Interactions | Social | Integer ($\ge 0$) | 6 | $\ge 3 \rightarrow$ **6 pts**; $2 \rightarrow$ **4 pts**; $1 \rightarrow$ **2 pts**; $0 \rightarrow$ **0 pts** |
| **6** | Daily Learning | Academic | String (Text Note) | 10 | `text.trim().length > 0` $\rightarrow$ **10 pts**; empty $\rightarrow$ **0 pts** (Max: 500 chars) |
| **7** | Physical Activity | Physical | Boolean + Minutes | 10 | `active === true` AND $\text{mins} \ge 15 \rightarrow$ **10 pts**; active with $< 15\text{m} \rightarrow$ **5 pts**; inactive $\rightarrow$ **0 pts** |
| **8** | Skill Development | Skill | Minutes ($\ge 0$) | 10 | $\ge 60\text{m} \rightarrow$ **10 pts**; $30\dots59\text{m} \rightarrow$ **6 pts**; $15\dots29\text{m} \rightarrow$ **3 pts**; $< 15\text{m} \rightarrow$ **0 pts** |
| **9** | Class Work Recap | Academic | Boolean | 10 | `val === true` $\rightarrow$ **10 pts**; `false` $\rightarrow$ **0 pts** |
| **10** | Social Media Control | Personal | 3-way Enum | 6 | `'controlled'` $\rightarrow$ **6 pts**; `'useful'` $\rightarrow$ **3 pts**; `'excessive'` $\rightarrow$ **0 pts** |
| **11** | Self-Reflection | Personal | String (Text Journal) | 8 | `text.trim().length > 0` $\rightarrow$ **8 pts**; empty $\rightarrow$ **0 pts** (Max: 500 chars) |
| **12** | Sleeping on Time | Physical | Boolean | 6 | `val === true` $\rightarrow$ **6 pts**; `false` $\rightarrow$ **0 pts** |

#### Total Percentage Formula
$$\text{Daily Score (\%)} = \min\left(100.00, \max\left(0.00, \frac{\text{Achieved Points}}{\text{Max Available Points}} \times 100\right)\right)$$
- **Normal Day:** $\text{Max Available Points} = 100$
- **Off-Day (`item2 === 'off_day'`):** Items 2 and 3 omitted $\rightarrow \text{Max Available Points} = 82$
- Always round to 2 decimal places: `+score.toFixed(2)`.

---

### 4.2 The 10 Life Stage Boundaries

In `backend/services/classification/LifeStageClassifier.js`, map `lifeScore` ($0.00 \dots 100.00$) to these exact boundaries:

| Stage ID | Stage Title | Score Range (%) | Behavioral Meaning |
|:---:|---|:---:|---|
| **1** | Critical / Highly Unbalanced | $0.00 \le \text{score} < 20.00$ | Severe lack of routine; foundational habits missing |
| **2** | Struggling / Low Discipline | $20.00 \le \text{score} < 30.00$ | Erratic habits; academic and physical neglect |
| **3** | Inconsistent Routine | $30.00 \le \text{score} < 40.00$ | Occasional good days overshadowed by poor consistency |
| **4** | Emerging Awareness | $40.00 \le \text{score} < 50.00$ | Starting to build discipline, but frequently skips habits |
| **5** | Moderate Balance | $50.00 \le \text{score} < 60.00$ | Meets minimum standards in most life areas |
| **6** | Steady Progress | $60.00 \le \text{score} < 70.00$ | Solid habits formed; good balance with room for focus |
| **7** | Disciplined Student | $70.00 \le \text{score} < 80.00$ | Strong personal structure and high academic responsibility |
| **8** | High Achiever | $80.00 \le \text{score} < 90.00$ | Outstanding discipline across physical, skill, and academic domains |
| **9** | Exemplary Lifestyle | $90.00 \le \text{score} < 95.00$ | Near-flawless habit execution and self-awareness |
| **10** | Exceptional Self-Development | $95.00 \le \text{score} \le 100.00$ | Mastery of university life; top-tier personal discipline |

*Rule:* Lower bound is inclusive; upper bound is exclusive (except Stage 10 where $100.00$ is inclusive).

---

### 4.3 Streak Lifecycle & Update Non-Duplication Guardrail

Streak count is tracked in `cycles.currentStreak`.

1. **Initial Daily Submission (`POST /api/v1/checklist`):**
   - Atomically insert `DailyActivity` + `DailyScore` and increment streak: `currentStreak = currentStreak + 1`.
2. **Same-Day Edit (`PUT /api/v1/checklist/today`) & Grace Window Edit (`PUT /api/v1/checklist/yesterday`):**
   - **CRITICAL:** Recompute scores and update documents, but **NEVER increment streak**.
3. **Midnight Missed-Day Cron Job (`0 0 * * *`):**
   - When a student skips a day past the midnight grace window, backfill a dummy activity (`isMissedDay: true`), write a `totalScore: 0` score record, and **reset streak: `currentStreak = 0`**.

---

### 4.4 Partial Update Merging Rule (Critical Bug Prevention)

When a client performs `PUT /api/v1/checklist/today`, they might submit a partial payload (e.g. only modifying `item10_socialMediaControl`).
- **NEVER** pass `req.body` directly to `calculateScores()` without merging!
- **RULE:** The service MUST merge existing document values with new updates:
  ```javascript
  const mergedPayload = { ...existingEntry.toObject(), ...payload };
  const calculatedScore = calculateScores(mergedPayload);
  ```
  *(Omitting this causes unsubmitted fields to be treated as 0 or empty, drastically and erroneously slashing the student's daily score!)*

---

### 4.5 Timezone Normalization Requirement

All date calculations must be normalized to the student's local midnight.
The client transmits the `x-timezone-offset` header (minutes offset from UTC, e.g., `-360` for UTC+6).
- Use `backend/utils/date.utils.js`:
  ```javascript
  const normalizeToMidnight = (dateInput = new Date(), timezoneOffset = 0) => {
    const d = new Date(dateInput);
    const localMs = d.getTime() - timezoneOffset * 60 * 1000;
    const localDate = new Date(localMs);
    return new Date(Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate()));
  };
  ```

---

## 5. Database Architecture & Mongoose Rules

1. **Exact CamelCase Collection Names:**
   - `users`, `cycles`, `dailyActivities`, `dailyScores`, `weeklySummaries`, `monthlyResults`, `pushSubscriptions`.
2. **Essential Unique Compound Indexes (Enforce at Schema Level):**
   - `cycles`: `{ userId: 1, status: 1 }` with `{ unique: true, partialFilterExpression: { status: 'active' } }` $\rightarrow$ Strictly forbids multiple active cycles per student.
   - `dailyActivities`: `{ userId: 1, date: 1 }` (Unique).
   - `dailyScores`: `{ userId: 1, date: 1 }` (Unique).
   - `weeklySummaries`: `{ userId: 1, cycleId: 1, weekNumber: 1 }` (Unique).
   - `monthlyResults`: `{ userId: 1, cycleId: 1 }` (Unique).
   - `pushSubscriptions`: `{ userId: 1, endpoint: 1 }` (Unique).
3. **Cascaded Account Deletion:**
   - `DELETE /api/v1/users/me` MUST delete records across all 7 collections in a single transaction.

---

## 6. API Specification & Standard Error Envelope

### 6.1 Versioning
All endpoints are under `/api/v1/...`.

### 6.2 Standard Envelopes
- **Success (200 / 201):**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Operation completed successfully"
  }
  ```
- **Error (4xx / 5xx):**
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Detailed description",
      "field": "optionalFieldName",
      "timestamp": "2026-11-20T23:00:00.000Z",
      "path": "/api/v1/checklist"
    }
  }
  ```

### 6.3 Standard Error Codes
`VALIDATION_ERROR`, `UNAUTHORIZED`, `TOKEN_EXPIRED`, `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, `FORBIDDEN_RESOURCE`, `NOT_FOUND`, `NO_ACTIVE_CYCLE`, `NO_ENTRY_TODAY`, `CONFLICT`, `EMAIL_ALREADY_EXISTS`, `ACTIVE_CYCLE_EXISTS`, `ALREADY_SUBMITTED_TODAY`, `RATE_LIMIT_EXCEEDED`, `INTERNAL_SERVER_ERROR`.

---

## 7. Current Implementation & Verification Status

As of today, **Phases 0 through 7 are 100% complete and fully verified** against the MongoDB Atlas cluster:

| Phase | Subsystem | Status | Test Suite & Results |
|:---:|---|:---:|---|
| **0** | Project Scaffolding | **COMPLETE** | Monorepo structured, packages installed |
| **1** | Mongoose Models & Error Middleware | **COMPLETE** | `models.test.js`, `errorHandler.test.js`, `errors.test.js` (19 tests) |
| **2** | Auth & User Profile Subsystem | **COMPLETE** | `auth_user_flow.test.js` (14 tests) |
| **3** | Cycle Lifecycle Management | **COMPLETE** | `cycle_lifecycle.test.js` (11 tests) |
| **4** | 12-Item Checklist & Scoring Engine | **COMPLETE** | `scoring_and_checklist.test.js` (11 tests) |
| **5** | Midnight Missed-Day Cron Job | **COMPLETE** | `missed_day_backfill.test.js` (2 tests) |
| **6** | Weekly & 30-Day Aggregations | **COMPLETE** | `aggregation_and_reporting.test.js` (17 tests) |
| **7** | Web Push & Reminder Dispatcher | **COMPLETE** | `notifications_and_reminders.test.js` (7 tests) |
| **Total** | **Full Backend API Suite** | **PASSING** | **9 Suites, 81 Tests Passing (Ran with `--runInBand`)** |

---

## 8. Remaining Phases: Step-by-Step Roadmap (Phases 8–11)

When continuing or delegating frontend development, follow this exact sequence:

---

### Phase 8: Frontend Foundation, Axios Interceptors & Auth Shell

#### Goal
Build the Next.js 14 App Router layout, Tailwind styling, Axios client with automatic Bearer and timezone header injection, Auth Context, and Authentication pages.

#### Step-by-Step Tasks
1. **API Client (`frontend/lib/axios.js`):**
   - Create Axios instance with `baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'`.
   - Request Interceptor:
     - Read `token` from `localStorage`. If present, attach `Authorization: Bearer ${token}`.
     - Attach `x-timezone-offset: new Date().getTimezoneOffset()`.
   - Response Interceptor:
     - Catch 401 errors. If code is `TOKEN_EXPIRED` or `UNAUTHORIZED`, purge token from `localStorage` and redirect to `/login`.
2. **Auth Context (`frontend/context/AuthContext.jsx`):**
   - Provide `user`, `token`, `isAuthenticated`, `isLoading`.
   - Implement `login(email, password)`: POST to `/auth/login`, store token, update state.
   - Implement `register(formData)`: POST to `/auth/register`.
   - Implement `logout()`: Clear storage, reset state, navigate to `/login`.
   - Implement `useAuth()` custom hook.
3. **Route Protection (`frontend/components/layout/AuthGuard.jsx`):**
   - If not authenticated and not loading, redirect to `/login`.
4. **Auth Pages:**
   - `/login`: Clean card layout, validation for email & password, display error messages from API envelope.
   - `/register`: Name, Email, Password, University, Department fields.
   - `/forgot-password` & `/reset-password`: Token-based recovery form.
5. **Layouts:**
   - Clean top navigation bar (`Navbar.jsx`) with user name badge and logout button.

---

### Phase 9: Daily Dashboard, 12-Item Checklist UI & Live Scoring

#### Goal
Implement the student's daily check-in flow: Active Cycle overview, Day $1\dots30$ counter, streak flame counter, 12-item checklist form, same-day edit, and yesterday's grace window.

#### Step-by-Step Tasks
1. **Cycle State Hook (`frontend/hooks/useCycle.js`):**
   - Query `GET /api/v1/cycles/active`.
   - Expose `activeCycle`, `dayNumber`, `hasSubmittedToday`, `currentStreak`, `isLoading`, `refetch`.
   - If no active cycle exists, guide the user to `/cycle/setup`.
2. **Cycle Setup Page (`app/(app)/cycle/setup/page.jsx`):**
   - Form to select `startDate`, `targetWakeUpTime`, and `targetSleepTime`.
   - POST to `/api/v1/cycles` and navigate to `/dashboard`.
3. **Home Dashboard (`app/(app)/dashboard/page.jsx`):**
   - Day progress: "Day X of 30" with horizontal progress bar.
   - Streak flame badge: `🔥 X Day Streak`.
   - Action Card:
     - If not submitted today: prominent "Start Today's Check-in" button $\rightarrow$ `/checklist`.
     - If submitted today: "You're checked in! Today's Score: XX%" + "Edit Today's Entry" button.
   - Grace Banner:
     - If yesterday has no entry and current time is before midnight, display alert: *"You haven't logged yesterday! Complete it before midnight to save your streak."* $\rightarrow$ `/checklist/yesterday`.
4. **12-Item Checklist Form (`app/(app)/checklist/page.jsx`):**
   - Create clean, card-based inputs for all 12 items:
     - Item 1: Early Morning (Toggle switch).
     - Item 2: University Attendance (3-way radio: Yes / No / Off-Day).
     - Item 3: Class Participation (Attended classes / Total classes counter; auto-disabled on Off-Day).
     - Item 4: Personal Discipline (Toggle switch).
     - Item 5: Social Interactions (Number stepper $0 \dots 10+$).
     - Item 6: Daily Learning Note (Textarea with 500 character counter).
     - Item 7: Physical Activity (Toggle + minutes input if active).
     - Item 8: Skill Development (Minutes input).
     - Item 9: Class Work Recap (Toggle switch).
     - Item 10: Social Media Control (3-way radio: Controlled / Useful / Excessive).
     - Item 11: Self-Reflection Journal (Textarea with 500 character counter).
     - Item 12: Sleeping on Time (Toggle switch).
   - If `hasSubmittedToday` is true, pre-fill existing values and call `PUT /api/v1/checklist/today`.
   - If `hasSubmittedToday` is false, call `POST /api/v1/checklist`.
5. **Yesterday's Grace Form (`app/(app)/checklist/yesterday/page.jsx`):**
   - Identical form submitting to `PUT /api/v1/checklist/yesterday`.
6. **Daily Score Result Page (`app/(app)/daily-score/page.jsx`):**
   - Circular score gauge showing $0 \dots 100\%$.
   - Breakdown of points achieved per category.
   - Streak celebration banner.

---

### Phase 10: Visual Analytics, Weekly Trends & Monthly Radar View

#### Goal
Provide rich visual feedback using Recharts: 7-day weekly breakdown, $\Delta$ comparison from prior week, and the 30-day final report with the 10 Life Stages radar chart.

#### Step-by-Step Tasks
1. **Weekly Report View (`app/(app)/weekly/[week]/page.jsx`):**
   - Fetch data from `GET /api/v1/weekly/:weekNumber`.
   - Summary header: Weekly Average Score, Days Tracked (e.g. 6/7), Best Day, Lowest Day.
   - $\Delta$ Trend Badge: e.g. `▲ +4.5% vs Week 1` or `Baseline Week` for Week 1.
   - Recharts Bar Chart: 12 bars showing completion percentage for each life area.
   - Focus Tip Callout: Highlighted card displaying the algorithmically generated tip for the lowest area.
2. **30-Day Monthly Life Stage Report (`app/(app)/monthly/page.jsx`):**
   - Fetch data from `GET /api/v1/monthly/:cycleId`.
   - Overall Life Score gauge & Habit Consistency percentage.
   - **Life Stage Badge Card**: Prominently display the assigned Life Stage (1 to 10), official title, and detailed description.
   - **Recharts Radar Chart**: 12-axis spider/radar chart displaying the balance across all 12 life areas.
   - Top 3 Strengths & Bottom 3 Weaknesses callout cards.
   - 5-Period Progress Line Chart (Weeks 1–4 + Final Stretch).
   - Life Insight Reflection paragraph + 2–3 Actionable Improvement Tips.
   - Data Confidence Disclaimer: If `hasEnoughData === false`, display a warning that low consistency limits accuracy.
   - "Start Next Cycle" button to transition the cycle to completed.

---

### Phase 11: Production Deployment, Service Worker & Dockerization

#### Goal
End-to-end integration verification, Web Push service worker registration in browser, Docker containerization, and deployment readiness.

#### Step-by-Step Tasks
1. **Frontend Service Worker (`frontend/public/sw.js`):**
   - Implement `push` event listener to show native notifications with icon, title, and body.
   - Implement `notificationclick` listener opening `/dashboard`.
2. **Push Subscription Manager (`frontend/components/notifications/PushToggle.jsx`):**
   - Button allowing user to enable browser notifications.
   - Convert VAPID public key to `Uint8Array`.
   - Call `registration.pushManager.subscribe()`.
   - POST subscription to `/api/v1/notifications/subscribe`.
3. **Dockerization:**
   - `backend/Dockerfile`: Multi-stage Node.js 20 Alpine.
   - `frontend/Dockerfile`: Next.js standalone build.
   - `docker-compose.yml`: Services for `backend`, `frontend`, and optional local `mongo`.
4. **Environment Templates:**
   - Verify `backend/.env.example` and `frontend/.env.example` have every required key documented.

---

## 9. Technical Quirks, Traps & Troubleshooting Guide

| Issue / Trap | Root Cause | Solution |
|---|---|---|
| **Jest tests collide or timeout** | Running tests concurrently against MongoDB Atlas | Always run Jest with `--runInBand` in `backend/package.json`. |
| **Checklist partial update slashes score** | PUT /today only sends updated fields; rest become undefined | Merge `existingEntry.toObject()` with `req.body` before calculating score. |
| **Off-day scoring exceeds 100%** | Dividing by 100 instead of 82 when items 2 & 3 are omitted | Check `item2 === 'off_day'`. If true, set `maxAvailablePoints = 82`. |
| **Same-day edit increments streak** | Re-running insertion logic on update | In `checklist.service.js`, streak increment is ONLY executed on `INSERT`, never on `UPDATE`. |
| **Next.js Windows build fails with PostCSS error** | Turbopack compatibility issue on Windows Node 24 | Build with `next build --webpack` in `frontend/package.json`. |
| **Next.js Google Font fetch timeout** | Sandboxed environment blocking external font CDN | Use standard Tailwind sans font stack in `layout.js` without `@next/font/google`. |
| **Web Push 410 Gone error** | Student uninstalled browser or revoked push permission | When `webpush.sendNotification` returns status 410 or 404, automatically delete the subscription from DB. |

---

## 10. Pre-Commit / Pre-Completion Verification Checklist

Before any AI marks a phase or feature complete, verify every single item below:

- [ ] **Pure Scoring Matrix:** Tested normal days (max 100) and off-days (max 82). Results match Table 4.1 exactly.
- [ ] **Streak Non-Duplication:** Calling `PUT /api/v1/checklist/today` updates the score but leaves `currentStreak` unchanged.
- [ ] **Duplicate Submission Guard:** Submitting `POST /api/v1/checklist` twice for the same date returns `409 ALREADY_SUBMITTED_TODAY`.
- [ ] **Single Active Cycle Constraint:** Attempting to start a cycle while one is active returns `409 ACTIVE_CYCLE_EXISTS`.
- [ ] **Timezone Normalization:** Date-sensitive operations use `x-timezone-offset` to compute the student's local midnight.
- [ ] **Cascaded Deletion:** `DELETE /api/v1/users/me` removes records across all 7 collections without orphan data.
- [ ] **Unified Error Format:** All error responses strictly match `{ success: false, error: { code, message, field, timestamp, path } }`.
- [ ] **Strict Data Scoping:** Every Mongoose query filters by `{ userId: req.user.userId }`.
- [ ] **Backend Test Suite:** `cd backend && npm test` runs 9 suites and 81 tests with 100% pass rate.
- [ ] **Frontend Build:** `cd frontend && npm run build` compiles with zero errors.

---

*This document serves as the permanent, authoritative AI system instruction for the Student Life Progress & Self-Improvement Tracker repository. Follow it meticulously.*
