# FINAL PRD ANALYSIS
## Student Life Progress & Self-Improvement Tracker
### Android Mobile Application — CSE 3210 · SMUCT

---

| Field | Detail |
|---|---|
| **Reviewed by** | Senior Android App Developer & Business Analyst |
| **Source Documents** | `idea.md` (Project Proposal), `PRD.md` (v1.0) |
| **Review Date** | November 2026 |
| **PRD Version Reviewed** | 1.0 |
| **Analysis Version** | 2.0 — Final |
| **Team** | Md. Mahfuzur Rahman Milon (241071019) · Sumaia Abrar (241071010) |
| **Status** | ⏳ Awaiting author confirmation on Critical and High-priority gaps |

---

## Table of Contents

1. [PRD Overview](#1-prd-overview)
2. [User Types](#2-user-types)
3. [Application Goals](#3-application-goals)
4. [Functional Requirements Assessment](#4-functional-requirements-assessment)
5. [Non-Functional Requirements Assessment](#5-non-functional-requirements-assessment)
6. [Missing Flows, Edge Cases & Error Handling](#6-missing-flows-edge-cases--error-handling)
7. [Gap Analysis — Prioritised](#7-gap-analysis--prioritised)
8. [Consistency Check](#8-consistency-check)
9. [Clarification Questions](#9-clarification-questions)
10. [PRD Readiness Scorecard](#10-prd-readiness-scorecard)
11. [Final Recommendation](#11-final-recommendation)

---

## 1. PRD Overview

### 1.1 Purpose

The **Student Life Progress & Self-Improvement Tracker** solves a real and common problem: university students have no unified, private, data-driven mirror of their own daily lifestyle. Existing habit apps track one or two habits; this application tracks **12 life areas simultaneously**, converts daily responses into a scored metric, and builds a 30-day self-improvement story.

The app closes the feedback loop that is missing from student life:

> *Daily behaviour → Data → Score → Pattern recognition → Personalised insight → Improved habits*

### 1.2 Project Scope

| Dimension | Detail |
|---|---|
| **Platform** | Android 8.0+ (API 26+) only. iOS and web are out of scope for v1. |
| **User base** | University and college students (self-managed; no institutional tie-in) |
| **Core loop** | Daily check-in → Daily Score → Weekly Result → 30-Day Monthly Report |
| **Data boundary** | Entirely private, per-user, stored in Cloud Firestore |
| **Academic constraint** | 12-week build timeline, two-person team, CSE 3210 course deliverable |
| **Insight model** | Rule-based (not AI/ML); insights are lifestyle reflections, not diagnoses |

### 1.3 Vision

Turn the student's own daily behaviour data into a personalised, non-judgmental feedback loop — without requiring a coach, counsellor, or any third party.

> *"Your life. Your data. Your progress."*

### 1.4 Mission Statement

> *Observe Yourself → Understand Yourself → Improve Yourself*

### 1.5 Core Philosophy

| Principle | Explanation |
|---|---|
| **Privacy-first** | Each student's data lives exclusively under their own Firebase user path and is never visible to peers or instructors |
| **Honest self-reporting** | The app rewards consistency, not perfection; accuracy depends on the student |
| **Non-judgmental** | Life Stages exist to motivate self-awareness, not to rank or shame students |
| **Data-based, not prescriptive** | All insights are reflections derived from the student's own recorded activity — not medical, psychological, or guaranteed predictions |

### 1.6 Objectives

1. Make daily self-observation effortless — 12-item checklist designed for a ~2-minute daily completion.
2. Surface weekly patterns before bad habits compound over time.
3. Deliver a 30-day "Life Stage" classification that is motivating, not ranking.
4. Protect student privacy absolutely — no peer visibility, no faculty access, no third-party sharing.
5. Demonstrate full-stack Android engineering skills (Kotlin, Firebase, MVVM) for academic assessment.
6. Encourage multi-cycle use through history preservation and month-vs-month comparison.

### 1.7 Technical Stack

| Layer | Choice | Notes |
|---|---|---|
| Platform | Android 8.0+ (API 26+) | Covers ~95%+ of active Android devices globally |
| Language | Kotlin | — |
| IDE | Android Studio | — |
| UI | XML layouts + Material Design | UI mockups designed first in Figma |
| Architecture | MVVM | Scoring and insight logic in isolated, unit-testable classes |
| Auth & Database | Firebase Authentication + Cloud Firestore | — |
| Offline support | Firestore SDK built-in offline persistence | — |
| Notifications | Android Notification System | — |
| Version Control | Git / GitHub | — |

### 1.8 Data Architecture (Summary)

Each student's data is stored under a private Firestore path: `users/{userId}/...`

| Firestore Collection | Contents |
|---|---|
| `users` | Profile: userId, name, email, university, department, startDate, endDate, target times |
| `dailyActivities` | One document per day — all 12 checklist field values + self-reflection note |
| `dailyScores` | Daily Score % and per-area point breakdown for each day |
| `weeklySummaries` | Weekly average, best/lowest day, area breakdown per week |
| `monthlyResults` | Life Score, consistency %, Life Stage, strengths, weaknesses, Life Insight |

---

## 2. User Types

### 2.1 Identified Users

| User Type | Role | In-App Access | v1 Status |
|---|---|---|---|
| **University Student** | Primary actor — registers, runs 30-day cycles, completes daily checklist, reads results | Full application | ✅ In scope |
| **College Student** | Secondary actor — same UX as university student; simpler schedule (fewer class-attendance scenarios) | Full application | ✅ In scope |
| **Administrator** | Future role — manages activity categories, views anonymous aggregated statistics | Separate admin panel (not built) | ❌ Deferred to v2 |
| **Faculty / Instructor** | No role in this application | None | ❌ Explicitly excluded |
| **Parent / Guardian** | No role in this application | None | ❌ Explicitly excluded |
| **Third-party / API consumer** | No data sharing, API access, or external integrations | None | ❌ Explicitly excluded |

### 2.2 Identified User Gaps

| Gap | Priority | Why It Matters |
|---|---|---|
| **Account deletion flow** | High | A student who wants to permanently delete their account and all personal data has no defined path. This is a data ownership and privacy concern. |
| **Multi-device login behaviour** | Medium | Firebase Auth supports concurrent sessions across devices. The PRD does not define whether this is allowed or how data syncs when the same account is active on two phones. |
| **Shared device scenario** | Low | Two students using the same phone with different accounts — the PRD assumes one-account-per-device but does not state this explicitly. |

---

## 3. Application Goals

### 3.1 Problems Being Solved

| Problem | How the App Addresses It |
|---|---|
| Students don't know where their time actually goes | 12-area daily checklist forces conscious, structured daily reflection |
| Single-habit apps give no holistic picture of student life | All 12 life areas are scored together into one unified Daily Score |
| No consistent, structured feedback loop exists | Daily Score → Weekly Result → Monthly Report closes the loop at three time horizons |
| Difficult to spot weak habits before they compound | Strengths / Weaknesses section in Monthly Report identifies the top 3 and bottom 3 life areas |
| No personalised improvement guidance without an external coach | Rule-based Life Insight + 2–3 improvement suggestions, generated entirely from the student's own data |
| Privacy fear prevents honest tracking | All records are private and Firestore-secured; no peer or faculty visibility |

### 3.2 Goal Alignment Check

| Objective | Covered in PRD? | Assessment |
|---|---|---|
| Effortless daily observation (~2 min) | ✅ Yes | 12-item checklist with partial credit and off-day rules is well-designed |
| Week-level pattern detection | ✅ Yes | Weekly Result with area breakdown and focus tip is defined |
| Meaningful 30-day report | ✅ Yes | Life Score, Life Stage, Insight, and Suggestions are all present |
| Habit consistency measurement | ✅ Yes | Consistency = days tracked ÷ 30, shown alongside Life Stage |
| Student privacy | ✅ Yes | Firebase Security Rules and per-user Firestore paths are specified |
| Motivation and engagement | ⚠️ Partial | Streak counter is mentioned, but milestone values and engagement design are not fully defined |
| Multi-cycle progression | ✅ Yes | History preserved, month-vs-month comparison is mentioned |

---

## 4. Functional Requirements Assessment

**Legend:** ✅ Complete · ⚠️ Partially defined / unclear · ❌ Missing

---

### 4.1 Authentication & Identity

| Requirement | Status | Notes |
|---|---|---|
| Email + password registration | ✅ Complete | Firebase Authentication — industry standard |
| Login / Logout | ✅ Complete | Secure session management stated |
| Password recovery | ✅ Complete | Firebase "forgot password" email flow |
| Unique User ID (auto-assigned) | ✅ Complete | Used as the Firestore namespace for all user data |
| User profile (name, university, department, target times) | ✅ Complete | Stored in `users` collection |
| **Input validation rules** | ❌ Missing | No password strength rules, email format enforcement, or maximum field length defined. This is needed to prevent bad data and security issues. |
| **Email verification requirement** | ❌ Missing | Firebase supports requiring email verification before login is permitted. The PRD does not state whether unverified accounts can access the app. |
| **Session expiry policy** | ❌ Missing | No definition of how long an authenticated session remains valid, or what triggers re-authentication. |
| **Account deletion flow** | ❌ Missing | No mechanism defined for a student to permanently delete their account and all associated Firestore data. |

---

### 4.2 30-Day Cycle Management

| Requirement | Status | Notes |
|---|---|---|
| Student selects a start date | ✅ Complete | — |
| 30-day cycle structure | ✅ Complete | Weeks 1–4 (Days 1–28) + Final Stretch (Days 29–30) clearly defined |
| Multi-cycle support with preserved history | ✅ Complete | Old cycle data is kept; month-vs-month comparison is supported |
| **Cycle start date constraints** | ❌ Missing | Can the student set a past date as the start (e.g., retroactive cycle)? Can they set a future date? Both scenarios need defined behaviour. |
| **Cycle pause behaviour** | ❌ Missing | No mechanism defined if a student becomes ill, travels, or is unavailable for multiple days. Does the cycle freeze, or does time continue and those days count as missed? |
| **Cycle abandon / reset behaviour** | ❌ Missing | No mechanism defined for cancelling an active cycle mid-way and starting a fresh one. |
| **Backdating entries beyond 1 day** | ❌ Missing | The grace window permits only filling yesterday's entry. Longer absences (illness, exams) are not addressed. |

---

### 4.3 Daily Checklist & Scoring

| Requirement | Status | Notes |
|---|---|---|
| 12-item checklist fully defined | ✅ Complete | All items, input types, and point weights are specified |
| Daily Score formula | ✅ Complete | `(Points Achieved ÷ Maximum Available Points) × 100` |
| Partial credit for fractional items | ✅ Complete | e.g., 4/5 classes = 80% of that item's points |
| Off-day handling (Items 2 & 3 excluded from max) | ✅ Complete | Student is not penalised for declared holidays/weekends |
| Missed day counts as 0% in monthly average | ✅ Complete | — |
| Grace window: fill in yesterday's entry | ✅ Complete | One-day lookback is permitted |
| **Scoring rule — Item 5 (Social Interaction)** | ❌ Missing | The input is "number of meaningful interactions." No threshold is defined: how many interactions = full 6 points? Is 1 interaction = 1 point (capped at 6)? Or is there a minimum to earn any points? |
| **Scoring rule — Item 8 (Skill Development)** | ❌ Missing | The input is "minutes spent." No scale is defined: how many minutes = full 10 points? Is it linear (e.g., 60 min = 10 pts)? Or tiered (e.g., 0–14 min = 0, 15–29 min = 5, 30+ min = 10)? |
| **Scoring rule — Item 10 (Social Media/News Control)** | ❌ Missing | The input is a 3-way selection: "Controlled / Useful / Excessive." The point values for each option are not defined. Assumed mapping (needs confirmation): Controlled = 6, Useful = 3, Excessive = 0. |
| **Checklist edit after same-day submission** | ❌ Missing | The PRD only defines editing *yesterday's* entry. Whether the student can re-open and correct today's already-submitted checklist is not addressed. |
| **Duplicate submission prevention** | ❌ Missing | No mechanism stated to prevent a student from submitting the same day's checklist twice, which would corrupt daily score data. |
| **Character limits for text input fields** | ❌ Missing | Items 6 (Daily Learning note) and 11 (Self-Reflection journal) accept free text. No maximum character length is defined, which creates an uncontrolled Firestore write size risk. |
| **Item 4 — Inclusivity of "Religious / Personal Discipline"** | ⚠️ Needs decision | This field is a Yes/No item worth 8 points. For students who do not practice a religion, this field may feel exclusionary. The PRD does not state whether the label is adjustable, skippable, or intended to cover general personal discipline (e.g., morning routine, focus practice) for all students. |
| **Item 7 — Physical Activity: "Yes/No + minutes"** | ⚠️ Partially defined | The scoring weight is 10 points. If the student answers "Yes" but records 0 minutes, or answers "No" with minutes > 0, is there a conflict resolution rule? |

---

### 4.4 Daily Results View

| Requirement | Status | Notes |
|---|---|---|
| Today's Daily Score (%) | ✅ Complete | — |
| Completed vs. missed checklist items list | ✅ Complete | — |
| Consecutive-day streak counter | ✅ Complete | — |
| **Per-item score breakdown** | ❌ Missing | The Daily Result shows a total score only. Whether the student can see which specific item cost them points (e.g., "You missed Physical Activity: −10 pts") is not defined. This detail is important for acting on feedback. |
| **Motivational or contextual micro-feedback** | ❌ Missing | No mention of any score-based message on the daily result screen (e.g., "Great day! You scored 85%" or "Missed 3 areas — try again tomorrow"). Even a simple encouragement message was not specified. |

---

### 4.5 Weekly Results

| Requirement | Status | Notes |
|---|---|---|
| Weekly average score and days tracked (e.g., "6 of 7") | ✅ Complete | — |
| Best day and lowest day of the week | ✅ Complete | — |
| Per-area performance breakdown (strong vs. weak) | ✅ Complete | — |
| Week-over-week score change (▲/▼ indicator) | ✅ Complete | — |
| Running consecutive-day streak | ✅ Complete | — |
| One focus tip for the upcoming week | ✅ Complete | — |
| **Focus tip generation logic** | ❌ Missing | The PRD states a focus tip is provided but does not define how it is chosen. Is it rule-based (weakest area this week gets a tip)? Is it hardcoded per life area? This logic must be specified before Week 7–8 development. |
| **Week 1 baseline — Δ display edge case** | ⚠️ Unclear | On the Week 1 report, there is no previous week to compare against. The PRD does not define what the week-over-week change indicator shows in this case. Options: hide the indicator, or show "Baseline — no prior week." |
| **Days 29–30 Final Stretch screen** | ⚠️ Partially defined | The idea document mentions a "Final Stretch" summary included in the Monthly Result, but neither document defines the Final Stretch's standalone screen content, layout, or whether it has its own view or is merged into the Monthly Report. |

---

### 4.6 Monthly Result (30-Day Report)

| Requirement | Status | Notes |
|---|---|---|
| Life Score (average of 30 Daily Scores) | ✅ Complete | — |
| Habit Consistency % (days tracked ÷ 30) | ✅ Complete | Shown alongside Life Stage as a caveat for low-data scenarios |
| Life Stage (1–10 classification) | ✅ Complete | Stage 1 = Critical / Highly Unbalanced; Stage 10 = Exceptional Self-Development |
| Top 3 strengths (by area completion rate) | ✅ Complete | — |
| Bottom 3 weaknesses (by area completion rate) | ✅ Complete | — |
| Progress trend chart (4 weeks + Final Stretch) | ✅ Complete | — |
| Life Insight paragraph (rule-based) | ✅ Complete | One example provided |
| Improvement suggestions (2–3 actions) | ✅ Complete | — |
| **Life Stage score boundaries** | ❌ Missing | **This is a blocker.** The 10 Life Stage names are known, but the Life Score (%) range that maps to each stage is completely undefined. The classification engine cannot be built without this table. |
| **Complete Life Insight rule table** | ❌ Missing | **This is a blocker.** Only one example rule is given ("high academic + low physical + low skill"). The full set of area-combination conditions and their corresponding insight text templates must be provided before Week 9 development. |
| **Minimum consistency threshold for Life Insight** | ❌ Missing | If a student filled in only 8 of 30 days, is a Life Insight generated? Is it shown with a strong caveat ("Not enough data for a reliable insight")? Or is there a minimum threshold (e.g., 15 days) below which the insight is suppressed? |
| **Tie-breaking for strengths/weaknesses** | ⚠️ Unclear | If two life areas have the same completion rate, the rule for ranking them in the top-3 or bottom-3 is not defined. |

---

### 4.7 Notifications & Reminders

| Requirement | Status | Notes |
|---|---|---|
| Daily reminder notification at a user-configurable time | ✅ Complete | — |
| Streak milestone alerts | ✅ Mentioned | — |
| **Android 13+ notification permission (POST_NOTIFICATIONS)** | ❌ Missing | Android 13 (API 33) and above require explicit runtime permission for notifications. The PRD does not define when or how this permission is requested. Without handling this, the app will silently fail to send any notifications on most new devices. |
| **Streak milestone values** | ❌ Missing | At which streak lengths does the app send a milestone alert? The PRD mentions the feature but defines no values (e.g., 7, 14, 21, 30 days). Cannot implement without these. |
| **Late check-in reminder (secondary nudge)** | ❌ Missing | Does the app send a second reminder if the student has not completed their checklist by a defined cut-off time (e.g., 10:00 PM)? This feature is not mentioned but is common in habit tracker apps. |
| **Notification for available Weekly/Monthly Result** | ❌ Missing | Does the app notify the student when a new Weekly Result or the Monthly Result becomes unlocked? The PRD defines when results unlock but does not mention a notification for it. |

---

### 4.8 Data & History

| Requirement | Status | Notes |
|---|---|---|
| Full history of daily entries, scores, and reports stored in Firestore | ✅ Complete | — |
| Offline support (entries made offline sync when connectivity returns) | ✅ Mentioned | Firestore SDK has built-in offline persistence; feasible without extra work |
| Month-vs-month comparison across multiple cycles | ✅ Mentioned | — |
| **Offline conflict resolution** | ❌ Missing | If a student enters data offline and the same account is used on another device during that offline period, Firestore's last-write-wins behaviour may silently overwrite data. The PRD does not address this. |
| **Data retention policy** | ❌ Missing | No maximum number of stored cycles is defined. For an academic project using Firebase free tier, unbounded growth could exceed Firestore storage limits. |
| **Firebase free-tier capacity awareness** | ⚠️ Advisory | Firestore free tier: 1 GB storage, 50,000 reads/day, 20,000 writes/day. For testing and academic use with a small number of users, this is sufficient — but it should be validated against the expected daily write count per user (~12–20 Firestore writes per daily check-in). |

---

## 5. Non-Functional Requirements Assessment

### 5.1 Performance

> No performance targets are defined in the PRD. The following are recommended baselines appropriate for an academic Android project.

| Aspect | PRD Coverage | Recommended Target |
|---|---|---|
| Cold start (app launch to home screen) | ❌ Not defined | < 3 seconds on a mid-range Android device |
| Checklist submission & local score calculation | ❌ Not defined | < 1 second (all scoring logic is local/client-side) |
| Firestore data sync (write + confirmation) | ❌ Not defined | < 2 seconds on a 4G connection |
| Chart rendering (30-day line chart) | ❌ Not defined | < 1.5 seconds after data is loaded |
| App responsiveness during offline mode | ❌ Not defined | All local features (checklist entry, score view) must remain fully usable with no network connection |

### 5.2 Security

| Aspect | PRD Coverage | Assessment |
|---|---|---|
| Firestore Security Rules (per-user path enforcement) | ✅ Mentioned | Strong — `users/{userId}` path ensures data isolation |
| Firebase Authentication | ✅ Used | Industry standard; session tokens managed by Firebase SDK |
| Data in transit | ✅ Implicit | Firebase SDK uses HTTPS/TLS by default; no additional configuration needed |
| Data at rest encryption | ✅ Implicit | Google Cloud encrypts Firestore data at rest automatically |
| **Input sanitisation for free-text fields** | ❌ Not defined | Journal (Item 11) and Learning Note (Item 6) accept free text. If this text is ever rendered in a WebView or shared via HTML, it must be sanitised. For Firestore storage and standard TextView display, the risk is low but should be acknowledged. |
| **Certificate pinning** | — | Not required for academic scope; Firebase SDK handles certificate validation internally. Not a gap for v1. |

### 5.3 Usability

| Aspect | PRD Coverage | Assessment |
|---|---|---|
| Material Design compliance | ✅ Specified | Standard Material components ensure consistent, familiar UI |
| Figma UI mockups planned (Weeks 1–2) | ✅ Specified | Good practice; design-first reduces rework |
| **Accessibility (TalkBack, font scaling)** | ❌ Not defined | No mention of screen reader support or dynamic font size support. While not mandatory for academic scope, content descriptions on interactive elements are a basic Android best practice. |
| **First-time user onboarding / tutorial** | ❌ Not defined | A new student who opens the app for the first time may not understand what the 12 checklist items mean, how the scoring formula works, or what a Life Stage is. No onboarding, tooltip, or help screen is defined. |
| **Minimum screen size** | ❌ Not defined | Android 8.0+ covers a wide range of screen sizes. The app should be tested on at least a small phone (5-inch / 360dp width) and a standard phone (6-inch / 400dp width). Tablet layout is assumed out of scope but not stated. |

### 5.4 Reliability

| Aspect | PRD Coverage | Assessment |
|---|---|---|
| Offline data entry support | ✅ Mentioned | Firestore SDK offline persistence handles this natively |
| Planned testing coverage | ✅ Mentioned | Unit tests (scoring), functional, UI, DB, authentication, and UAT with sample students |
| **Checklist draft auto-save (crash protection)** | ❌ Not defined | If the app crashes or the student navigates away mid-checklist, unsaved answers are lost. No auto-save or draft persistence mechanism is defined. |
| **Graceful error handling (Firestore failures)** | ❌ Not defined | If a Firestore write fails (timeout, auth error), the student should see a clear error message — not a silent failure. No error state UI is defined. |

### 5.5 Scalability

| Aspect | Assessment |
|---|---|
| Single-user data isolation | ✅ Well-designed; Firestore user paths scale naturally |
| Multi-cycle data growth per user | ✅ Supported; each cycle adds ~30 daily documents + summaries. For the academic scope (small user count), this is entirely manageable. |
| Backend scalability | Firebase auto-scales; suitable for academic and early real-world use |

### 5.6 Compatibility

| Aspect | PRD Coverage | Assessment |
|---|---|---|
| Minimum Android version | ✅ Android 8.0 (API 26) | Appropriate; covers the vast majority of devices in use |
| **Maximum Android version tested** | ❌ Not stated | The app should be validated on the latest Android release (Android 15, API 35) to catch deprecated API usage |
| **Screen density support** | ❌ Not stated | Should provide drawable resources for mdpi, hdpi, xhdpi, xxhdpi, and xxxhdpi screen densities |
| **Tablet layout** | ❌ Not stated | Assumed out of scope, but should be explicitly stated as such to avoid ambiguity during testing |

---

## 6. Missing Flows, Edge Cases & Error Handling

This section consolidates the **missing flow, edge case, error handling, security, validation, permission, notification, and exception** scenarios identified across all requirements.

### 6.1 Missing User Flows

| Flow | Gap | Impact |
|---|---|---|
| **Account deletion flow** | Student has no path to permanently delete their account and all data | Privacy / data ownership |
| **Cycle abandonment flow** | No defined path to cancel an active cycle mid-way | Student lifecycle incomplete |
| **Error state flows** | No screens or states defined for Firestore write failures, auth errors, or network unavailability during submission | Reliability and UX |
| **Final Stretch (Days 29–30) screen** | Mentioned in the idea document but has no defined screen layout or content | Development blocked for Days 29–30 |
| **First-time onboarding flow** | No tutorial, tooltip, or guidance screen for new users | Usability risk |

### 6.2 Edge Cases

| Edge Case | Current Handling | Gap |
|---|---|---|
| Student submits checklist twice on the same day | ❌ Not defined | No duplicate prevention mechanism stated |
| All 30 days are off days (no university) | ❌ Not defined | Denominator of scoring formula changes significantly; not addressed |
| Week 1 report — no prior week to compare | ⚠️ Not defined | Δ indicator behaviour on first weekly report is unspecified |
| Life Score tie between two stages (exactly on a boundary) | ❌ Not defined | Stage assignment rule at boundary values is unspecified |
| Strength/weakness tie (two areas with identical completion rates) | ❌ Not defined | Ranking rule for top-3/bottom-3 is unspecified |
| New cycle started before reviewing the Monthly Report | ❌ Not defined | Does the Monthly Report remain accessible after a new cycle begins? |
| Student changes target wake-up/sleep times mid-cycle | ❌ Not defined | Do previously submitted days get re-scored against the new target times? |

### 6.3 Error Handling

| Scenario | Current Handling | Required Response |
|---|---|---|
| Firestore write failure on checklist submission | ❌ Not defined | Show a clear error message; retain the student's filled answers so they are not lost |
| Firebase Auth failure on login | ❌ Not defined | Show a user-friendly error (wrong password, account not found, network error) |
| Network unavailable at app launch | ❌ Not defined | App must load from local Firestore cache; show a subtle offline indicator |
| App crash mid-checklist | ❌ Not defined | Answers entered so far should be auto-saved as a draft |
| Firestore read timeout on Monthly/Weekly Report | ❌ Not defined | Show a retry option; do not display an empty or broken report |

### 6.4 Validation Rules (Undefined)

| Field | Validation Needed |
|---|---|
| Email (Registration) | Valid email format required |
| Password (Registration) | Minimum length (e.g., 8 characters); at least one number or special character |
| Name / University / Department | Non-empty; maximum character length |
| Item 3 — Class Participation | Input must be `0 ≤ attended ≤ total`; both values must be positive integers |
| Item 5 — Social Interaction | Input must be a non-negative integer |
| Item 7 — Physical Activity minutes | If "Yes" is selected, minutes must be > 0 |
| Item 8 — Skill Development minutes | Input must be a non-negative integer |
| Items 6, 11 — Free text | Maximum character limit to be defined (suggested: 500 characters) |
| Cycle start date | Must not be in the future; must not conflict with an already-active cycle |

### 6.5 Permissions

| Permission | Required For | Android Version Consideration |
|---|---|---|
| `POST_NOTIFICATIONS` | Daily reminders and streak milestone alerts | Required at runtime for Android 13 (API 33+); must request via permission dialog |
| `INTERNET` | Firestore sync | Standard; declared in `AndroidManifest.xml` |
| `RECEIVE_BOOT_COMPLETED` | Re-schedule notifications after device restart | Required if notifications use AlarmManager; declared in manifest |

---

## 7. Gap Analysis — Prioritised

### Priority Definitions

| Priority | Meaning |
|---|---|
| 🔴 Critical | Blocks development or will produce incorrect behaviour. Must be resolved before the relevant sprint begins. |
| 🟠 High | Will cause incomplete or broken features if unresolved. Must be resolved before Sprint 1 ends (Week 4). |
| 🟡 Medium | Affects quality or edge-case handling. Should be resolved before testing (Week 10). |
| 🟢 Low | Minor usability or polish. Nice to resolve; can be deferred to bug-fix phase. |

---

### 🔴 Critical Gaps — Block Development

| ID | Gap | Blocked Feature | Why It Matters |
|---|---|---|---|
| **C1** | Life Stage score boundary table (which % range maps to each of the 10 stages) | Monthly Report — Life Stage classification engine | The classification algorithm cannot be written without this table. This is the core business logic of the app. |
| **C2** | Scoring rules for Item 5 (Social Interaction), Item 8 (Skill Development), and Item 10 (Social Media Control) | Daily Score calculation engine | Without defined thresholds and point mappings for these three items, the Daily Score will be incorrect. These items represent 22 of 100 total points. |
| **C3** | Complete Life Insight rule table (all condition-to-insight-text mappings) | Monthly Report — Life Insight generation | Only one example rule is provided. The insight engine requires a complete rule set covering all meaningful area-score combinations. This is needed in Week 9. |
| **C4** | Duplicate submission prevention strategy | Daily Checklist submission | Without this, a student can overwrite the same day's data, corrupting their Daily Score and all downstream weekly/monthly calculations. |
| **C5** | Whether today's submitted checklist can be edited on the same day | Daily Checklist UX and Firestore write logic | Directly affects the UI (show/hide edit button), data model (overwrite vs. versioned records), and scoring recalculation flow. |
| **C6** | Cycle pause, abandon, and reset behaviour | 30-Day Cycle lifecycle | The student's journey through the cycle has no defined resolution for common real-life interruptions (illness, exams, travel). |

---

### 🟠 High Priority Gaps — Must Resolve Before Sprint 1

| ID | Gap | Affected Area | Why It Matters |
|---|---|---|---|
| **H1** | Input validation rules (password strength, email format, field length limits) | Registration / Profile | Missing validation creates security vulnerabilities (weak passwords) and poor data quality (empty names, oversized Firestore documents). |
| **H2** | Email verification requirement | Authentication | Without requiring email verification, any email string — including mistyped ones — creates a permanent account. This affects account recovery. |
| **H3** | Account deletion flow | Privacy / User management | Students have a right to delete their data. The absence of this flow is a data ownership gap. |
| **H4** | Focus tip generation logic (weekly report) | Weekly Result feature | The Weekly Result's focus tip is a defined feature but has no described logic. It cannot be built without a rule or selection mechanism. |
| **H5** | Android 13+ POST_NOTIFICATIONS permission handling | Notifications | On Android 13+ devices (the majority of new devices), the app will silently fail to deliver any notifications without handling this runtime permission. This renders the notification feature non-functional on modern hardware. |
| **H6** | Streak milestone values (which streak lengths trigger an alert) | Notifications | The milestone notification feature cannot be implemented without defined trigger values. |
| **H7** | Cycle start date constraints (past vs. future date behaviour) | 30-Day Cycle setup | Without constraints, a student could create an invalid cycle (future start date, or a start date that conflicts with an active cycle), breaking the day counter logic. |
| **H8** | Minimum consistency threshold for Life Insight generation | Monthly Report | Generating a "personalised" insight from only 5 of 30 days of data is misleading. A minimum threshold or strong caveat must be defined. |

---

### 🟡 Medium Priority Gaps — Resolve Before Testing (Week 10)

| ID | Gap | Affected Area |
|---|---|---|
| **M1** | Week 1 Δ indicator behaviour (no prior week to compare against) | Weekly Result — edge case |
| **M2** | Final Stretch (Days 29–30) screen content and layout | Weekly/Monthly transition screen |
| **M3** | Item 4 label — inclusivity for non-religious students ("Religious / Personal Discipline") | Daily Checklist — UX sensitivity |
| **M4** | Per-item score breakdown on the Daily Result screen | Daily Result — feedback quality |
| **M5** | Life Score tie-breaking rule (when score falls exactly on a stage boundary) | Monthly Report — classification edge case |
| **M6** | Strength/weakness tie-breaking rule (two areas with identical completion rates) | Monthly Report — ranking edge case |
| **M7** | Session expiry policy and multi-device login behaviour | Authentication |
| **M8** | Backdating entries beyond 1-day grace window (illness/travel scenarios) | Cycle management |
| **M9** | Whether the Monthly Report remains accessible after a new cycle is started | Navigation / data access |
| **M10** | Behaviour when target wake-up/sleep times are changed mid-cycle | Cycle management / scoring |
| **M11** | Notification for Weekly/Monthly Result unlock | Notifications — user engagement |
| **M12** | Character limits for free-text fields (Items 6 and 11) | Data model / Firestore write size |
| **M13** | Error state UI (Firestore write failure, auth error, network timeout) | Error handling |
| **M14** | Checklist draft auto-save on app crash or background exit | Reliability / UX |

---

### 🟢 Low Priority Gaps — Nice to Clarify

| ID | Gap | Affected Area |
|---|---|---|
| **L1** | Motivational micro-feedback on the Daily Result screen (e.g., score-based encouragement message) | Daily Result — engagement |
| **L2** | Late check-in secondary nudge notification (e.g., if no check-in by 10 PM) | Notifications |
| **L3** | First-time user onboarding / tutorial screen | New user experience |
| **L4** | Multi-device login and data sync behaviour (same account, two phones) | Authentication / Data |
| **L5** | Shared device scenario (two students, one phone) | Authentication edge case |
| **L6** | Offline conflict resolution for simultaneous writes | Data / Firestore |
| **L7** | Maximum Android version to test against (recommended: Android 15 / API 35) | Compatibility |
| **L8** | Screen density resource requirements (mdpi through xxxhdpi) | UI / Compatibility |
| **L9** | Firebase free-tier capacity validation against expected daily write count | Infrastructure |
| **L10** | Item 7 (Physical Activity) conflict: "No" selected but minutes > 0 | Checklist validation |

---

## 8. Consistency Check

The following cross-checks confirm alignment (or flag conflicts) between the original proposal (`idea.md`), the PRD (`PRD.md`), and this analysis.

| Check | Finding |
|---|---|
| Scoring formula consistent across both documents | ✅ Consistent — `(Points Achieved ÷ Max Available) × 100` |
| 12-item checklist items and weights consistent | ✅ Consistent across both documents |
| Week structure (1–7, 8–14, 15–21, 22–28, Days 29–30 as Final Stretch) | ✅ Consistent |
| Life Stage count (10 stages) | ✅ Consistent — but boundaries are missing in both documents |
| Monthly Result elements | ✅ Consistent across both documents |
| "Recommended" features (streak, charts, offline, profile update) listed as v1 in PRD | ✅ Consistent with idea.md classification |
| Off-day handling — only Items 2 & 3 excluded | ✅ Consistent in PRD; implied in idea.md |
| Grace window — 1 day only | ✅ Consistent |
| Firestore collections — `dailyActivities`, `dailyScores`, `weeklySummaries`, `monthlyResults` | ✅ Consistent with idea.md data design |
| `requerment-validation.md` keyword categories | ✅ All 8 categories (Missing Flow, Edge Case, Error Handling, Security, Validation, Permission, Notification, Exception) are now fully covered in Sections 5, 6, and 7 of this analysis |
| "Final Stretch" (Days 29–30) — mentioned in idea.md, partially in PRD | ⚠️ Conflict — idea.md says Days 29–30 are "included in the Monthly Result" as a summary; PRD mentions a "Final Stretch" section in the trend chart but no standalone screen. Screen inventory in PRD does not list a Final Stretch screen. Needs clarification. |
| Point weights can be "tuned during testing" (idea.md, Section 7) | ⚠️ Advisory — The PRD does not carry this caveat forward. If weights are adjusted during testing, all unit tests for scoring must be updated accordingly. |

---

## 9. Clarification Questions

The following questions are consolidated, deduplicated, and ordered by priority. No question has been included unless it directly unblocks a development task or resolves an identified gap.

> **Q1 — 🔴 Life Stage Score Boundaries (Critical)**
> What Life Score (%) range maps to each of the 10 Life Stages?
> Please provide the complete boundary table, e.g.:
> | Stage | Name | Life Score Range |
> |---|---|---|
> | 1 | Critical / Highly Unbalanced | 0% – ?% |
> | … | … | … |
> | 10 | Exceptional Self-Development | ?% – 100% |

---

> **Q2 — 🔴 Scoring Rules for Items 5, 8, and 10 (Critical)**
>
> - **Item 5 (Social Interaction — 6 pts):** How many meaningful interactions earn full points? Is there a cap or a linear scale (e.g., 1 interaction = 2 pts, max at 3+)?
> - **Item 8 (Skill Development — 10 pts):** How many minutes = full 10 points? Is scoring linear or tiered (e.g., 0–14 min = 0, 15–29 min = 5, 30+ min = 10)?
> - **Item 10 (Social Media/News Control — 6 pts):** What point value is assigned to each selection? Proposed assumption (please confirm or correct): Controlled = 6, Useful = 3, Excessive = 0.

---

> **Q3 — 🔴 Life Insight Rule Table (Critical)**
> Only one example Life Insight rule is provided. Please supply the complete set of area-combination conditions and their corresponding insight text templates — or at minimum 6–8 representative rules covering the most common student profiles (e.g., high academic + low physical; low academic + high social; balanced across all areas; very low overall).

---

> **Q4 — 🔴 Checklist Edit Policy (Critical)**
> After a student submits today's checklist, can they re-open it and make corrections on the same day?
> - **Option A:** Yes — the submission is treated as a draft until midnight, allowing same-day edits.
> - **Option B:** No — once submitted for today, the entry is locked. Only yesterday's entry can be edited (grace window).

---

> **Q5 — 🔴 Duplicate Submission Prevention (Critical)**
> What prevents a student from submitting today's checklist a second time?
> - **Option A:** The app detects an existing document for today's date in Firestore and prevents a new submission (replace with an edit flow instead).
> - **Option B:** The Submit button is hidden once today's entry is recorded.
> Please confirm the intended approach.

---

> **Q6 — 🔴 Cycle Lifecycle — Pause, Abandon, and Reset (Critical)**
> - Can a student **pause** an active cycle mid-way (e.g., during exams or illness)? If yes, does the 30-day counter freeze, or do missed days count as 0%?
> - Can a student **abandon** an active cycle and start a new one before Day 30?
> - If a student abandons a cycle, is the partial data saved to history or discarded?

---

> **Q7 — 🟠 Account Deletion (High)**
> Should the app provide a "Delete My Account" option that removes the student's Firebase Auth account and all Firestore data under their user path?

---

> **Q8 — 🟠 Email Verification (High)**
> Should the app require email verification before a newly registered student can log in and start their cycle? Or is unverified access permitted?

---

> **Q9 — 🟠 Focus Tip Generation Logic — Weekly Report (High)**
> How is the weekly focus tip selected?
> - **Option A:** Rule-based — the weakest life area that week automatically generates a tip from a predefined tip library.
> - **Option B:** Hardcoded — each of the 12 areas has a fixed tip text.
> - **Option C:** Other — please describe.

---

> **Q10 — 🟠 Android 13+ Notification Permission (High)**
> When should the app request the `POST_NOTIFICATIONS` runtime permission?
> - **Option A:** At first app launch, before the student sets any reminder.
> - **Option B:** Only when the student navigates to Settings and enables the daily reminder toggle.

---

> **Q11 — 🟠 Streak Milestone Values (High)**
> At which streak lengths should the app send a milestone notification? (e.g., 7 days, 14 days, 21 days, 30 days — or other values?)

---

> **Q12 — 🟡 Week 1 Δ Indicator (Medium)**
> On the Week 1 Weekly Report, there is no previous week to compare against. What should the week-over-week change indicator display?
> - **Option A:** Hide the Δ indicator entirely.
> - **Option B:** Show a label such as "Baseline week — no prior data to compare."

---

> **Q13 — 🟡 Final Stretch Screen (Days 29–30) (Medium)**
> The idea document states that Days 29–30 form a "Final Stretch" that is included in the Monthly Result. The PRD's screen inventory does not list a standalone Final Stretch screen. Please confirm:
> - Is the Final Stretch a separate screen the student can visit, or is it only reflected in the Monthly Report chart?
> - If it is a separate screen, what content does it show?

---

> **Q14 — 🟡 Item 4 — Religious / Personal Discipline Label (Medium)**
> For students who do not practice a religion, should Item 4 be:
> - **Option A:** Relabelled as "Personal Discipline" for all users (broader and more inclusive).
> - **Option B:** Kept as "Religious / Personal Discipline" and interpreted broadly as covering any personal morning or discipline practice.
> - **Option C:** Made optional/skippable (points removed from maximum if skipped, like off-day handling).

---

> **Q15 — 🟡 Minimum Consistency for Life Insight (Medium)**
> If a student's habit consistency is very low (e.g., fewer than 15 of 30 days tracked), should the Life Insight:
> - **Option A:** Still be generated, but displayed with a prominent caveat ("Based on limited data — results may not be reliable").
> - **Option B:** Not be generated at all; instead show a message: "Not enough data to generate a reliable insight."
> Please also define the minimum threshold (e.g., 15 days).

---

## 10. PRD Readiness Scorecard

| Dimension | Rating | Assessment |
|---|---|---|
| **Clarity of purpose & vision** | ⭐⭐⭐⭐⭐ | Exceptionally clear concept, mission, and philosophy |
| **User type definition** | ⭐⭐⭐⭐☆ | Primary and secondary users well-defined; account deletion and multi-device edge cases missing |
| **Functional requirements — core loop** | ⭐⭐⭐⭐☆ | Authentication, cycle, checklist structure, weekly/monthly framework are solid |
| **Functional requirements — business logic** | ⭐⭐☆☆☆ | Life Stage boundaries, 3 scoring rules, and Life Insight rule table are all undefined — these are core algorithms |
| **User flows — happy path** | ⭐⭐⭐⭐☆ | 5 key flows mapped clearly; error flows, edge cases, and the Final Stretch flow are absent |
| **Non-functional requirements** | ⭐⭐☆☆☆ | Performance, compatibility, and accessibility targets are almost entirely absent |
| **Privacy & ethics** | ⭐⭐⭐⭐⭐ | Strong, explicit, and well-considered throughout |
| **Out-of-scope definition** | ⭐⭐⭐⭐⭐ | Very clearly bounded; deferred features are well-categorised |
| **Gap analysis completeness** | ⭐⭐⭐⭐⭐ | 6 Critical, 8 High, 14 Medium, 10 Low gaps identified and prioritised |
| **Overall build readiness** | ⭐⭐⭐☆☆ | The app's UI skeleton and auth flow can begin, but the scoring engine and monthly report cannot be built until C1–C3 are resolved |

---

## 11. Final Recommendation

### What Is Ready to Build Now (Weeks 3–4)
The following can begin without resolving any gaps:
- Firebase project setup, Authentication flow (Registration, Login, Logout, Password Recovery)
- User profile screen and Firestore user document structure
- 30-day cycle creation screen (with the caveat that start-date constraints, Q7, should be resolved early in this sprint)
- Home Dashboard shell (day counter, placeholder score)

### What Cannot Begin Without Answers
| Sprint | Blocked Feature | Requires |
|---|---|---|
| Weeks 5–6 | Daily Score calculation engine | Q2 (scoring rules for Items 5, 8, 10) |
| Weeks 5–6 | Checklist submission flow | Q4 (edit policy) + Q5 (duplicate prevention) |
| Weeks 7–8 | Weekly Result — focus tip | Q9 (tip generation logic) |
| Weeks 7–8 | Weekly Result — Δ indicator | Q12 (Week 1 baseline behaviour) |
| Week 9 | Life Stage classification | Q1 (stage score boundaries) |
| Week 9 | Life Insight generation engine | Q3 (complete rule table) + Q15 (minimum consistency threshold) |

### Recommended Next Step
**Resolve the 6 Critical gaps (Q1–Q6) and 8 High-priority gaps (Q7–Q11) in one focused review session with the project authors before Week 3 development begins.** Document the agreed answers directly in the PRD as a revision, so the scoring and insight engines can be built against a fixed specification.

---

> **Document Status:** This analysis is complete and ready for author review. No requirement has been marked as finalised where author confirmation is still pending. All identified gaps reflect genuine missing or ambiguous information from the source documents — no enterprise-level requirements have been added beyond the academic project's scope.
>
> *Next action: Author reviews and answers Questions Q1–Q15, then updates PRD.md accordingly.*
