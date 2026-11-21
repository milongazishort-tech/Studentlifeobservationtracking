# Development Master Blueprint & Step-by-Step Implementation Prompts
## Student Life Progress & Self-Improvement Tracker

---

| Field | Detail |
|---|---|
| **Document Purpose** | Comprehensive, Executable Engineering Roadmap & Agent Prompts |
| **System Version** | Full-Stack Web App (Next.js 14+ App Router, Express.js, MongoDB 7+, Web Push) |
| **Aligned Documents** | `PRD.md` (v2.0), `arcthitecture.md` (v2.0), `database.md` (v2.1), `databse-schema.md`, `api-spec.md` (v1.1.0) |
| **Target Audience** | Software Engineers, AI Coding Agents, Project Leads |
| **Methodology** | Phased, Test-Driven Development (TDD), Strict Layer Isolation |

---

## Table of Contents
1. [Engineering Philosophy & Execution Rules](#1-engineering-philosophy--execution-rules)
2. [Project Phasing & Roadmap Overview](#2-project-phasing--roadmap-overview)
3. [Phase 0: Project Scaffolding & Environment Initialization](#phase-0-project-scaffolding--environment-initialization)
4. [Phase 1: Backend Foundation — DB, Schemas, & Global Error Handling](#phase-1-backend-foundation--db-schemas--global-error-handling)
5. [Phase 2: Authentication & User Profile Subsystem](#phase-2-authentication--user-profile-subsystem)
6. [Phase 3: Cycle Lifecycle Management Subsystem](#phase-3-cycle-lifecycle-management-subsystem)
7. [Phase 4: Core Domain Engine — 12-Item Checklist & Deterministic Scoring](#phase-4-core-domain-engine--12-item-checklist--deterministic-scoring)
8. [Phase 5: Background Cron Automation & Streak Resilience](#phase-5-background-cron-automation--streak-resilience)
9. [Phase 6: Aggregation & Analytics Subsystem (Weekly & 30-Day Life Stage)](#phase-6-aggregation--analytics-subsystem-weekly--30-day-life-stage)
10. [Phase 7: Notification Subsystem (Web Push & Transactional Email)](#phase-7-notification-subsystem-web-push--transactional-email)
11. [Phase 8: Frontend App Router Foundation & Auth Shell](#phase-8-frontend-app-router-foundation--auth-shell)
12. [Phase 9: Frontend Core Features — Daily Checklist, Dashboard, & Live Scores](#phase-9-frontend-core-features--daily-checklist-dashboard--live-scores)
13. [Phase 10: Frontend Visual Analytics — Weekly Breakdown & Monthly Radar](#phase-10-frontend-visual-analytics--weekly-breakdown--monthly-radar)
14. [Phase 11: End-to-End Integration, Security Audit, & Production Deployment](#phase-11-end-to-end-integration-security-audit--production-deployment)

---

## 1. Engineering Philosophy & Execution Rules

When implementing each step or passing a prompt to an AI coding agent, adhere strictly to these rules:

1. **Strict Downward Layering**: The Presentation Layer never calls Database Models directly. Routes $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Models.
2. **Pure Business Logic Isolation**: All calculations in `ScoringEngine`, `ItemScorers`, `LifeStageClassifier`, and `InsightRuleEngine` MUST be pure, stateless functions with zero database dependencies. This ensures 100% unit test coverage.
3. **Database Consistency**: Use camelCase collection names (`dailyActivities`, `dailyScores`, etc.). Never bypass multi-document transactions when modifying related records (e.g., submitting an activity + generating a score + updating a streak).
4. **Timezone Normalization**: The backend must parse and apply `x-timezone-offset` on every date-sensitive endpoint so student local midnights align with stored records.
5. **No Spec Deviation**: The 12-item point weights (total: 100 / off-day: 82), Life Stage boundaries (10 stages), and streak rules are frozen in `PRD.md` and `api-spec.md`. Do not invent new rules.

---

## 2. Project Phasing & Roadmap Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT ROADMAP                             │
├─────────────────┬──────────────────────────────────────────────────────┤
│ Phase 0         │ Project Scaffolding & Environment Initialization     │
│ Phase 1         │ Database Connection, Mongoose Schemas & Error System │
│ Phase 2         │ Auth Service (JWT, bcrypt, Email Verification)       │
│ Phase 3         │ 30-Day Cycle Lifecycle & State Machine               │
│ Phase 4         │ 12-Item Checklist Ingestion & Pure Scoring Engine    │
│ Phase 5         │ Midnight Missed-Day Cron & Streak Resilience         │
│ Phase 6         │ Weekly & Monthly Aggregation Pipelines               │
│ Phase 7         │ Web Push (VAPID) & Email Notification Engine         │
│ Phase 8         │ Next.js App Router Shell, Tailwind & Auth Context    │
│ Phase 9         │ Daily Checklist UI, Grace Window & Dashboard         │
│ Phase 10        │ Weekly Analytics & 30-Day Life Stage UI (Recharts)   │
│ Phase 11        │ E2E Testing, Security Hardening & Deployment         │
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## Phase 0: Project Scaffolding & Environment Initialization

### Goal
Set up a clean monorepo or dual-directory structure (`frontend/` and `backend/`), initialize Git, configure environment templates, and install dependencies.

### Step-by-Step Implementation Instructions
1. Initialize backend directory with Node.js 20 LTS: `npm init -y`.
2. Install backend dependencies:
   - Production: `express`, `mongoose`, `dotenv`, `cors`, `helmet`, `express-rate-limit`, `express-validator`, `bcryptjs`, `jsonwebtoken`, `nodemailer`, `node-cron`, `web-push`.
   - Development: `nodemon`, `jest`, `supertest`.
3. Initialize frontend directory with Next.js 14+ (App Router): `npx create-next-app@latest frontend --js --tailwind --eslint --app --src-dir=false`.
4. Install frontend dependencies: `axios`, `recharts`, `lucide-react`, `date-fns`.
5. Establish root `.gitignore` and `.env.example` templates.

---

### 📋 COPY-PASTE PROMPT: PHASE 0
```markdown
You are an expert full-stack engineer. Set up the foundational scaffolding for the Student Life Progress & Self-Improvement Tracker project.

Tasks:
1. Create a root project structure containing two distinct directories: `backend/` and `frontend/`.
2. In `backend/`:
   - Initialize package.json with ES modules or CommonJS (matching Express standard).
   - Configure npm scripts: "start": "node server.js", "dev": "nodemon server.js", "test": "jest".
   - Install production dependencies: express, mongoose, dotenv, cors, helmet, express-rate-limit, express-validator, bcryptjs, jsonwebtoken, nodemailer, node-cron, web-push.
   - Install dev dependencies: nodemon, jest, supertest.
   - Create `.env.example` documenting PORT, MONGO_URI, JWT_SECRET, FRONTEND_URL, SMTP_*, and VAPID_* keys.
3. In `frontend/`:
   - Set up Next.js 14+ using App Router, Tailwind CSS, and Lucide icons.
   - Install axios, recharts, and date-fns.
   - Create `.env.local.example` with NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1.
4. Verify that both applications can start without errors.
```

---

## Phase 1: Backend Foundation — DB, Schemas, & Global Error Handling

### Goal
Establish the MongoDB connection via Mongoose, implement the 7 schemas exactly as specified in `databse-schema.md` with camelCase collections, and build the centralized AppError/middleware hierarchy.

### Step-by-Step Implementation Instructions
1. Create `backend/config/db.js` using Mongoose 8.0+ with connection retry and error event handlers.
2. Build custom error classes in `backend/utils/errors.js`: `AppError`, `ValidationError`, `ConflictError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`.
3. Implement `backend/middleware/errorHandler.middleware.js` matching Section 4.4 of `api-spec.md` (handling Mongoose Validation, MongoDB E11000, JWT errors).
4. Implement all 7 Mongoose schemas in `backend/models/`:
   - `User.model.js` (`collection: 'users'`)
   - `Cycle.model.js` (`collection: 'cycles'`) — with partial unique index `{ userId: 1, status: 1 }` for `status: 'active'`.
   - `DailyActivity.model.js` (`collection: 'dailyActivities'`) — unique compound index `{ userId: 1, date: 1 }`.
   - `DailyScore.model.js` (`collection: 'dailyScores'`) — unique compound index `{ userId: 1, date: 1 }`.
   - `WeeklySummary.model.js` (`collection: 'weeklySummaries'`) — unique index `{ userId: 1, cycleId: 1, weekNumber: 1 }`.
   - `MonthlyResult.model.js` (`collection: 'monthlyResults'`) — unique index `{ userId: 1, cycleId: 1 }`.
   - `PushSubscription.model.js` (`collection: 'pushSubscriptions'`) — unique index `{ userId: 1, endpoint: 1 }`.
5. Write unit tests verifying that duplicate keys are rejected with code 409.

---

### 📋 COPY-PASTE PROMPT: PHASE 1
```markdown
You are a senior backend architect. Implement the database connection, Mongoose models, and global error handling for the Student Life Tracker backend according to `database.md`, `databse-schema.md`, and `api-spec.md`.

Requirements:
1. `backend/config/db.js`: Create a robust Mongoose connection module reading MONGO_URI from env.
2. `backend/utils/errors.js`: Implement `AppError` and specialized sub-classes: `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409).
3. `backend/middleware/errorHandler.middleware.js`:
   - Must trap Mongoose ValidationErrors and extract the offending field.
   - Must trap MongoDB 11000 duplicate key errors and output `EMAIL_ALREADY_EXISTS` or `ALREADY_SUBMITTED_TODAY`.
   - Must trap JsonWebTokenError and TokenExpiredError.
   - Output JSON matching the spec: `{ success: false, error: { code, message, field, timestamp, path } }`.
4. `backend/models/`:
   - Implement all 7 models: User, Cycle, DailyActivity, DailyScore, WeeklySummary, MonthlyResult, PushSubscription.
   - Explicitly specify collection names: 'users', 'cycles', 'dailyActivities', 'dailyScores', 'weeklySummaries', 'monthlyResults', 'pushSubscriptions'.
   - Add the partial unique index on Cycle for `{ userId: 1, status: 1 }` where status === 'active'.
   - Add all unique compound indexes specified in `database.md` Section 4.
5. Create a simple test script to ensure DB connects and indexes are built properly.
```

---

## Phase 2: Authentication & User Profile Subsystem

### Goal
Implement registration, password hashing (bcrypt), login with JWT issuance, email verification, password recovery, profile editing, and cascaded account deletion.

### Step-by-Step Implementation Instructions
1. Implement input validators in `backend/validators/auth.validators.js` (email syntax, password strength: $\ge 8$ chars, name, university, department).
2. Build `backend/services/auth.service.js`:
   - `register`: Hash password with bcrypt (12 rounds), create user with `emailVerified: false`, send verification token via Nodemailer.
   - `verifyEmail`: Validate token and flip `emailVerified = true`.
   - `login`: Verify credentials, ensure `emailVerified === true`, issue 7-day JWT.
   - `forgotPassword` & `resetPassword`: Generate crypto token with 1-hour expiry.
3. Build `backend/services/user.service.js`:
   - `getProfile`: Return sanitized user details (excluding `passwordHash`).
   - `updateProfile`: Allow updating name, university, department, targetWakeUpTime, targetSleepTime, reminder settings. Validate `HH:mm` format.
   - `deleteAccount`: Execute the multi-collection transaction defined in `database.md` Section 7.3 to delete records across all 7 collections.
4. Implement `backend/middleware/auth.middleware.js` to extract Bearer token, verify JWT, and attach `req.user = { userId, email }`.
5. Connect routes: `/api/v1/auth/*` and `/api/v1/users/*` as per `api-spec.md`.
6. Write integration tests for register $\rightarrow$ verify $\rightarrow$ login $\rightarrow$ update $\rightarrow$ delete flow.

---

### 📋 COPY-PASTE PROMPT: PHASE 2
```markdown
Implement the complete Authentication and User Profile API subsystem following `api-spec.md` (Sections 5.1 & 5.2) and `database.md` (Section 7.3).

Tasks:
1. Validators (`backend/validators/auth.validators.js`):
   - Validate registration payload (name: 2-100 chars, email format, password: min 8 chars with letters/numbers/special chars, university, department).
   - Validate profile update payload (times must match regex ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$).
2. Auth Middleware (`backend/middleware/auth.middleware.js`):
   - Verify Bearer token from Authorization header using JWT_SECRET.
   - Attach decoded payload `{ userId, email }` to `req.user`.
   - Handle expired and malformed tokens with standard 401 JSON envelopes.
3. Controllers & Services:
   - `POST /api/v1/auth/register`: Create user, dispatch verification email.
   - `GET /api/v1/auth/verify-email/:token`: Activate account.
   - `POST /api/v1/auth/login`: Return JWT and profile object.
   - `POST /api/v1/auth/forgot-password` & `POST /api/v1/auth/reset-password/:token`.
   - `GET /api/v1/users/me` & `PUT /api/v1/users/me`.
   - `DELETE /api/v1/users/me`: Implement the multi-document ACID transaction cascading deletion across all collections (Users, Cycles, DailyActivities, DailyScores, WeeklySummaries, MonthlyResults, PushSubscriptions).
4. Register routes in Express app with rate-limiting applied to auth endpoints (10 req/15 min).
```

---

## Phase 3: Cycle Lifecycle Management Subsystem

### Goal
Implement the 30-day tracking cycle state machine: starting cycles, enforcing single active cycle constraints, calculating current day numbers ($1 \dots 30$), and cycle abandonment.

### Step-by-Step Implementation Instructions
1. Implement `backend/validators/cycle.validators.js`:
   - `startDate` cannot be in the future.
   - Target wake-up and sleep times must be valid `HH:mm`.
2. Implement `backend/services/cycle.service.js`:
   - `startCycle`: Verify no cycle with `status: 'active'` exists for user. Freeze target times into the cycle record. Calculate `endDate = startDate + 29 days`. Set `cycleNumber = lastCycleNumber + 1`.
   - `getActiveCycle`: Retrieve active cycle. Calculate `dayNumber = differenceInDays(today, startDate) + 1`. If `dayNumber > 30`, mark as `completed`. Query whether an entry was submitted today.
   - `getCycleHistory`: Fetch all cycles sorted by `cycleNumber: -1`.
   - `abandonCycle`: Update status to `'abandoned'`.
3. Connect routes: `/api/v1/cycles/*` per `api-spec.md` Section 5.3.
4. Write tests verifying that starting a second active cycle returns `409 Conflict` (`ACTIVE_CYCLE_EXISTS`).

---

### 📋 COPY-PASTE PROMPT: PHASE 3
```markdown
Implement the 30-Day Cycle Lifecycle Subsystem in Express.js matching `api-spec.md` (Section 5.3) and `database.md`.

Tasks:
1. Service (`backend/services/cycle.service.js`):
   - `startCycle(userId, { startDate, targetWakeUpTime, targetSleepTime }, timezoneOffset)`:
     - Check if an active cycle exists. If yes, throw ConflictError('ACTIVE_CYCLE_EXISTS').
     - Compute endDate as startDate + 29 days (normalized to student local midnight).
     - Determine cycleNumber by counting existing cycles + 1.
     - Persist new Cycle document with status='active' and currentStreak=0.
   - `getActiveCycle(userId, timezoneOffset)`:
     - Find active cycle. If none, throw NotFoundError('NO_ACTIVE_CYCLE').
     - Compute current `dayNumber` based on calendar difference from startDate.
     - Check if today's dailyActivities record already exists (`hasSubmittedToday`).
     - Return cycle details, dayNumber, and streak.
   - `getCycleHistory(userId)`: Return all completed and abandoned cycles.
   - `abandonCycle(userId, cycleId)`: Set status to 'abandoned'.
2. Controller & Router (`backend/controllers/cycle.controller.js`, `backend/routes/cycle.routes.js`):
   - Endpoints: `POST /api/v1/cycles`, `GET /api/v1/cycles/active`, `GET /api/v1/cycles`, `PATCH /api/v1/cycles/:id/abandon`.
   - Protect all routes with `authMiddleware`.
3. Unit tests verifying dayNumber calculations and active cycle collision prevention.
```

---

## Phase 4: Core Domain Engine — 12-Item Checklist & Deterministic Scoring

### Goal
Implement the heart of the application: pure scoring logic for all 12 items, off-day denominator adjustments, same-day editing (`PUT /today`), grace period lookbacks (`PUT /yesterday`), and atomic streak management.

### Step-by-Step Implementation Instructions
1. Implement `backend/services/scoring/ItemScorers.js` as pure functions:
   - Item 1: Early morning $\rightarrow$ Boolean ($8$ / $0$ pts).
   - Item 2: University attendance $\rightarrow$ `'yes'` ($10$ pts), `'no'` ($0$ pts), `'off_day'` (excluded).
   - Item 3: Class participation $\rightarrow$ Fraction $(a/b) \times 8$ pts. Clamped $0 \le a \le b$, $b \ge 1$. $0$ pts on off-day.
   - Item 4: Personal discipline $\rightarrow$ Boolean ($8$ / $0$ pts).
   - Item 5: Social interactions $\rightarrow \ge 3 \rightarrow 6$ pts, $2 \rightarrow 4$ pts, $1 \rightarrow 2$ pts, $0 \rightarrow 0$ pts.
   - Item 6: Daily learning $\rightarrow$ Non-empty text $\rightarrow 10$ pts, empty $\rightarrow 0$ pts.
   - Item 7: Physical activity $\rightarrow$ Active with $\ge 15$ mins $\rightarrow 10$ pts; active with $< 15$ mins $\rightarrow 5$ pts; inactive $\rightarrow 0$ pts.
   - Item 8: Skill development $\rightarrow \ge 60$ mins $\rightarrow 10$ pts; $30\dots59$ mins $\rightarrow 6$ pts; $15\dots29$ mins $\rightarrow 3$ pts; $< 15$ mins $\rightarrow 0$ pts.
   - Item 9: Class work recap $\rightarrow$ Boolean ($10$ / $0$ pts).
   - Item 10: Social media control $\rightarrow$ `'controlled'` ($6$ pts), `'useful'` ($3$ pts), `'excessive'` ($0$ pts).
   - Item 11: Self-reflection $\rightarrow$ Non-empty text $\rightarrow 8$ pts, empty $\rightarrow 0$ pts.
   - Item 12: Sleeping on time $\rightarrow$ Boolean ($6$ / $0$ pts).
2. Implement `backend/services/scoring/ScoringEngine.js`:
   - Calculate total achieved points.
   - Set max available points: $100$ normal day; $82$ on off-days (items 2 & 3 excluded).
   - Clamped percentage: $\min(100, \max(0, (\text{achieved} / \text{max}) \times 100))$.
3. Implement `backend/services/checklist.service.js`:
   - `submitToday`: Reject if record exists for `{ userId, today }`. Execute `saveDailyChecklistTransaction` (insert activity + insert score + increment streak by 1).
   - `editToday`: Find today's record. Recompute score. Update both documents without incrementing streak.
   - `editYesterday`: Verify entry date equals yesterday. Recompute and update.
4. Connect routes: `POST /api/v1/checklist`, `PUT /api/v1/checklist/today`, `PUT /api/v1/checklist/yesterday`, `GET /api/v1/checklist/today`.
5. Write unit tests for all 12 scorers and off-day denominator variations.

---

### 📋 COPY-PASTE PROMPT: PHASE 4
```markdown
Implement the Core 12-Item Checklist and Scoring Engine matching `PRD.md` Section 3.3, `database.md` Section 7.1, and `api-spec.md` Section 5.4.

Tasks:
1. Pure Scoring Engine (`backend/services/scoring/`):
   - `ItemScorers.js`: Pure functions implementing exact point rules for all 12 items.
   - `ScoringEngine.js`: 
     - Sum all item points.
     - Adjust max points for off-days (Items 2 and 3 omitted: max = 82, otherwise 100).
     - Guard against divide-by-zero.
     - Return `{ totalScore, achievedPoints, maxAvailablePoints, scores: { item1...item12 } }`.
2. Checklist Service (`backend/services/checklist.service.js`):
   - Implement `saveDailyChecklistTransaction` as defined in `database.md` Section 7.1:
     - In INSERT mode: write to DailyActivity, write to DailyScore, and increment cycle `currentStreak` by 1.
     - In UPDATE mode (`PUT /today` and `PUT /yesterday`): update existing DailyActivity, update DailyScore, and DO NOT increment streak.
   - Prevent duplicate submissions on `POST /api/v1/checklist` using error code `ALREADY_SUBMITTED_TODAY`.
   - Validate grace window for `PUT /api/v1/checklist/yesterday` (must be within previous calendar day).
3. Endpoints:
   - `POST /api/v1/checklist`
   - `PUT /api/v1/checklist/today`
   - `PUT /api/v1/checklist/yesterday`
   - `GET /api/v1/checklist/today`
   - `GET /api/v1/scores/today`
4. Provide comprehensive Jest unit tests covering standard scoring, off-day scoring (82 max), and streak non-duplication during edits.
```

---

## Phase 5: Background Cron Automation & Streak Resilience

### Goal
Implement automated background jobs using `node-cron` to detect skipped dates, backfill missing days with 0% scores, and reset broken streaks.

### Step-by-Step Implementation Instructions
1. Implement `backend/services/cron/missedDayBackfill.job.js`:
   - Schedule at midnight (`0 0 * * *`).
   - Query all cycles where `status === 'active'`.
   - For each active cycle, check if a `dailyActivities` record exists for the date that just ended (accounting for timezone offsets).
   - If missing:
     - Execute `midnightMissedDayBackfillTransaction` (`database.md` Section 7.2).
     - Insert a dummy activity with `isMissedDay: true`.
     - Insert a `dailyScores` record with `totalScore: 0` and all item points set to $0$.
     - Reset cycle `currentStreak = 0`.
2. Add manual trigger endpoint for administrative or testing purposes: `POST /api/v1/admin/cron/trigger-backfill` (protected).
3. Write automated tests asserting that a skipped day results in a 0% score document and resets streak to 0.

---

### 📋 COPY-PASTE PROMPT: PHASE 5
```markdown
Implement the Midnight Missed-Day Backfill Automation and Streak Reset Job in Express.js as specified in `arcthitecture.md` Section 9, `database.md` Section 7.2, and `dfd.md` (Process 5.1 & 5.2).

Tasks:
1. Create `backend/services/cron/missedDayBackfill.job.js`:
   - Use `node-cron` running at `0 0 * * *`.
   - Iterate over all active cycles.
   - Identify if the student missed logging yesterday's checklist (past grace window).
   - If missing, execute `midnightMissedDayBackfillTransaction`:
     - Create DailyActivity with `isMissedDay: true`.
     - Create DailyScore with `totalScore: 0`, `achievedPoints: 0`, `maxAvailablePoints: 100`.
     - Update the Cycle record: set `currentStreak: 0`.
2. Register and start cron scheduler in `backend/server.js`.
3. Provide unit/integration test simulating a missing calendar date to confirm 0% insertion and streak zeroing.
```

---

## Phase 6: Aggregation & Analytics Subsystem (Weekly & 30-Day Life Stage)

### Goal
Implement MongoDB aggregation pipelines for 7-day weekly reports ($\Delta$ changes, area breakdown, focus tips) and the final 30-day Life Stage classification and rule-based insights.

### Step-by-Step Implementation Instructions
1. Implement `backend/services/aggregation/WeeklyAggregator.js`:
   - Partition days: Week 1 (Days 1–7), Week 2 (Days 8–14), Week 3 (Days 15–21), Week 4 (Days 22–28), Final Stretch (Days 29–30).
   - Run the aggregation pipeline defined in `database.md` Section 6.1.
   - Compute `deltaFromPreviousWeek` (set to `null` for Week 1).
   - Generate focus tip targeting the lowest-performing life area.
   - Cache results in `weeklySummaries` collection (`isGenerated: true`).
2. Implement `backend/services/classification/LifeStageClassifier.js`:
   - Map `lifeScore` to the 10 stages:
     - Stage 1: $0.00 \dots 19.99\%$ (Critical / Highly Unbalanced)
     - Stage 2: $20.00 \dots 29.99\%$ (Struggling / Low Discipline)
     - Stage 3: $30.00 \dots 39.99\%$ (Inconsistent Routine)
     - Stage 4: $40.00 \dots 49.99\%$ (Emerging Awareness)
     - Stage 5: $50.00 \dots 59.99\%$ (Moderate Balance)
     - Stage 6: $60.00 \dots 69.99\%$ (Steady Progress)
     - Stage 7: $70.00 \dots 79.99\%$ (Disciplined Student)
     - Stage 8: $80.00 \dots 89.99\%$ (High Achiever)
     - Stage 9: $90.00 \dots 94.99\%$ (Exemplary Lifestyle)
     - Stage 10: $95.00 \dots 100.00\%$ (Exceptional Self-Development)
3. Implement `backend/services/classification/InsightRuleEngine.js`:
   - Evaluate completion rates across categories (academic, physical, skill, personal, social).
   - Select matched insight paragraph template.
   - If `habitConsistency < 50%`, set `hasEnoughData = false` and attach limited-data disclaimer.
   - Compile 2–3 actionable improvement suggestions.
4. Implement `backend/services/aggregation/MonthlyAggregator.js`:
   - Run strengths/weaknesses ranking pipeline (`database.md` Section 6.2).
   - Cache in `monthlyResults` collection.
5. Connect routes: `GET /api/v1/weekly/:weekNumber` and `GET /api/v1/monthly/:cycleId`.

---

### 📋 COPY-PASTE PROMPT: PHASE 6
```markdown
Implement the Weekly Summaries and 30-Day Monthly Life Stage Aggregation Subsystem according to `PRD.md` (Sections 3.5 & 3.6), `database.md` (Section 6), and `api-spec.md` (Sections 5.6 & 5.7).

Tasks:
1. Weekly Aggregator (`backend/services/aggregation/WeeklyAggregator.js`):
   - Group days by week (1-4: 7 days, 5: 2 days).
   - Run pipeline computing weeklyAverageScore, daysTracked, bestDay, lowestDay, and areaBreakdown.
   - Compute deltaFromPreviousWeek (null for Week 1).
   - Pick focus tip targeting the lowest scoring area.
   - Cache in `weeklySummaries`.
2. Life Stage Classifier (`backend/services/classification/LifeStageClassifier.js`):
   - Implement the exact 10 Life Stage boundaries ($0-19.99\%$ up to $95-100\%$).
3. Insight Rule Engine (`backend/services/classification/InsightRuleEngine.js`):
   - Evaluate area rates. Match insight templates.
   - Flag `hasEnoughData: false` if consistency < 50%.
   - Produce 2-3 actionable improvement tips.
4. Monthly Aggregator (`backend/services/aggregation/MonthlyAggregator.js`):
   - Run pipeline sorting top 3 strengths and bottom 3 weaknesses.
   - Build 5-week progress trend array.
   - Cache final report in `monthlyResults`.
5. Connect endpoints: `GET /api/v1/weekly/:weekNumber` and `GET /api/v1/monthly/:cycleId`.
6. Include Jest tests for boundary classifications and aggregation pipeline results.
```

---

## Phase 7: Notification Subsystem (Web Push & Transactional Email)

### Goal
Implement browser Web Push notifications via VAPID keys and transactional emails for reminders and milestone alerts.

### Step-by-Step Implementation Instructions
1. Configure `web-push` with VAPID keys: `webpush.setVapidDetails(mailto, publicKey, privateKey)`.
2. Implement endpoints:
   - `POST /api/v1/notifications/subscribe`: Upsert subscription keys into `pushSubscriptions` collection.
   - `DELETE /api/v1/notifications/unsubscribe`: Remove endpoint.
3. Build `backend/services/notification/ReminderScheduler.js`:
   - Cron runs every minute (`* * * * *`).
   - Query users where `reminderEnabled === true` and current time matches `reminderTime` (adjusted for client timezone).
   - Verify student has NOT submitted today's checklist.
   - Dispatch Web Push notification: `{"title": "Check-in Reminder", "body": "Log your 12 life areas before midnight!"}`.
4. Build `backend/services/notification/EmailSender.js`:
   - Send streak milestone emails when streak reaches $7, 14, 21,$ or $30$ days.

---

### 📋 COPY-PASTE PROMPT: PHASE 7
```markdown
Implement the Web Push (VAPID) and Notification Engine matching `arcthitecture.md` Section 10 and `api-spec.md` Section 5.8.

Tasks:
1. Web Push Configuration (`backend/services/notification/webPush.js`):
   - Initialize `web-push` using VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT from env.
2. Subscription Endpoints (`backend/controllers/notification.controller.js`):
   - `POST /api/v1/notifications/subscribe`: Save or update PushSubscription document.
   - `DELETE /api/v1/notifications/unsubscribe`: Delete subscription by endpoint.
3. Automated Reminder Dispatcher (`backend/services/cron/reminderDispatcher.job.js`):
   - Run every minute via `node-cron`.
   - Query users whose reminderTime matches current local time.
   - Check if today's dailyActivities record already exists. Skip if already submitted.
   - Dispatch web push payload to all user endpoints.
4. Milestone Email Alerts (`backend/services/notification/EmailSender.js`):
   - Hook into checklist submission. If streak matches 7, 14, 21, or 30, send congratulatory email via Nodemailer.
```

---

## Phase 8: Frontend App Router Foundation & Auth Shell

### Goal
Build the Next.js 14+ client shell: responsive layout, Tailwind styling, Axios API interceptor (with timezone header injection), Auth Context, and protected route guards.

### Step-by-Step Implementation Instructions
1. Set up Axios instance in `frontend/lib/axios.js`:
   - Base URL: `process.env.NEXT_PUBLIC_API_URL`.
   - Request interceptor: Attach `Authorization: Bearer <token>` and `x-timezone-offset: new Date().getTimezoneOffset()`.
   - Response interceptor: Redirect to `/login` on 401 `TOKEN_EXPIRED`.
2. Build `frontend/context/AuthContext.jsx`:
   - Manage `user`, `token`, `isAuthenticated`, `isLoading`.
   - Implement `login`, `register`, `logout` handlers with `localStorage` persistence.
3. Build layout components: `Navbar.jsx`, `Sidebar.jsx`, `AuthGuard.jsx`.
4. Implement authentication pages:
   - `/login` (Email, password, error toast).
   - `/register` (Name, email, password, university, department).
   - `/forgot-password` and `/reset-password/[token]`.

---

### 📋 COPY-PASTE PROMPT: PHASE 8
```markdown
Build the Frontend Scaffolding, Authentication Shell, and Axios Client in Next.js 14+ App Router.

Tasks:
1. API Client (`frontend/lib/axios.js`):
   - Configure Axios with base URL from NEXT_PUBLIC_API_URL.
   - Intercept requests: inject Bearer token from localStorage and automatically compute/inject `x-timezone-offset` header.
   - Intercept responses: handle 401 errors by clearing session and redirecting to /login.
2. Authentication Context (`frontend/context/AuthContext.jsx`):
   - Expose user, token, login(), register(), logout().
3. Route Protection (`frontend/components/layout/AuthGuard.jsx`):
   - Wrap protected App routes; redirect unauthenticated users to /login.
4. UI Pages:
   - `app/(auth)/login/page.jsx`: Login form with validation and error alerts.
   - `app/(auth)/register/page.jsx`: Registration form with university/department fields.
   - `app/(auth)/forgot-password/page.jsx`: Password reset request screen.
5. Create modern, responsive design using Tailwind CSS with clean mobile-first views.
```

---

## Phase 9: Frontend Core Features — Daily Checklist, Dashboard, & Live Scores

### Goal
Implement the core daily loop: Home Dashboard with Day counter and streaks, 12-item Checklist Form, Same-Day Edit, Yesterday's Grace Window, and Daily Score Results.

### Step-by-Step Implementation Instructions
1. Implement `frontend/hooks/useCycle.js`:
   - Fetch active cycle. If none, prompt to `/cycle/setup`.
2. Implement Cycle Setup page: `app/(app)/cycle/setup/page.jsx`.
3. Implement Dashboard: `app/(app)/dashboard/page.jsx`:
   - Display Day counter ("Day X of 30"), current streak badge, score status ("Submitted" vs. "Pending").
   - Action buttons: "Start Check-in" or "Edit Today's Entry".
   - Grace banner: "You missed yesterday — fill it in before midnight" (linking to `/checklist/yesterday`).
4. Implement Checklist Form: `app/(app)/checklist/page.jsx`:
   - Render all 12 input components (`YesNoItem`, `FractionItem` with class counters, `NumberItem`, `SelectItem`, `TextItem`).
   - Support both new submission (`POST`) and update mode (`PUT /today`).
5. Implement Daily Result view: `app/(app)/daily-score/page.jsx`:
   - Display circular progress score gauge ($0 \dots 100\%$).
   - List completed vs. missed items and updated streak count.

---

### 📋 COPY-PASTE PROMPT: PHASE 9
```markdown
Implement the Core Daily Tracking & Dashboard UI in Next.js 14+ following `PRD.md` Sections 3.3 & 3.4 and `api-spec.md` Section 5.4.

Tasks:
1. Dashboard (`app/(app)/dashboard/page.jsx`):
   - Fetch active cycle via `GET /api/v1/cycles/active`.
   - Display Day X of 30 progress bar, consecutive streak flame badge, and check-in status card.
   - Conditionally render "Start Today's Check-in" or "Edit Today's Check-in" based on `hasSubmittedToday`.
   - If yesterday is unrecorded, render a prominent grace-period alert linking to `/checklist/yesterday`.
2. Checklist Form (`app/(app)/checklist/page.jsx`):
   - Build form inputs for all 12 areas (Early Morning, University Attendance toggle with Off-Day option, Class Participation attended/total fractions, Social Interactions counter, Daily Learning textarea, Physical Activity with minutes toggle, Skill Development minutes, Class Work Recap, Social Media 3-way radio, Self-Reflection journal, Sleeping on Time).
   - If already submitted today, pre-fill values and send `PUT /api/v1/checklist/today`. Otherwise send `POST /api/v1/checklist`.
3. Yesterday's Grace Form (`app/(app)/checklist/yesterday/page.jsx`):
   - Dedicated form submitting to `PUT /api/v1/checklist/yesterday`.
4. Daily Score Result (`app/(app)/daily-score/page.jsx`):
   - Visualize today's percentage score, itemized points achieved, and streak increment celebration.
```

---

## Phase 10: Frontend Visual Analytics — Weekly Breakdown & Monthly Radar

### Goal
Implement visual report views using Recharts: Weekly analytics (bar breakdown, $\Delta$ trends, focus tip) and 30-Day Monthly Results (Life Stage badge, radar balance chart, strengths/weaknesses, rule-based insight).

### Step-by-Step Implementation Instructions
1. Implement Weekly Report page: `app/(app)/weekly/[week]/page.jsx`:
   - Fetch via `GET /api/v1/weekly/:weekNumber`.
   - Render score summary, $\Delta$ indicator (▲/▼ or "Baseline Week"), best vs. lowest day cards.
   - Render Recharts Bar Chart showing point ratios across all 12 areas.
   - Display highlighted Focus Tip card.
2. Implement 30-Day Monthly Report page: `app/(app)/monthly/page.jsx`:
   - Fetch via `GET /api/v1/monthly/:cycleId`.
   - Display Life Score gauge, Consistency percentage, and prominent **Life Stage Badge** (Stage 1–10).
   - Render Recharts Radar Chart mapping all 12 life areas.
   - Render Top 3 Strengths and Bottom 3 Weaknesses lists.
   - Render 5-period trend line chart.
   - Display Life Insight reflection text and action suggestions.
   - If `hasEnoughData === false`, render warning disclaimer.
   - Render "Start Next Cycle" button.

---

### 📋 COPY-PASTE PROMPT: PHASE 10
```markdown
Implement the Visual Analytics, Weekly Reports, and 30-Day Monthly Life Stage UI in Next.js using Recharts matching `PRD.md` Sections 3.5 & 3.6.

Tasks:
1. Weekly Analytics (`app/(app)/weekly/[week]/page.jsx`):
   - Fetch data from `GET /api/v1/weekly/:weekNumber`.
   - Display weekly average score, days tracked (e.g., 6 of 7), best and lowest days.
   - Render Recharts Bar Chart illustrating completion rates across all 12 life areas.
   - Display Delta from previous week badge (or "Baseline Week" for Week 1).
   - Render personalized Focus Tip callout.
2. 30-Day Monthly Report (`app/(app)/monthly/page.jsx`):
   - Fetch data from `GET /api/v1/monthly/:cycleId`.
   - Display Life Score percentage and Habit Consistency rate.
   - Render Life Stage card showing Stage number (1 to 10), official title, and description.
   - Render Recharts Radar Chart illustrating lifestyle balance across all 12 areas.
   - Display Top 3 Strengths and Bottom 3 Weaknesses cards.
   - Render 5-week progress trend line chart.
   - Render rule-based Life Insight paragraph and 2-3 Action Suggestions.
   - Show limited-data disclaimer banner if `hasEnoughData` is false.
   - Provide "Archive & Start Next Cycle" action.
```

---

## Phase 11: End-to-End Integration, Security Audit, & Production Deployment

### Goal
Conduct full-system integration tests, verify transaction rollbacks, perform security audits (rate limiting, XSS sanitization, JWT expiration), and containerize/deploy the application.

### Step-by-Step Implementation Instructions
1. Run automated integration test suites simulating a complete 30-day student cycle.
2. Verify security controls:
   - Attempt brute-force logins $\rightarrow$ verify 429 `RATE_LIMIT_EXCEEDED`.
   - Attempt cross-tenant data access $\rightarrow$ verify 403 / 404 isolation.
   - Submit invalid fraction $5/4$ classes $\rightarrow$ verify 400 `VALIDATION_ERROR`.
   - Edit checklist on same day $\rightarrow$ verify streak does NOT increment.
3. Configure Service Worker in `frontend/public/sw.js` for Web Push notifications.
4. Create `Dockerfile` and `docker-compose.yml` orchestrating MongoDB, Express backend, and Next.js frontend.
5. Create production deployment guide for platforms like Vercel (frontend) + Render/Railway (backend) + MongoDB Atlas.

---

### 📋 COPY-PASTE PROMPT: PHASE 11
```markdown
You are a Lead DevOps & QA Engineer. Perform the final integration, security verification, and deployment containerization for the Student Life Tracker project.

Tasks:
1. Integration Test Suite (`backend/tests/e2e.test.js`):
   - Simulate complete user flow: Registration -> Verification -> Start Cycle -> 30 Daily Check-ins (including off-days and same-day edits) -> Weekly Aggregations -> Monthly Finalization.
   - Validate that same-day edits DO NOT cause duplicate streak increments.
   - Validate that a skipped calendar day triggers 0% score backfill and streak reset via cron.
2. Security Hardening:
   - Ensure all free-text fields are sanitized against XSS.
   - Test rate-limiting middleware on auth endpoints.
   - Verify CORS allows only FRONTEND_URL.
3. Production Dockerization:
   - Write `backend/Dockerfile` using multi-stage Node.js 20 Alpine.
   - Write `frontend/Dockerfile` for Next.js standalone output.
   - Write root `docker-compose.yml` bundling MongoDB, backend API, and frontend client.
4. Prepare a comprehensive README.md with local setup and production deployment instructions.
```

---

*End of Development Master Blueprint — `prompt.md` (v1.0.0)*
