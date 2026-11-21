# Mobile App Development Master Blueprint & Step-by-Step Implementation Prompts
## Student Life Progress & Self-Improvement Tracker (Android App)

---

| Field | Detail |
|---|---|
| **Document Purpose** | Comprehensive, Executable Mobile Engineering Roadmap & Agent Prompts (0 to Production-Ready) |
| **Target Platform** | Android (React Native 0.88+, Expo SDK 58, Expo Router, TypeScript) |
| **Workspace Folder** | `android-app/` |
| **Aligned Documents** | `PRD.md` (v2.0), `arcthitecture.md` (v2.0), `api-spec.md` (v1.1.0), `databse-schema.md` |
| **Target Audience** | Mobile Developers, AI Coding Agents, Software Architects |
| **Methodology** | Phased Development, Strict Type Safety, Offline-Resilient UX, Production EAS Build |

---

## Table of Contents
1. [Mobile Architecture & Engineering Guidelines](#1-mobile-architecture--engineering-guidelines)
2. [Mobile App Directory Structure (`android-app/src`)](#2-mobile-app-directory-structure-android-appsrc)
3. [Phased Development Roadmap Overview](#3-phased-development-roadmap-overview)
4. [Phase 0: Project Setup, Dependencies & Base Configuration](#phase-0-project-setup-dependencies--base-configuration)
5. [Phase 1: API Client, Authentication & Session Persistence](#phase-1-api-client-authentication--session-persistence)
6. [Phase 2: Cycle Lifecycle & Onboarding Flow](#phase-2-cycle-lifecycle--onboarding-flow)
7. [Phase 3: Core Domain — 12-Item Checklist & Grace Entry](#phase-3-core-domain--12-item-checklist--grace-entry)
8. [Phase 4: Dashboard, Streak Visuals & Daily Score Breakdown](#phase-4-dashboard-streak-visuals--daily-score-breakdown)
9. [Phase 5: Weekly Reports & Life Area Radar Analytics](#phase-5-weekly-reports--life-area-radar-analytics)
10. [Phase 6: Monthly 30-Day Life Stage & Insights Engine](#phase-6-monthly-30-day-life-stage--insights-engine)
11. [Phase 7: Profile, Targets & Local Reminder Notifications](#phase-7-profile-targets--local-reminder-notifications)
12. [Phase 8: Offline Resilience, Error Boundaries & Polish](#phase-8-offline-resilience-error-boundaries--polish)
13. [Phase 9: Production Hardening, EAS Build & Release APK/AAB](#phase-9-production-hardening-eas-build--release-apkaab)

---

## 1. Mobile Architecture & Engineering Guidelines

When implementing each step or executing prompts in `android-app/`, strictly enforce these rules:

1. **Expo SDK 58 Standard**:
   - Use `npx expo install <package>` for dependency management to guarantee SDK-compatible binary versions.
   - Strictly follow Expo Router (v58) file-based routing inside `src/app/`. Route files only represent screens and layouts (`_layout.tsx`). Business logic, components, contexts, and hooks reside in `src/components/`, `src/services/`, and `src/context/`.
2. **API & Timezone Compliance (`api-spec.md`)**:
   - The backend runs at `http://<IP_OR_HOST>:5000/api/v1` (with development fallback for emulator `10.0.2.2:5000` or local network IP).
   - Every protected request **must** send:
     - `Authorization: Bearer <jwt_token>`
     - `x-timezone-offset: <offset_in_minutes>` (e.g. `new Date().getTimezoneOffset()`, `-360` for UTC+6).
3. **Deterministic Scoring Parity**:
   - The mobile app must embed the exact same deterministic scoring engine (`itemScorers`) as defined in `PRD.md` Section 3.3 and `arcthitecture.md` Section 8.1.
   - Total normal day: **100 pts**; University off-day: **82 pts max**.
4. **Secure Token Storage**:
   - JWT tokens must be saved using `expo-secure-store` (never unencrypted `AsyncStorage` or plain files).
5. **Strict Typing**:
   - 100% TypeScript with strict mode enabled. Zero `any` types on API contract responses. Run `npx tsc --noEmit` before concluding any phase.

---

## 2. Mobile App Directory Structure (`android-app/src`)

```
android-app/
├── app.json
├── package.json
├── tsconfig.json
├── eas.json
└── src/
    ├── app/
    │   ├── _layout.tsx                  # Root Provider shell & Auth gatekeeper
    │   ├── (auth)/
    │   │   ├── _layout.tsx              # Auth stack navigator
    │   │   ├── login.tsx                # Email + Password login screen
    │   │   ├── register.tsx             # Full registration flow with institution
    │   │   └── forgot-password.tsx      # Password recovery request
    │   ├── (tabs)/
    │   │   ├── _layout.tsx              # Bottom tab bar navigator (Icons & Badges)
    │   │   ├── index.tsx                # Home Dashboard (Day counter, Streak, Today status)
    │   │   ├── checklist.tsx            # Today's 12-item active check-in form
    │   │   ├── weekly.tsx               # Weekly breakdown & focus tip
    │   │   ├── monthly.tsx              # 30-Day Life Stage & Insights
    │   │   └── profile.tsx              # Target times, notifications, account settings
    │   ├── cycle/
    │   │   └── setup.tsx                # 30-Day Cycle initialization modal/screen
    │   ├── checklist/
    │   │   └── yesterday.tsx            # Grace window 24-hr check-in screen
    │   └── score/
    │       └── [date].tsx               # Detailed daily score breakdown modal
    ├── components/
    │   ├── common/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Header.tsx
    │   │   ├── LoadingScreen.tsx
    │   │   └── ErrorBanner.tsx
    │   ├── checklist/
    │   │   ├── ItemToggle.tsx           # Boolean items (1, 4, 9, 12)
    │   │   ├── AttendanceSelector.tsx   # Item 2 (Yes / No / Off Day)
    │   │   ├── ClassFractionInput.tsx   # Item 3 (a/b stepper)
    │   │   ├── StepperInput.tsx         # Item 5, 8
    │   │   ├── ActivityMinutesInput.tsx # Item 7 (Toggle + Minutes)
    │   │   ├── SegmentedControl.tsx     # Item 10 (Social media)
    │   │   ├── ReflectionInput.tsx      # Item 6, 11 (Multiline + char counter)
    │   │   └── LiveScoreBar.tsx         # Real-time score calculator preview
    │   ├── dashboard/
    │   │   ├── StreakBadge.tsx
    │   │   ├── DayProgressRing.tsx
    │   │   └── GraceAlertBanner.tsx
    │   ├── charts/
    │   │   ├── ScoreTrendLine.tsx       # 30-day historical score curve
    │   │   ├── AreaBarChart.tsx         # 12 life areas performance
    │   │   └── LifeRadarChart.tsx       # SVG 12-axis spider/radar chart
    │   └── monthly/
    │       ├── LifeStageCard.tsx        # Stage 1-10 dynamic badge
    │       └── StrengthsWeaknesses.tsx
    ├── context/
    │   ├── AuthContext.tsx              # User state, JWT, login/logout functions
    │   └── CycleContext.tsx             # Active cycle, streak, reload functions
    ├── hooks/
    │   ├── useChecklist.ts
    │   ├── useScores.ts
    │   └── useNotifications.ts
    ├── services/
    │   ├── api.ts                       # Axios instance with interceptors & headers
    │   ├── auth.service.ts              # Auth endpoints
    │   ├── cycle.service.ts             # Cycle lifecycle endpoints
    │   ├── checklist.service.ts         # Checklist endpoints
    │   ├── score.service.ts             # Score & reports endpoints
    │   ├── notification.service.ts      # Expo Notifications scheduler
    │   └── scoringEngine.ts             # Client-side mirror of scoring formulas
    ├── types/
    │   ├── api.types.ts
    │   ├── user.types.ts
    │   ├── cycle.types.ts
    │   └── checklist.types.ts
    └── utils/
        ├── storage.ts                   # SecureStore wrapper
        ├── date.ts                      # Timezone & date formatters
        └── haptics.ts                   # Expo Haptics triggers
```

---

## 3. Phased Development Roadmap Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   MOBILE APP (EXPO REACT NATIVE) ROADMAP                    │
├──────────────────┬──────────────────────────────────────────────────────────┤
│ Phase 0          │ SDK 58 Scaffolding, Core Libraries & Env Configuration   │
│ Phase 1          │ Axios Interceptors, SecureStore & Full Auth Subsystem    │
│ Phase 2          │ 30-Day Cycle Lifecycle, Guard Routing & Setup Modal      │
│ Phase 3          │ 12-Item Checklist Form, Local Scoring & Grace Window     │
│ Phase 4          │ Home Dashboard, Streak Badging & Score Breakdown Modal   │
│ Phase 5          │ Weekly Analytics (Weeks 1-5), Bar Charts & Focus Tips    │
│ Phase 6          │ Monthly 30-Day Life Stage System & 12-Axis Radar Chart   │
│ Phase 7          │ Profile Screen, Target Times & Expo Local Push Reminders │
│ Phase 8          │ Offline Resilience, Error Boundaries & Haptic Polish     │
│ Phase 9          │ Android Icon/Splash Assets, EAS Config & Release Build   │
└──────────────────┴──────────────────────────────────────────────────────────┘
```

---

## Phase 0: Project Setup, Dependencies & Base Configuration

### Goal
Prepare the `android-app` workspace, install all required native packages compatible with Expo SDK 58, configure environment variables for the backend REST API, and establish TypeScript base types.

### Implementation Tasks
1. Clean up unused starter boilerplate in `android-app/src/app` while retaining Expo Router entry points.
2. Install dependencies via `npx expo install`:
   - State & Networking: `axios`, `expo-secure-store`
   - UI & Icons: `lucide-react-native`, `react-native-svg`
   - Feedback & Hardware: `expo-haptics`, `expo-notifications`, `expo-constants`
   - Utilities: `date-fns`
3. Configure `app.json`:
   - Set Android package name: `com.studentlifetracker.mobile`
   - Configure permissions for Notifications
   - Ensure adaptive icon and splash screen configuration.
4. Create environment configuration `src/constants/Config.ts` with API URL resolution (detecting emulator `10.0.2.2`, physical device IP, or production URL).

---

### 📋 COPY-PASTE PROMPT: PHASE 0
```markdown
You are a senior React Native / Expo specialist. Set up the foundational dependencies, configuration, and architecture for the Android mobile app in `android-app/` based on Expo SDK 58 and `PRD.md`.

Context & Constraints:
- Current workspace: `android-app` (Expo SDK 58, React Native 0.88, Expo Router v58, TypeScript).
- Backend runs at `http://10.0.2.2:5000/api/v1` for Android emulator or `http://<LAN_IP>:5000/api/v1` for physical device.

Tasks:
1. Run dependency installations using `npx expo install`:
   `npx expo install expo-secure-store expo-notifications expo-haptics react-native-svg lucide-react-native date-fns axios`
2. Update `android-app/app.json`:
   - App Name: "StudentLife Tracker"
   - Slug: "studentlife-tracker"
   - Android Package: "com.studentlifetracker.mobile"
   - Scheme: "studentlifetracker"
   - Plugins: Add "expo-notifications" and "expo-secure-store".
3. Create `src/constants/Config.ts`:
   - Export `API_BASE_URL` with dynamic detection:
     - Check `process.env.EXPO_PUBLIC_API_URL`.
     - Fallback to `http://10.0.2.2:5000/api/v1` on Android emulator or `http://localhost:5000/api/v1`.
   - Export timeout settings and app version constants.
4. Create `src/types/`:
   - `src/types/api.types.ts`: Define generic `ApiResponse<T>`, `ApiErrorResponse`, and standard error structure matching `api-spec.md` Section 4.1.
   - `src/types/user.types.ts`: Define `User` interface (id, name, email, university, department, targetWakeUpTime, targetSleepTime, reminderTime, reminderEnabled, emailVerified).
5. Verify clean build: Run `npx tsc --noEmit` and confirm zero errors.
```

---

## Phase 1: API Client, Authentication & Session Persistence

### Goal
Implement secure token persistence with `expo-secure-store`, Axios interceptors that inject the JWT Bearer token and `x-timezone-offset` header, global `AuthContext`, and authentication screens (Login, Register, Forgot Password).

### Implementation Tasks
1. `src/utils/storage.ts`: Safe wrapper around `expo-secure-store` with fallbacks.
2. `src/services/api.ts`:
   - Automatically read token from `storage.ts` and set `Authorization: Bearer <token>`.
   - Compute `new Date().getTimezoneOffset()` and attach as `x-timezone-offset` header on all outgoing requests.
   - Response interceptor to catch `401 TOKEN_EXPIRED` or `UNAUTHORIZED` and trigger auto-logout.
3. `src/context/AuthContext.tsx`:
   - State: `user`, `token`, `isLoading`, `isAuthenticated`.
   - Actions: `login(email, password)`, `register(payload)`, `logout()`, `refreshUser()`.
4. Authentication Screens in `src/app/(auth)/`:
   - `login.tsx`: Form with email and password, validation, "Show/Hide Password" toggle, link to Register and Forgot Password.
   - `register.tsx`: Full registration form (Name, Email, Password, University, Department) with validation matching `api-spec.md`.
   - `forgot-password.tsx`: Email input to trigger recovery link.
5. `src/app/_layout.tsx`:
   - Auth gatekeeper: Checks `isAuthenticated`. If unauthenticated, redirect to `(auth)/login`. If authenticated, navigate to `(tabs)`.

---

### 📋 COPY-PASTE PROMPT: PHASE 1
```markdown
You are an expert mobile developer. Implement the complete Authentication & API Client subsystem for `android-app/` following `api-spec.md` Section 3 and Section 6.1.

Requirements:
1. `src/utils/storage.ts`:
   - Implement `saveToken(token: string)`, `getToken(): Promise<string | null>`, `removeToken()`, `saveUser(user)`, `getUser()`.
   - Use `expo-secure-store` with error trapping.
2. `src/services/api.ts`:
   - Initialize Axios instance with `baseURL: API_BASE_URL` and `timeout: 15000`.
   - Request Interceptor: Automatically append `Authorization: Bearer <token>` and `x-timezone-offset: new Date().getTimezoneOffset().toString()`.
   - Response Interceptor: Catch standard error payload `{ success: false, error: { code, message } }`. Handle 401 status by clearing tokens and broadcasting logout event.
3. `src/services/auth.service.ts`:
   - Implement `login(email, password)`: POST `/api/v1/auth/login`.
   - Implement `register(data)`: POST `/api/v1/auth/register`.
   - Implement `forgotPassword(email)`: POST `/api/v1/auth/forgot-password`.
   - Implement `getProfile()`: GET `/api/v1/users/me`.
4. `src/context/AuthContext.tsx`:
   - Expose `useAuth()` hook providing `{ user, token, isLoading, login, register, logout, reloadProfile }`.
   - Load token and user on app startup (splash screen duration).
5. Screens in `src/app/(auth)/`:
   - `_layout.tsx`: Stack navigator with `headerShown: false`.
   - `login.tsx`: Clean, high-contrast student login UI. Displays field errors if backend responds with `INVALID_CREDENTIALS` or `VALIDATION_ERROR`.
   - `register.tsx`: Includes University and Department fields. On success (201), prompts the user to verify email before redirecting to login.
   - `forgot-password.tsx`: Sends password reset email.
6. Guard in `src/app/_layout.tsx`:
   - Protect routes using Expo Router's `useSegments()` and `router.replace()`.
   - Prevent unauthenticated users from accessing `(tabs)` and redirect authenticated users away from `(auth)`.
7. Verify type safety: Run `npx tsc --noEmit`.
```

---

## Phase 2: Cycle Lifecycle & Onboarding Flow

### Goal
Implement 30-day Cycle management matching `PRD.md` Section 3.2 and `api-spec.md` Section 6.3. Handle the active cycle state machine (`active`, `completed`, `abandoned`), cycle initialization modal, and cycle switching.

### Implementation Tasks
1. `src/types/cycle.types.ts`: Define `Cycle` interface (`cycleId`, `cycleNumber`, `startDate`, `endDate`, `status`, `currentStreak`, `targetWakeUpTime`, `targetSleepTime`, `dayNumber`, `hasSubmittedToday`).
2. `src/services/cycle.service.ts`:
   - `getActiveCycle()`: GET `/api/v1/cycles/active` (handles 404 `NO_ACTIVE_CYCLE`).
   - `startCycle(payload)`: POST `/api/v1/cycles`.
   - `getCycleHistory()`: GET `/api/v1/cycles`.
   - `abandonCycle(cycleId)`: PATCH `/api/v1/cycles/:id/abandon`.
3. `src/context/CycleContext.tsx`:
   - Global cycle state: `activeCycle`, `hasActiveCycle`, `loadingCycle`, `startNewCycle`, `abandonActiveCycle`, `refreshCycle`.
4. `src/app/cycle/setup.tsx`:
   - Screen/Modal shown when no cycle is active.
   - Allows choosing target wake-up time (`HH:mm`, default `"06:30"`), target sleep time (`HH:mm`, default `"23:00"`), and confirming start date (today).
   - Initializes Cycle and navigates back to Dashboard.
5. Abandon Confirmation Dialog:
   - Warning modal when abandoning a cycle explaining that streak and progress will be halted.

---

### 📋 COPY-PASTE PROMPT: PHASE 2
```markdown
You are an expert mobile developer. Implement the 30-Day Cycle Lifecycle subsystem in `android-app/` based on `PRD.md` Section 3.2 and `api-spec.md` Section 6.3.

Requirements:
1. `src/types/cycle.types.ts`:
   - Define TypeScript interfaces for `Cycle`, `ActiveCycleResponse`, and `StartCyclePayload`.
2. `src/services/cycle.service.ts`:
   - Methods:
     - `getActiveCycle()`: Returns active cycle data or null if 404 `NO_ACTIVE_CYCLE`.
     - `startCycle(payload: { startDate, targetWakeUpTime, targetSleepTime })`: Calls POST `/api/v1/cycles`.
     - `abandonCycle(id: string)`: Calls PATCH `/api/v1/cycles/${id}/abandon`.
     - `getCycleHistory()`: Calls GET `/api/v1/cycles`.
3. `src/context/CycleContext.tsx`:
   - Provides `{ activeCycle, hasActiveCycle, isCycleLoading, startCycle, abandonCycle, reloadCycle }`.
   - Automatically polls or fetches cycle status when authentication state becomes valid.
4. `src/app/cycle/setup.tsx`:
   - Modal or standalone screen using modern mobile card layout.
   - Includes Time Pickers or validated text inputs for `targetWakeUpTime` (default 06:30) and `targetSleepTime` (default 23:00).
   - "Start 30-Day Journey" button triggers `startCycle()` with immediate visual feedback and error banner on conflict.
5. In `src/app/(tabs)/index.tsx`:
   - If `hasActiveCycle === false` and `!isCycleLoading`, show an engaging "No Active Cycle" banner with a direct "Start Your 30-Day Cycle" call to action linking to `/cycle/setup`.
6. Run `npx tsc --noEmit` and confirm zero typing issues.
```

---

## Phase 3: Core Domain — 12-Item Checklist & Grace Entry

### Goal
Implement the core 12-item daily checklist form, local real-time scoring preview matching `ItemScorers.js`, submission/edit (`POST /checklist` and `PUT /checklist/today`), and yesterday's grace window entry (`PUT /checklist/yesterday`).

### Exact Scoring Logic Reference (`PRD.md` Section 3.3):
- Item 1 (Early Morning): Boolean $\rightarrow$ 8 pts
- Item 2 (Uni Attendance): `'yes'` = 10 pts, `'no'` = 0 pts, `'off_day'` = 0 pts (Max points reduced from 100 to 82)
- Item 3 (Class Participation): $(a / b) \times 8$ pts; on off-day = 0 pts
- Item 4 (Personal Discipline): Boolean $\rightarrow$ 8 pts
- Item 5 (Social Interaction): $\ge 3 \rightarrow 6$ pts, $2 \rightarrow 4$ pts, $1 \rightarrow 2$ pts, $0 \rightarrow 0$ pts
- Item 6 (Daily Learning): Non-empty text $\rightarrow$ 10 pts
- Item 7 (Physical Activity): Active AND $\ge 15$ mins = 10 pts, $< 15$ mins = 5 pts, No = 0 pts
- Item 8 (Skill Development): $\ge 60$ mins = 10 pts, 30–59 mins = 6 pts, 15–29 mins = 3 pts, $< 15$ mins = 0 pts
- Item 9 (Class Work Recap): Boolean $\rightarrow$ 10 pts
- Item 10 (Social Media Control): `'controlled'` = 6 pts, `'useful'` = 3 pts, `'excessive'` = 0 pts
- Item 11 (Self-Reflection): Meaningful journal entry $\rightarrow$ 8 pts
- Item 12 (Sleep on Time): Boolean $\rightarrow$ 6 pts

---

### 📋 COPY-PASTE PROMPT: PHASE 3
```markdown
You are an expert mobile UI and logic engineer. Implement the 12-Item Daily Checklist, Live Scoring Engine, and Grace Window submission in `android-app/` strictly conforming to `PRD.md` Section 3.3 and `api-spec.md` Section 6.4.

Requirements:
1. `src/services/scoringEngine.ts`:
   - Mirror the backend deterministic calculation: `calculateDailyScore(activityData)`.
   - Calculate points for all 12 items. If `isOffDay === true` or `item2 === 'off_day'`, exclude Items 2 and 3 so `maxAvailablePoints = 82`, else `100`.
   - Output `{ totalScore: number, achievedPoints: number, maxAvailablePoints: number, breakdown: Record<string, number> }`.
2. `src/services/checklist.service.ts`:
   - `getTodayEntry()`: GET `/api/v1/checklist/today`.
   - `submitTodayChecklist(data)`: POST `/api/v1/checklist`.
   - `updateTodayChecklist(data)`: PUT `/api/v1/checklist/today`.
   - `submitYesterdayGrace(data)`: PUT `/api/v1/checklist/yesterday`.
   - `getEntryByDate(dateStr)`: GET `/api/v1/checklist/${dateStr}`.
3. Modular Form Components in `src/components/checklist/`:
   - `ItemToggle.tsx`: Animated toggle for Boolean items (1, 4, 9, 12) with tactile haptic feedback on switch.
   - `AttendanceSelector.tsx`: 3-way radio pill for Item 2 ('yes', 'no', 'off_day'). Automatically toggles `isOffDay` when 'off_day' is selected.
   - `ClassFractionInput.tsx`: Item 3 class counters: attended stepper ($a$) and scheduled stepper ($b$) with validation ($a \le b$). Disabled on off-days.
   - `StepperInput.tsx`: Increment/decrement buttons for Item 5 (Interactions, 0-50).
   - `ActivityMinutesInput.tsx`: Item 7 exercise checkbox + minutes stepper ($0 \dots 180$).
   - `SkillMinutesInput.tsx`: Item 8 skill minutes quick buttons (15m, 30m, 60m, custom).
   - `SegmentedControl.tsx`: Item 10 choice pill ('controlled', 'useful', 'excessive').
   - `ReflectionInput.tsx`: Items 6 & 11 multiline `TextInput` (max 500 chars) with live character counter.
   - `LiveScoreBar.tsx`: Sticky top or bottom bar displaying live computed percentage score and points as the user fills the form.
4. Checklist Screens:
   - `src/app/(tabs)/checklist.tsx`:
     - Checks if today is already submitted via `getTodayEntry()`.
     - If submitted: pre-fills data, switches button to "Update Today's Checklist" (`PUT /today`), displays badge "Submitted for Today".
     - If new: allows initial submission (`POST /checklist`).
     - Includes pull-to-refresh.
   - `src/app/checklist/yesterday.tsx`:
     - Grace window screen. Checks if yesterday was unrecorded.
     - Submits to `PUT /api/v1/checklist/yesterday` within the 24-hr grace period.
5. Trigger `Haptics.notificationAsync(NotificationFeedbackType.Success)` on successful submission and navigate to Daily Score screen.
6. Verify type safety: Run `npx tsc --noEmit`.
```

---

## Phase 4: Dashboard, Streak Visuals & Daily Score Breakdown

### Goal
Build an engaging Home Dashboard (`(tabs)/index.tsx`) displaying current day number (1–30), continuous streak badge with flame animation, today's submission status, yesterday grace entry warning banner, and daily score celebration modal.

### Implementation Tasks
1. Dashboard Header:
   - Greeting with student name, university, and current date.
   - Day counter: "Day X of 30" with a circular progress indicator.
   - Streak card: Active consecutive days with flame icon and encouragement quote.
2. Status Card:
   - If submitted today: Shows completed score ring (e.g. 94%), achieved points, and "Edit Today's Checklist" button.
   - If pending today: Shows urgent reminder card with countdown to midnight and "Complete Today's Checklist" button.
3. Yesterday Grace Banner:
   - Informs student if yesterday's entry is missing but still within the 24-hour grace window.
   - Button: "Fill Yesterday's Entry (Grace Window)" linking to `/checklist/yesterday`.
4. Score Breakdown Screen (`src/app/score/[date].tsx`):
   - Modal or screen displaying score for any date.
   - Visual breakdown list of all 12 items showing points earned vs max points.
   - Shareable celebratory snapshot.

---

### 📋 COPY-PASTE PROMPT: PHASE 4
```markdown
You are an expert mobile frontend engineer. Build the Home Dashboard and Daily Score Breakdown screens in `android-app/` based on `PRD.md` Section 3.1–3.4 and `api-spec.md` Section 6.5.

Requirements:
1. `src/services/score.service.ts`:
   - `getTodayScore()`: GET `/api/v1/scores/today`.
   - `getScoreByDate(dateStr)`: GET `/api/v1/scores/${dateStr}`.
   - `getCycleScores(cycleId)`: GET `/api/v1/scores/cycle/${cycleId}`.
2. Dashboard Screen `src/app/(tabs)/index.tsx`:
   - Header with student's name, department, and today's date formatted using `date-fns`.
   - Cycle Progress Component: Circular progress ring showing `dayNumber / 30` with days remaining.
   - Streak Badge: Prominent streak counter with fire icon (`lucide-react-native`).
   - Today's Status Card:
     - If submitted: Displays today's score percentage with color-coded ring (Green for $\ge 80\%$, Yellow for $50-79\%$, Red for $< 50\%$).
     - If not submitted: Call-to-action button "Record Today's Checklist" with a reminder that entries close at midnight.
   - Grace Window Warning Banner:
     - Check if yesterday was missed and within grace period. Display an alert card with "Yesterday needs attention — Fill before midnight".
   - Recent 7-Day Score Mini-Chart: Quick bar or sparkline showing scores over the last 7 days.
   - Pull-to-refresh functionality refreshing cycle, today's activity, and score.
3. Daily Score Detail Screen `src/app/score/[date].tsx`:
   - Modal route showing:
     - Total score percentage (0–100%) and points earned (e.g. 92 / 100 pts).
     - Full item-by-item breakdown list (12 items) with earned points tag and icon.
     - "Back to Dashboard" and "Edit Entry" buttons.
4. Polish with smooth animations and verify type safety with `npx tsc --noEmit`.
```

---

## Phase 5: Weekly Reports & Life Area Radar Analytics

### Goal
Implement the Weekly Report screen (`(tabs)/weekly.tsx`) allowing students to inspect 7-day milestones (Weeks 1, 2, 3, 4, and Week 5 Final Stretch), view area performance breakdowns, week-over-week $\Delta \pm \%$, and targeted focus tips.

### Implementation Tasks
1. `src/types/score.types.ts`: Define `WeeklyReport` matching `api-spec.md` Section 6.6.
2. `src/services/score.service.ts`:
   - `getWeeklyReport(weekNumber)`: GET `/api/v1/weekly/:weekNumber`.
3. Screen `src/app/(tabs)/weekly.tsx`:
   - Top segmented tab bar to switch between Week 1, Week 2, Week 3, Week 4, and Final Stretch (Days 29–30).
   - Week Lock Guard: If the backend returns 400 `WEEK_NOT_UNLOCKED`, display an elegant lock screen stating: "Week X unlocks after Day Y is completed".
   - Unlocked Report Layout:
     - Key Metrics Cards: Weekly Average Score, Days Tracked (e.g. "6 of 7 days"), Best Day, Lowest Day.
     - Week-over-Week Change ($\Delta \pm \%$): Badge showing progress comparison (or "Baseline Week" for Week 1).
     - Life Area Breakdown Bar Chart: Horizontal or vertical SVG bar chart representing completion rates ($0.0 \dots 1.0$) across all 12 items.
     - Targeted Focus Tip Card: Highlighted card displaying the context-aware recommendation generated by the server.

---

### 📋 COPY-PASTE PROMPT: PHASE 5
```markdown
You are a senior mobile visualization engineer. Build the Weekly Analytics and Focus Tip screen in `android-app/` strictly following `PRD.md` Section 3.5 and `api-spec.md` Section 6.6.

Requirements:
1. `src/services/score.service.ts`:
   - Implement `getWeeklySummary(weekNumber: number)`: Calls GET `/api/v1/weekly/${weekNumber}`.
   - Handle `WEEK_NOT_UNLOCKED` error gracefully without crashing.
2. Weekly Screen `src/app/(tabs)/weekly.tsx`:
   - Week Selector Bar: Tabs for Week 1 (Days 1–7), Week 2 (Days 8–14), Week 3 (Days 15–21), Week 4 (Days 22–28), and Final Stretch (Days 29–30).
   - Locked Week State:
     - If the week is in the future, display a clean lock state with a countdown or message: "Week {N} report will unlock at the end of Day {M}."
   - Summary Metrics Grid:
     - Weekly Average Score (e.g. "88.5%").
     - Tracking Consistency: "X of 7 days logged".
     - Best Day vs Lowest Day cards with respective dates and scores.
     - Week-over-Week Delta badge: e.g. "+6.5% vs last week" (or "Baseline Week" for Week 1).
   - 12 Life Areas Breakdown:
     - Implement a custom SVG-based bar chart or clean progress list showing completion rate ($0\% \dots 100\%$) for all 12 areas.
     - Highlight the lowest performing area in red/orange and highest in emerald green.
   - Contextual Focus Tip:
     - Prominent card with a lightbulb icon displaying `focusTip` returned by the API.
3. Test with mock or live week responses and verify strict typing with `npx tsc --noEmit`.
```

---

## Phase 6: Monthly 30-Day Life Stage & Insights Engine

### Goal
Implement the Monthly Report screen (`(tabs)/monthly.tsx`) displaying the final 30-day evaluation, classification into one of 10 Life Stages, Top 3 Strengths and Weaknesses, 12-Axis SVG Radar Chart, and personalised Life Insight.

### 10 Life Stages Boundary Reference (`PRD.md` Section 3.6):
- Stage 1 (0.00 – 19.99%): Critical / Highly Unbalanced
- Stage 2 (20.00 – 29.99%): Struggling / Low Discipline
- Stage 3 (30.00 – 39.99%): Inconsistent Routine
- Stage 4 (40.00 – 49.99%): Emerging Awareness
- Stage 5 (50.00 – 59.99%): Moderate Balance
- Stage 6 (60.00 – 69.99%): Steady Progress
- Stage 7 (70.00 – 79.99%): Disciplined Student
- Stage 8 (80.00 – 89.99%): High Achiever
- Stage 9 (90.00 – 94.99%): Exemplary Lifestyle
- Stage 10 (95.00 – 100.00%): Exceptional Self-Development

---

### 📋 COPY-PASTE PROMPT: PHASE 6
```markdown
You are a senior mobile UI engineer and data visualization expert. Implement the 30-Day Monthly Report and Life Stage system in `android-app/` based on `PRD.md` Section 3.6 and `api-spec.md` Section 6.7.

Requirements:
1. `src/services/score.service.ts`:
   - Implement `getMonthlyReport(cycleId: string)`: Calls GET `/api/v1/monthly/${cycleId}`.
   - Trap `CYCLE_NOT_COMPLETED` error (when cycle is on days 1–29).
2. SVG Radar Chart Component `src/components/charts/LifeRadarChart.tsx`:
   - Build a 12-axis polygon radar chart using `react-native-svg`.
   - Plot the 12 normalized area scores ($0.0 \dots 1.0$) on concentric web grid lines.
   - Render readable labels for all 12 life areas around the perimeter.
3. Monthly Screen `src/app/(tabs)/monthly.tsx`:
   - Pending / In-Progress State:
     - If the cycle is still active (Day < 30), show a progress journey screen showing days completed (e.g. "Day 14 of 30") and an encouraging message: "The 30-Day Life Stage Report unlocks after completing Day 30."
   - Completed Report Layout:
     - Life Stage Hero Banner:
       - Displays stage number (1–10) and title (e.g. "Stage 8: High Achiever").
       - Visual badge with stage description.
     - Primary Metrics:
       - Overall Life Score (e.g. "86.4%").
       - Habit Consistency (e.g. "96.7% - 29 of 30 days tracked").
     - 12-Axis Radar Chart: Visual balance across all lifestyle dimensions.
     - Top 3 Strengths & Bottom 3 Weaknesses:
       - Ranked cards with green (strengths) and amber (weaknesses) progress bars.
     - Life Insight Card:
       - Narrative paragraph reflecting the student's 30-day journey.
       - If `hasEnoughData === false` (< 15 days tracked), display a prominent advisory: "Report generated with limited data."
     - Improvement Recommendations:
       - Bulleted list of actionable steps for the next cycle.
     - Action Footer:
       - "Start Cycle {N+1}" button to archive this cycle and transition seamlessly.
4. Verify rendering and type safety: Run `npx tsc --noEmit`.
```

---

## Phase 7: Profile, Targets & Local Reminder Notifications

### Goal
Implement the Profile screen (`(tabs)/profile.tsx`) allowing students to update their profile info, configure target wake-up and sleep times, schedule daily local reminder notifications with `expo-notifications`, and handle account deletion.

### Implementation Tasks
1. `src/services/notification.service.ts`:
   - Configure `expo-notifications` permissions and notification channel for Android.
   - `scheduleDailyReminder(reminderTime: string)`: Parses `HH:mm` (e.g. `"21:00"`) and schedules a recurring daily local notification.
   - Title: "StudentLife Check-in Reminder"
   - Body: "Don't break your streak! Record today's 12 life areas before midnight."
   - `cancelReminders()`: Clears scheduled notifications if reminder is disabled or today is already submitted.
2. Profile Screen `src/app/(tabs)/profile.tsx`:
   - Display student name, email, university, department.
   - Editable Targets:
     - Target Wake-Up Time (`targetWakeUpTime`, e.g. `"06:30"`).
     - Target Sleep Time (`targetSleepTime`, e.g. `"23:00"`).
     - Daily Reminder Time (`reminderTime`, e.g. `"21:00"`).
     - Reminder Active toggle (`reminderEnabled`).
   - "Save Target Times": Calls `PUT /api/v1/users/me` and reschedules local notification.
   - Logout button: Clears `SecureStore` and redirects to login.
   - Danger Zone: "Delete My Account & Data" (`DELETE /api/v1/users/me`) with double confirmation modal.

---

### 📋 COPY-PASTE PROMPT: PHASE 7
```markdown
You are an expert mobile developer. Implement the User Profile, Lifestyle Target Settings, and Local Push Notification Scheduler in `android-app/` based on `PRD.md` Section 3.1 & 3.7 and `api-spec.md` Section 6.2 & 6.8.

Requirements:
1. `src/services/notification.service.ts`:
   - Use `expo-notifications`:
     - Request notification permissions on Android 13+ (`POST_NOTIFICATIONS`).
     - Create an Android Notification Channel: "Daily Reminder" with high importance and vibration.
     - Function `scheduleDailyReminder(timeStr: string)`: Parse "HH:mm" and schedule a daily repeating notification.
     - Function `cancelAllReminders()`: Cancel all scheduled notifications.
2. `src/services/user.service.ts`:
   - `getProfile()`: GET `/api/v1/users/me`.
   - `updateProfile(data)`: PUT `/api/v1/users/me`.
   - `deleteAccount()`: DELETE `/api/v1/users/me`.
3. Profile Screen `src/app/(tabs)/profile.tsx`:
   - Profile Header: Avatar initial, student name, university, department, email.
   - Lifestyle Targets Section:
     - Target Wake-Up Time input/picker (`HH:mm`).
     - Target Bedtime input/picker (`HH:mm`).
     - Daily Reminder Time input/picker (`HH:mm`).
     - Switch toggle for "Enable Daily Push Notifications".
     - "Update Settings" button calling `updateProfile()` and syncing `expo-notifications`.
   - App Info & Cycle Stats: Shows current cycle number and total days tracked.
   - Logout Button: Clears credentials and navigates to `(auth)/login`.
   - Danger Zone:
     - "Delete Account & Data" red button.
     - Modal prompt requiring the student to confirm before triggering `DELETE /api/v1/users/me`.
4. Test notification scheduling logic and run `npx tsc --noEmit`.
```

---

## Phase 8: Offline Resilience, Error Boundaries & Polish

### Goal
Add production polish to the mobile app: offline network detection with graceful UI warnings, error boundaries to prevent app crashes, tactile haptic feedback on actions, and comprehensive unit/integration test coverage.

### Implementation Tasks
1. Offline Resilience:
   - Network state listener detecting lost connection.
   - Global sticky offline banner: "You are currently offline. Check your network connection."
   - Cached fallback for dashboard and active cycle.
2. Error Boundary:
   - Root React Error Boundary in `src/components/common/ErrorBoundary.tsx` that catches unexpected component render errors and presents a "Something went wrong — Reload" screen.
3. Haptic Feedback Polish (`src/utils/haptics.ts`):
   - Checkbox / Toggle toggle: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`
   - Form Submission success: `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`
   - Error or validation failure: `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)`
4. UI Polishing:
   - Ensure clean safe-area insets on Android devices with navigation bars and punch-hole cameras (`react-native-safe-area-context`).
   - Smooth loading skeletons for dashboard and charts.

---

### 📋 COPY-PASTE PROMPT: PHASE 8
```markdown
You are a senior React Native engineer. Add offline resilience, error boundaries, tactile haptic feedback, and UX polish to `android-app/`.

Requirements:
1. `src/components/common/ErrorBoundary.tsx`:
   - Class-based Error Boundary wrapping the root app layout.
   - Renders a clean recovery screen with error description and a "Reload App" button.
2. `src/utils/haptics.ts`:
   - Safe wrapper around `expo-haptics`:
     - `triggerLightImpact()`: For checklist toggle switches and radio selections.
     - `triggerSuccessFeedback()`: For successful submissions.
     - `triggerErrorFeedback()`: For validation and API errors.
3. Network Resilience:
   - Global banner displayed when requests fail due to network disconnection (`ECONNABORTED`, `ERR_NETWORK`).
   - Retry button to re-fetch failed dashboard data.
4. Safe Area & Theme Consistency:
   - Wrap screens in `SafeAreaView` from `react-native-safe-area-context` with `edges={['top', 'left', 'right']}`.
   - Ensure status bar appearance (`expo-status-bar`) matches background theme.
5. Verification:
   - Run `npx tsc --noEmit` and confirm zero TypeScript errors.
   - Verify all navigation transitions and modals function smoothly.
```

---

## Phase 9: Production Hardening, EAS Build & Release APK/AAB

### Goal
Configure Expo Application Services (EAS Build), generate production Android assets (adaptive icons, splash screen, metadata), configure signing credentials, and create standalone production APK and Google Play AAB release builds.

### Implementation Tasks
1. `android-app/eas.json`:
   - Configure `development`, `preview` (standalone APK for direct Android device testing), and `production` (optimized Android App Bundle `.aab` for Google Play Store).
2. Android Manifest & Permissions:
   - Verify `POST_NOTIFICATIONS`, `VIBRATE`, and `INTERNET` permissions in `app.json`.
3. Asset Audit:
   - Ensure adaptive icon (`assets/images/adaptive-icon.png`) and splash image (`assets/images/splash.png`) exist and match the app branding.
4. Build Execution Guide:
   - Step-by-step commands to run local or cloud builds via EAS CLI.

---

### 📋 COPY-PASTE PROMPT: PHASE 9
```markdown
You are a DevOps and mobile release engineer. Configure the production build pipeline and EAS configuration for `android-app/` to generate production Android APK and AAB binaries.

Requirements:
1. Create `android-app/eas.json`:
   - Profile `development`: buildType: "apk", developmentClient: true.
   - Profile `preview`:
     - distribution: "internal"
     - android: { "buildType": "apk" } (Allows testing standalone APK directly on Android phones without Google Play).
   - Profile `production`:
     - android: { "buildType": "app-bundle" } (Optimized Google Play AAB bundle).
2. Finalize `android-app/app.json`:
   - Set version: "1.0.0", versionCode: 1.
   - Verify `android.package`: "com.studentlifetracker.mobile".
   - Set `android.permissions`: `["RECEIVE_BOOT_COMPLETED", "VIBRATE", "POST_NOTIFICATIONS"]`.
3. Production Pre-flight Checklist:
   - Run `npx tsc --noEmit` to verify type safety.
   - Verify that all production endpoints point to the live server URL via `EXPO_PUBLIC_API_URL`.
   - Provide the exact terminal commands for:
     1. Logging in to EAS: `npx eas-cli login`
     2. Configuring project: `npx eas-cli build:configure`
     3. Building Android Standalone APK (Preview): `npx eas-cli build --platform android --profile preview`
     4. Building Google Play Release AAB: `npx eas-cli build --platform android --profile production`
```

---

## Quick Reference: Phase Execution Index

| Phase | Core Objective | Key Deliverables |
|---|---|---|
| **Phase 0** | Scaffolding & SDK 58 | Dependencies installed, `Config.ts`, base TS types |
| **Phase 1** | Auth & Network Layer | `api.ts`, `AuthContext`, `storage.ts`, Login/Register UI |
| **Phase 2** | 30-Day Cycle Flow | `CycleContext`, Cycle Setup Modal, State Guards |
| **Phase 3** | 12-Item Checklist Form | Form components, `scoringEngine.ts`, Grace Entry |
| **Phase 4** | Dashboard & Scores | Progress Ring, Streak Badge, Score Breakdown Modal |
| **Phase 5** | Weekly Analytics | Weeks 1–5 tabs, Bar charts, Focus Tips, Lock state |
| **Phase 6** | 30-Day Monthly Report | 10 Life Stages, 12-Axis SVG Radar, Life Insights |
| **Phase 7** | Profile & Notifications | Target times, `expo-notifications` scheduler, Account deletion |
| **Phase 8** | Polish & Resilience | Error Boundaries, Haptics, Network state handling |
| **Phase 9** | Production EAS Build | `eas.json`, Standalone APK build, Google Play AAB |

---
*Created for Student Life Progress & Self-Improvement Tracker — Mobile Development Guide*
