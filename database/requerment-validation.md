# Requirement Validation Report
## Student Life Progress & Self-Improvement Tracker
### Android Mobile Application — CSE 3210 · SMUCT

---

| Field | Detail |
|---|---|
| **Source Document Reviewed** | `PRD.md` Version 1.0 |
| **Review Date** | November 2026 |
| **Reviewed by** | Senior Android App Developer & Business Analyst |
| **Status** | ⏳ Pending author confirmation on flagged items |

---

## How to Read This Report

Each section below maps to one validation category. Every finding is classified as:

- ✅ **Defined** — the PRD clearly covers this requirement
- ⚠️ **Partial** — the PRD mentions it but leaves critical details undefined
- ❌ **Missing** — not addressed in the PRD at all

**Priority levels:**
- 🔴 **Critical** — blocks development or causes incorrect behaviour
- 🟠 **High** — causes broken or incomplete features if unresolved
- 🟡 **Medium** — affects quality or edge-case correctness
- 🟢 **Low** — minor usability or polish concern

---

## 1. Missing Flows

Flows describe the step-by-step paths a user takes through the application. The PRD defines five happy-path flows. The following flows are missing or incomplete.

---

### 1.1 Account Deletion Flow
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** The PRD defines Registration, Login, Logout, and Password Recovery flows.

**What is missing:** There is no flow for a student who wants to permanently delete their account and all personal data. The PRD does not define:
- Where the "Delete Account" option lives (Settings screen is listed but its options are limited to Edit Profile, Update Times, Set Reminder, and Logout).
- What happens to Firestore data (`dailyActivities`, `dailyScores`, `weeklySummaries`, `monthlyResults`) when an account is deleted.
- Whether a confirmation step is required before deletion is executed.

**Why it matters:** Data ownership is a core privacy expectation. A student must be able to remove their data. Without this flow, the app has no mechanism for data erasure — which is also important for GDPR-equivalent data rights.

---

### 1.2 Cycle Abandonment / Reset Flow
**Status:** ❌ Missing | **Priority:** 🔴 Critical

**What is defined:** The PRD defines a cycle start flow and a "Start New Cycle" flow after Day 30 completion.

**What is missing:** There is no flow for a student who wants to cancel an in-progress cycle (e.g., the student started on the wrong date, or decides to restart). The following are undefined:
- Can the student abandon an active cycle before Day 30?
- If abandoned, is partial cycle data preserved in history or discarded?
- After abandonment, can the student immediately start a new cycle?
- Is there a confirmation dialog before abandonment to prevent accidental data loss?

**Why it matters:** Without this flow, a student who starts a cycle incorrectly is permanently locked in until Day 30. This is a significant UX gap that will surface in user testing.

---

### 1.3 Cycle Pause / Resume Flow
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** Missed days count as 0% and affect the monthly average. A one-day grace window allows filling in yesterday's entry.

**What is missing:** There is no mechanism for a student who needs to pause the cycle for a multi-day period (illness, travel, exams). The PRD does not define:
- Whether the cycle timer can be paused so that the 30-day counter freezes.
- Or whether the cycle always runs in real time, with missed days counted as 0%.
- The maximum number of days a student can backfill (grace window is 1 day — what about longer absences?).

**Why it matters:** A rigid no-pause policy could demotivate students after a forced break, as they would see multiple 0% days destroy their monthly score despite circumstances outside their control.

---

### 1.4 Error State Flows
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** The PRD describes all happy-path flows. Firebase and Firestore are the backend.

**What is missing:** No error state flows are defined for:
- Firestore write failure during checklist submission — the student filled out all 12 items and tapped Submit, but the write fails.
- Firebase Authentication failure — wrong password, account not found, or network error during login.
- Network unavailability at app launch — the app must load from local Firestore cache but no "offline mode" UI state is defined.
- Firestore read failure on the Weekly or Monthly Report screen — partial or empty data displayed with no retry option.

**Why it matters:** Without error flows, the UI has no defined recovery path. The student sees a broken or empty screen with no explanation and no action to take.

---

### 1.5 First-Time User Onboarding / Tutorial Flow
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** The Registration and Cycle Setup screens are defined. After cycle setup, the student lands on the Home Dashboard.

**What is missing:** There is no onboarding, tooltip, walkthrough, or help screen for first-time users. A new student who opens the app for the first time does not know:
- What the 12 checklist items represent.
- How the Daily Score is calculated.
- What a Life Stage is or what the 10 stages mean.
- How partial credit works (e.g., class participation input format).

**Why it matters:** Without any onboarding guidance, new users may submit incorrect data (especially for fractional items like Class Participation) or misunderstand their score and Life Stage.

---

### 1.6 Final Stretch (Days 29–30) Flow
**Status:** ⚠️ Partial | **Priority:** 🟡 Medium

**What is defined:** The idea document states Days 29–30 form a "Final Stretch" that is included in the Monthly Result. The PRD's screen inventory does not list a standalone Final Stretch screen. The Weekly Result section states it is unlocked on Days 7, 14, 21, and 28 — Day 29–30 are not covered by any weekly unlock.

**What is missing:**
- Is there a separate "Final Stretch" screen the student can view on Day 29 or 30?
- Or are Days 29–30 entries silently included in the Monthly Report chart with no intermediate feedback?
- If there is no Week 5 report, what does the student see on the Home Dashboard on Days 29–30?

**Why it matters:** Days 29–30 sit in a UI gap — they are past the last Weekly Result but before the Monthly Report unlocks. The student's experience on those days is undefined.

---

### 1.7 "New Cycle Available After Monthly Report" Navigation Flow
**Status:** ⚠️ Partial | **Priority:** 🟡 Medium

**What is defined:** After Day 30, the student can optionally start a new 30-day cycle. The Monthly Report flow ends with a "Start New Cycle?" prompt.

**What is missing:**
- If the student selects "No" on the "Start New Cycle?" prompt, can they access the Monthly Report again later? The PRD does not define whether the Monthly Report is permanently accessible from the Home Dashboard after the cycle ends.
- If a new cycle is started, does the Home Dashboard switch context to the new cycle immediately? Can the student still view the previous cycle's Monthly Report?

**Why it matters:** Loss of access to a completed Monthly Report after starting a new cycle would be a significant usability failure.

---

## 2. Edge Cases

Edge cases are scenarios that occur infrequently but are likely to happen in real use and require defined behaviour.

---

### 2.1 Submitting the Checklist Twice on the Same Day
**Status:** ❌ Missing | **Priority:** 🔴 Critical

**What is defined:** The PRD defines a daily submission flow where the student fills in the checklist and taps Submit.

**What is missing:** No mechanism is defined to prevent a student from submitting the checklist a second time on the same day. If a second submission is allowed, Firestore may overwrite or duplicate the day's record, corrupting the Daily Score and all downstream weekly/monthly calculations.

**Why it matters:** This is a data integrity issue. The scoring engine must work from exactly one record per day per user.

---

### 2.2 All 30 Days Marked as Off Days
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** On off days, University Attendance (Item 2) and Class Participation (Item 3) are excluded from the maximum, reducing the denominator from 100. The scoring formula uses `Points Achieved ÷ Maximum Available Points`.

**What is missing:** If all 30 days are off days, the maximum available points per day drops from 100 to 82 (100 − 10 − 8 = 82). The scoring formula still works. However, the Monthly Report's Life Insight rules are based on "academic consistency" — which becomes undefined or misleading if the student never had a university day. The PRD does not address this.

**Why it matters:** Life Insight rule logic referencing "academic consistency" or "class participation" may generate incorrect or nonsensical insights for students on a long vacation or holiday semester.

---

### 2.3 Week 1 Weekly Report — No Prior Week to Compare Against
**Status:** ⚠️ Partial | **Priority:** 🟡 Medium

**What is defined:** The Weekly Result includes a "change from the previous week (▲/▼)" indicator.

**What is missing:** On the Week 1 report, there is no previous week. The PRD does not define what the week-over-week change indicator displays in this case. Options are: hide the indicator, show a "Baseline week" label, or show 0% change. Without a defined behaviour, the developer must make an arbitrary choice.

---

### 2.4 Life Score Falls Exactly on a Stage Boundary
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** Life Score maps to one of 10 Life Stages based on score ranges (the ranges themselves are not yet defined — see Critical gap C1).

**What is missing:** When the Life Score falls exactly on the boundary between two stages (e.g., if Stage 3 is 40–49% and Stage 4 is 50–59%, a score of exactly 50.000%), the assignment rule is not defined. Is it rounded up, rounded down, or is the lower stage always inclusive?

**Why it matters:** Without a tie-breaking rule, the classification engine may behave inconsistently for boundary values.

---

### 2.5 Strength / Weakness Tie (Two Life Areas With Identical Completion Rates)
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** The Monthly Report shows the top 3 strengths and bottom 3 weaknesses by life-area completion rate.

**What is missing:** If two or more life areas have identical completion rates (e.g., Physical Activity and Class Work Recap both completed on 25 of 30 days), the rule for ranking one above the other in the top-3 or bottom-3 is not defined.

**Why it matters:** A deterministic tie-breaking rule (e.g., higher point weight wins, or checklist order is used) is required to ensure consistent, reproducible results across runs.

---

### 2.6 Target Wake-Up / Sleep Time Changed Mid-Cycle
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** The student sets target wake-up and sleep times at cycle creation. These are stored in the `users` Firestore document. Item 1 (Early Morning) and Item 12 (Sleeping on Time) are scored against these target times.

**What is missing:** The PRD states the student can update profile settings including target times. If the student changes these times mid-cycle, the PRD does not define:
- Do previously submitted days get retroactively re-scored against the new target times?
- Or do previous days keep their original scores?
- If new target times apply only going forward, where is this boundary stored?

**Why it matters:** This directly affects scoring consistency. Retroactive re-scoring would change already-computed weekly summaries; not re-scoring means the student is measured against two different standards in the same cycle.

---

### 2.7 Student Starts a New Cycle Without Completing the Previous One's Monthly Report
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** After Day 30, the student is prompted to optionally start a new cycle. The Monthly Report is unlocked after Day 30.

**What is missing:** The PRD does not define what happens if a student taps "Start New Cycle" before actually opening and reading the Monthly Report. Is the report still accessible from a "History" or "Past Cycles" section? Is the student warned before they navigate away?

**Why it matters:** The Monthly Report is the culminating feature of the entire 30-day cycle. If the student can bypass it without viewing it, the app's primary value proposition is diminished.

---

### 2.8 Item 7 — Physical Activity: Conflicting "Yes/No" and Minutes Input
**Status:** ⚠️ Partial | **Priority:** 🟡 Medium

**What is defined:** Item 7 (Physical Activity) records "Yes/No + minutes." It is worth 10 points.

**What is missing:** No conflict resolution rule is defined for the following contradictory inputs:
- Student selects "Yes" but enters 0 minutes.
- Student selects "No" but enters a minutes value greater than 0.

**Why it matters:** The scoring engine must have a deterministic rule for these cases. For example: if "No" is selected, minutes are ignored and 0 points are awarded regardless of the minutes value.

---

### 2.9 Backdating Entries Beyond the 1-Day Grace Window
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** A one-day grace window allows filling in yesterday's entry.

**What is missing:** No behaviour is defined for a student absent for 2 or more consecutive days (e.g., 3-day illness). Those days will permanently count as 0% with no recovery option. The PRD does not acknowledge this scenario or explain the deliberate design choice.

**Why it matters:** While the strict 1-day grace window may be intentional (to maintain data integrity and discourage retrospective fabrication), this choice should be explicit in the PRD so it is not mistakenly treated as an oversight during development.

---

## 3. Error Handling

Error handling defines how the application responds when something goes wrong — network failures, invalid data, authentication errors, or unexpected system states.

---

### 3.1 Firestore Write Failure on Checklist Submission
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** After the student taps Submit on the Daily Checklist, the data is saved to Firestore and the Daily Score is calculated.

**What is missing:** No behaviour is defined for a Firestore write failure. The student's completed checklist answers must not be silently lost. Required handling:
- Retain the student's filled answers in memory or local storage.
- Display a clear, user-friendly error message (not a raw exception or blank screen).
- Provide a Retry option.

---

### 3.2 Firebase Authentication Errors
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** Login uses Firebase Authentication with email and password.

**What is missing:** No error states are defined for the Login screen. Expected error conditions include:
- Wrong password — "Incorrect password. Please try again."
- Email not registered — "No account found with this email address."
- Too many failed attempts — Firebase automatically blocks the account temporarily; the app should inform the student.
- Network unavailable during login — "No internet connection. Please check your connection and try again."

**Why it matters:** Without defined error messages, the developer will implement arbitrary messages (or none), resulting in an inconsistent and confusing user experience.

---

### 3.3 Network Unavailability at App Launch
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** Offline support is mentioned — entries made without connectivity are synced when connection returns.

**What is missing:** No UI state is defined for the scenario where the app launches with no network connection. Firestore's offline persistence will serve cached data, but:
- The app should show a subtle "You are offline" indicator on the Home Dashboard.
- If no cached data exists (first launch with no connection), the app cannot display anything — this state is undefined.
- The student should still be able to fill in and submit the daily checklist while offline, with a clear indication that it will sync later.

---

### 3.4 Firestore Read Failure on Weekly / Monthly Report
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** Weekly and Monthly Reports are generated from Firestore data.

**What is missing:** No behaviour is defined if the Firestore read fails or times out when the student opens a report screen. Options that need to be defined:
- Show a loading state with a timeout.
- After timeout, show an error message with a Retry button.
- Do not display a partial or empty report without explanation.

---

### 3.5 Score Calculation Producing an Unexpected Result (e.g., > 100% or Negative)
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** The Daily Score formula is `(Points Achieved ÷ Maximum Available Points) × 100`.

**What is missing:** No guard is defined for edge-case calculation outputs. While the formula is mathematically bounded between 0% and 100% when inputs are valid, corrupted or unexpected Firestore data (e.g., a negative point value from a data migration or bug) could produce scores outside this range. The scoring engine should include a bounds check: `score = max(0, min(100, calculatedScore))`.

---

### 3.6 App Crash Mid-Checklist (Unsaved Draft Loss)
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** The student fills in 12 checklist items and taps Submit.

**What is missing:** If the app crashes, is force-closed, or the system kills the process while the student is mid-way through the checklist, all entered answers are lost. No auto-save or draft persistence mechanism is defined. The student must restart from Item 1.

**Why it matters:** Losing progress on a 12-item form is a poor user experience that could discourage re-entry and reduce data completeness.

---

### 3.7 Registration Failure (Email Already in Use)
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** Registration uses Firebase Authentication with email and password.

**What is missing:** Firebase returns a specific error code when an email is already registered. The Registration screen must handle this with a clear message: "An account with this email already exists. Please log in or use a different email." Without this, the student sees a generic error or nothing at all.

---

### 3.8 Password Reset Email Delivery Failure
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** Password recovery uses Firebase's "forgot password" email flow.

**What is missing:** Firebase sends a password reset email, but delivery is not guaranteed. The PRD does not define what the app should display after the student taps "Send Reset Email" — only a success confirmation is implied. The app should:
- Show a confirmation: "If this email is registered, a reset link has been sent."
- Handle the case where the entered email is not in the system (Firebase does not differentiate this for security reasons, so the same neutral confirmation message is correct).

---

## 4. Security

Security defines how the application protects user data, authentication sessions, and system integrity.

---

### 4.1 Firestore Security Rules
**Status:** ✅ Defined | **Priority:** —

**What is defined:** The PRD states that each student's data is stored under `users/{userId}/...` and Firestore Security Rules ensure a user can read and write only their own records. This is the correct and standard approach.

**No gap identified.** This is a strength of the PRD.

---

### 4.2 Input Sanitisation for Free-Text Fields
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** Items 6 (Daily Learning note) and 11 (Self-Reflection journal) accept free-text input.

**What is missing:** No input sanitisation requirement is defined. If this text is ever rendered in a WebView, displayed via HTML, or exported (future PDF feature), unsanitised input could create a cross-site scripting (XSS) risk. For the current v1 scope (displaying in a standard Android TextView), the risk is low but the requirement should be acknowledged. At minimum, the developer should strip or escape HTML tags from free-text inputs before writing to Firestore.

---

### 4.3 Password Strength Requirements
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** Registration requires email and password via Firebase Authentication.

**What is missing:** No password strength requirements are defined. Firebase Authentication allows any password of 6 or more characters by default, which permits weak passwords like "123456". The PRD should define a minimum password policy, e.g.:
- Minimum 8 characters.
- At least one uppercase letter, one number, or one special character.

**Why it matters:** Weak passwords increase the risk of account compromise, which would expose the student's private 30-day lifestyle data.

---

### 4.4 Email Verification Before Account Access
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** Registration creates a Firebase Auth account. The student then proceeds to cycle setup and the Home Dashboard.

**What is missing:** The PRD does not state whether the student's email must be verified before they can access the app. Firebase supports sending a verification email at registration and blocking login for unverified accounts. Without email verification:
- A student could register with a mistyped email and lose password recovery access permanently.
- Account recovery becomes impossible for mistyped-email accounts.

---

### 4.5 Session Expiry Policy
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** The Login flow is defined. The session persists across app restarts (Firebase Auth default behaviour).

**What is missing:** The PRD does not define:
- How long an authenticated session remains valid.
- What triggers re-authentication (e.g., after 30 days, after a password change, or never unless the student explicitly logs out).
- Whether the app shows a session-expired screen and redirects to Login automatically.

**Why it matters:** Firebase Auth tokens expire by default after 1 hour but are silently refreshed. However, if the refresh token is revoked (e.g., password change, account deletion), the app must handle the resulting auth error gracefully rather than crashing or displaying stale data.

---

### 4.6 Data at Rest and In Transit
**Status:** ✅ Defined (implicit) | **Priority:** —

**What is defined:** Firebase Authentication and Cloud Firestore are used as the backend. Firebase uses HTTPS/TLS for all data in transit and encrypts all data at rest on Google Cloud servers automatically.

**Advisory:** While Firebase handles this by default, the PRD does not state it explicitly. It is worth documenting this in the PRD so the team is not expected to implement additional encryption.

---

### 4.7 Account Deletion and Data Erasure
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** The PRD defines a Logout flow. It does not define account deletion.

**What is missing:** No requirement is defined for permanently deleting a student's Firebase Auth account and all associated Firestore documents (`dailyActivities`, `dailyScores`, `weeklySummaries`, `monthlyResults`, `users` profile). Without this, student data persists in Firestore indefinitely even if the student stops using the app.

---

## 5. Validation

Validation defines the rules that govern what constitutes acceptable input across all forms and data entry points in the application.

---

### 5.1 Registration Form Validation
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** Registration collects name, email, password, university, and department.

**What is missing:** No validation rules are defined for any field. Required rules:

| Field | Required Validation |
|---|---|
| Email | Valid email format (`user@domain.com`); must not be empty |
| Password | Minimum 8 characters; at least one number or special character (see Security §4.3) |
| Name | Non-empty; maximum length (suggested: 100 characters); no special characters |
| University | Non-empty; maximum length (suggested: 150 characters) |
| Department | Non-empty; maximum length (suggested: 100 characters) |

---

### 5.2 Cycle Setup Validation
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** The student selects a start date, target wake-up time, and target sleep time during cycle setup.

**What is missing:**

| Field | Required Validation |
|---|---|
| Start date | Must not be a future date (or define explicitly whether future dates are allowed). Must not conflict with an already-active cycle. |
| Target wake-up time | Must be a valid time; must be earlier than target sleep time (or define overnight cycles, e.g., wake-up 06:00, sleep 23:00). |
| Target sleep time | Must be a valid time; must be later than target wake-up time (unless overnight crossing midnight is supported). |

---

### 5.3 Daily Checklist Item Validation
**Status:** ❌ Missing | **Priority:** 🔴 Critical

**What is defined:** Each item's input type (Yes/No, fraction, number, text, 3-way selection).

**What is missing:**

| Item | Validation Required |
|---|---|
| **Item 3 — Class Participation** | Input is a fraction (e.g., 4/5). Both numerator and denominator must be non-negative integers. Numerator must be ≤ denominator. Denominator must be ≥ 1 (cannot divide by zero). |
| **Item 5 — Social Interaction** | Input must be a non-negative integer. No negative values. Upper bound to be defined (e.g., max 20 interactions per day). |
| **Item 7 — Physical Activity minutes** | If "Yes" is selected, minutes must be a positive integer (> 0). If "No" is selected, minutes field should be hidden or disabled. |
| **Item 8 — Skill Development minutes** | Input must be a non-negative integer (0 is valid — student may mark 0 minutes). Upper bound to be defined (e.g., max 1440 minutes = 24 hours). |
| **Item 6 — Daily Learning note** | Non-empty text required to earn points; maximum character limit to be defined (suggested: 500 characters). |
| **Item 11 — Self-Reflection journal** | Non-empty text required to earn points; maximum character limit to be defined (suggested: 500 characters). |

---

### 5.4 Profile Update Form Validation
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** The student can update their profile (name, university, department, target times) from the Settings screen.

**What is missing:** The same validation rules as the Registration form apply to the Profile Update form. Additionally:
- If the student changes target wake-up or sleep times mid-cycle, a warning or confirmation should be shown explaining the effect on future scoring (see Edge Case §2.6).

---

### 5.5 Scoring Formula Input Validation
**Status:** ❌ Missing | **Priority:** 🔴 Critical

**What is defined:** The Daily Score formula is `(Points Achieved ÷ Maximum Available Points) × 100`.

**What is missing:** The scoring engine must validate that:
- `Maximum Available Points` is never 0 (to prevent a divide-by-zero error). This could theoretically occur if all items are marked "Not Applicable" on an off day — though with the current off-day rules only Items 2 and 3 are excluded, leaving a minimum denominator of 82. This should be explicitly stated.
- Each item's calculated points fall within `[0, item_max_points]` before summing.
- The final score is clamped to `[0, 100]` as a safeguard against calculation bugs.

---

### 5.6 Undefined Scoring Thresholds for Items 5, 8, and 10
**Status:** ❌ Missing | **Priority:** 🔴 Critical

**What is defined:** Point weights are assigned (Item 5 = 6 pts, Item 8 = 10 pts, Item 10 = 6 pts).

**What is missing:** The conversion from raw input to points is undefined for three items:

| Item | Input | Point Conversion Rule | Status |
|---|---|---|---|
| Item 5 — Social Interaction | Count of meaningful interactions | How many = full 6 pts? Linear scale? Minimum to earn any points? | ❌ Not defined |
| Item 8 — Skill Development | Minutes spent | How many minutes = full 10 pts? Tiered or linear? | ❌ Not defined |
| Item 10 — Social Media Control | Controlled / Useful / Excessive | Point values for each option | ❌ Not defined |

**Why it matters:** These three items represent 22 of 100 total points. Without defined conversion rules, the scoring engine cannot be built and Daily Scores will be incorrect.

---

## 6. Permissions

Permissions define what system-level access the app must request from the Android operating system and when those requests are made.

---

### 6.1 POST_NOTIFICATIONS — Android 13+ Runtime Permission
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** Daily reminder notifications at a user-configurable time are a defined feature. Streak milestone alerts are mentioned.

**What is missing:** Android 13 (API 33) and above require explicit runtime permission for sending notifications via the `POST_NOTIFICATIONS` permission. The PRD does not define:
- When this permission is requested (at first launch, or when the student enables notifications in Settings).
- What happens if the student denies the permission (the notification feature is silently unavailable — should the app inform the student?).
- What happens if the student denies the permission and later wants to enable it (the app must guide them to system Settings).

**Why it matters:** The app targets Android 8.0+ (API 26+), which includes Android 13+. Without handling this permission, the notification feature will silently fail on the majority of new devices.

---

### 6.2 INTERNET Permission
**Status:** ✅ Defined (implicit) | **Priority:** —

**What is defined:** The app uses Firebase Authentication and Cloud Firestore, which require internet access.

**Advisory:** The `INTERNET` permission must be declared in `AndroidManifest.xml`. This is a normal (non-dangerous) permission and does not require a runtime request. It should be noted in the technical specification, though it does not need user approval.

---

### 6.3 RECEIVE_BOOT_COMPLETED Permission
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** Daily reminder notifications at a configurable time are a defined feature.

**What is missing:** On Android, scheduled notifications (using `AlarmManager` or `WorkManager`) are cancelled when the device is restarted. To re-schedule them after a reboot, the app must:
- Declare the `RECEIVE_BOOT_COMPLETED` permission in `AndroidManifest.xml`.
- Register a `BroadcastReceiver` that re-schedules all active notification alarms on device boot.

If this is not implemented, the student's daily reminder will stop working after any device restart until the student manually opens the app again.

---

### 6.4 SCHEDULE_EXACT_ALARM — Android 12+ Exact Alarm Permission
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** Daily reminders are described as configurable-time notifications, implying a precise, time-based trigger.

**What is missing:** On Android 12 (API 31) and above, scheduling an exact alarm (e.g., "notify me at exactly 8:00 PM") requires either:
- The `SCHEDULE_EXACT_ALARM` permission (which the user must grant via system settings on Android 12), or
- Using `WorkManager` with flex periods (approximate timing), which does not require this permission.

The PRD does not define whether the reminder must fire at the **exact** configured time or whether a window of a few minutes is acceptable. This choice determines which API and permission are required.

---

### 6.5 USE_EXACT_ALARM — Android 13+ (Alternative to SCHEDULE_EXACT_ALARM)
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** Same as above.

**What is missing:** On Android 13 (API 33), `USE_EXACT_ALARM` was introduced as an alternative that does not require user approval but is restricted to specific use cases (clocks, reminders, timers). A daily check-in reminder may qualify. The PRD should define the exact alarm approach so the correct permission and API are used.

**Advisory:** For an academic project, `WorkManager` with approximate timing is the simplest approach and avoids all exact-alarm permission complexity.

---

## 7. Notifications

Notifications define the app's system-level alerts, their triggers, content, and behaviour.

---

### 7.1 Daily Check-in Reminder
**Status:** ✅ Defined | **Priority:** —

**What is defined:** A daily reminder notification at a user-configurable time is a core feature.

**What is missing (details):**

| Detail | Status |
|---|---|
| Default reminder time (before the student configures one) | ❌ Not defined |
| Notification title and body text | ❌ Not defined |
| Behaviour when tapped (deep link to Daily Checklist screen) | ❌ Not defined |
| Whether the notification is cancelled automatically after the student checks in | ❌ Not defined |
| Whether the student can disable the reminder entirely | ⚠️ Implied by settings but not explicitly stated |

---

### 7.2 Streak Milestone Alerts
**Status:** ⚠️ Partial | **Priority:** 🟠 High

**What is defined:** Streak milestone alerts are mentioned as a feature.

**What is missing:**
- Trigger values: at which streak lengths does the app send a milestone alert? (e.g., 7, 14, 21, 30 days)
- Notification title and body text for each milestone.
- Whether the milestone notification is sent on the day the milestone is reached, or the following morning.

---

### 7.3 Weekly / Monthly Result Availability Notification
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** The Weekly Result is unlocked after Days 7, 14, 21, and 28. The Monthly Result is unlocked after Day 30.

**What is missing:** The PRD does not define whether a notification is sent when a new result becomes available. Without a notification, the student must remember to open the app after completing a week or the full cycle. A notification like "Your Week 1 Result is ready — see how you did!" would significantly improve engagement.

---

### 7.4 Missed Check-in Secondary Nudge
**Status:** ❌ Missing | **Priority:** 🟢 Low

**What is defined:** A single daily reminder notification is defined.

**What is missing:** No secondary nudge is defined for students who have not completed their check-in by a certain cut-off time (e.g., 9:00 PM or 10:00 PM). A second late-day reminder is a common pattern in habit-tracker apps that significantly improves daily completion rates. This is not in the PRD, but its absence should be a deliberate design choice, not an oversight.

---

### 7.5 Notification Cancellation After Daily Check-in Completion
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** A daily reminder notification fires at the configured time.

**What is missing:** No requirement is defined for cancelling the notification once the student has already completed their check-in for the day. If the student completes the checklist at 7:00 AM but the reminder fires at 8:00 PM, they will receive a redundant notification. The app should cancel the day's reminder after a successful submission.

---

### 7.6 Notification Behaviour When the Cycle Is Complete or Inactive
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** Notifications are linked to the daily reminder feature within a cycle.

**What is missing:** The PRD does not define what happens to scheduled notifications when:
- The 30-day cycle completes — should daily reminders stop automatically?
- The student has no active cycle (between cycles) — should notifications be suppressed?
- The student starts a new cycle — should the notification schedule reset to the new cycle's context?

**Why it matters:** A reminder saying "Complete your daily check-in!" received after the cycle has ended, with no active checklist to fill, is confusing and potentially misleading.

---

## 8. Exception Handling

Exception handling defines how the application behaves when unexpected system-level errors, runtime failures, or unrecoverable states occur.

---

### 8.1 Uncaught Runtime Exceptions (App Crashes)
**Status:** ❌ Missing | **Priority:** 🟠 High

**What is defined:** The PRD mentions testing coverage, including functional and UI tests.

**What is missing:** No crash reporting or uncaught exception handling strategy is defined. For an academic project, Android's built-in crash handling (which terminates the app and shows the system "App stopped working" dialog) is acceptable. However, the PRD should explicitly state:
- Whether a crash reporting tool (e.g., Firebase Crashlytics — free and integrated with Firebase) will be used.
- If Crashlytics is used, what data it collects and whether it aligns with the app's privacy principles.

**Advisory:** Firebase Crashlytics is strongly recommended for this project. It provides automatic crash reports with stack traces, requires minimal setup, and is free. It does not collect personally identifiable information by default.

---

### 8.2 Firestore Security Rule Violation (Unauthorised Access Attempt)
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** Firestore Security Rules ensure users can only read/write their own data.

**What is missing:** If a Firestore Security Rule denies a read or write (e.g., due to an expired token or a code bug that constructs the wrong document path), the Firebase SDK throws a `FirebaseFirestoreException` with code `PERMISSION_DENIED`. The PRD does not define how the app handles this exception. The student should see an informative error screen, not a crash.

---

### 8.3 Firebase Authentication Token Expiry or Revocation
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** Firebase Authentication manages sessions. The student remains logged in across app restarts.

**What is missing:** Firebase Auth ID tokens expire after 1 hour and are automatically refreshed silently by the SDK. However, if the refresh token is revoked (e.g., because the student changes their password on another device, or the account is deleted), the next Firestore operation will fail with an auth error. The app should:
- Catch this exception type.
- Redirect the student to the Login screen with a clear message: "Your session has expired. Please log in again."

Without handling this, the student sees a cryptic error or blank screen.

---

### 8.4 Firestore Document Not Found (Missing Data)
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** Weekly and Monthly Reports are generated from Firestore documents.

**What is missing:** If a Firestore document that the app expects to exist does not exist (e.g., a `weeklySummaries` document is missing due to a previous write failure), the SDK returns a `DocumentSnapshot` with `exists() == false`. The app should handle this gracefully:
- Show a "No data available for this period" message rather than crashing or displaying zeros.
- Offer a retry or return-to-home option.

---

### 8.5 Offline First-Launch (No Cached Firestore Data)
**Status:** ❌ Missing | **Priority:** 🟡 Medium

**What is defined:** Offline support via Firestore SDK persistence is a defined feature.

**What is missing:** Firestore's offline persistence only works if the data has been fetched at least once while online. If the student launches the app for the first time with no internet connection, there is no cached data to serve. The app must handle this case:
- Detect no internet connection at launch.
- Display a clear message: "Please connect to the internet to set up your account."
- Prevent the student from attempting to register or log in without connectivity.

---

### 8.6 Scoring Engine Divide-by-Zero Exception
**Status:** ❌ Missing | **Priority:** 🔴 Critical

**What is defined:** The Daily Score formula is `(Points Achieved ÷ Maximum Available Points) × 100`.

**What is missing:** If a code defect causes `Maximum Available Points` to equal 0 (e.g., all items are incorrectly excluded), the scoring engine will throw an `ArithmeticException` (divide by zero) and crash. The scoring engine must include an explicit guard:

```
if (maxPoints == 0) return 0.0  // or handle as a special "no data" case
```

This exception must never reach the user as a crash.

---

## Summary Table

| # | Category | Total Findings | ❌ Missing | ⚠️ Partial | ✅ Defined | 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Missing Flows | 7 | 5 | 2 | 0 | 1 | 2 | 4 | 0 |
| 2 | Edge Cases | 9 | 7 | 2 | 0 | 1 | 0 | 8 | 0 |
| 3 | Error Handling | 8 | 8 | 0 | 0 | 0 | 5 | 3 | 0 |
| 4 | Security | 7 | 4 | 1 | 2 | 0 | 3 | 2 | 0 |
| 5 | Validation | 6 | 5 | 1 | 0 | 3 | 2 | 1 | 0 |
| 6 | Permissions | 5 | 3 | 0 | 2 | 0 | 1 | 3 | 0 |
| 7 | Notifications | 6 | 4 | 2 | 0 | 0 | 1 | 4 | 1 |
| 8 | Exceptions | 6 | 6 | 0 | 0 | 1 | 1 | 4 | 0 |
| | **Total** | **54** | **42** | **8** | **4** | **6** | **15** | **29** | **1** |

---

## Priority Action List

### 🔴 Critical — Resolve Before Development Begins

| Ref | Category | Issue |
|---|---|---|
| §2.1 | Edge Cases | Duplicate checklist submission prevention |
| §5.3 | Validation | Daily checklist item validation (especially Item 3 fraction input) |
| §5.6 | Validation | Undefined scoring thresholds for Items 5, 8, and 10 |
| §5.5 | Validation | Scoring formula divide-by-zero guard |
| §8.6 | Exceptions | Scoring engine divide-by-zero exception |
| §1.2 | Missing Flows | Cycle abandonment / reset flow |

### 🟠 High — Resolve Before Sprint 1 (Week 4)

| Ref | Category | Issue |
|---|---|---|
| §1.4 | Missing Flows | Error state flows (Firestore failure, auth error, network unavailability) |
| §1.3 | Missing Flows | Cycle pause / resume flow |
| §3.1 | Error Handling | Firestore write failure on checklist submission |
| §3.2 | Error Handling | Firebase Authentication error messages |
| §3.3 | Error Handling | Network unavailability at app launch |
| §3.4 | Error Handling | Firestore read failure on report screens |
| §3.7 | Error Handling | Registration failure — email already in use |
| §4.3 | Security | Password strength requirements |
| §4.4 | Security | Email verification before account access |
| §4.7 | Security | Account deletion and data erasure |
| §5.1 | Validation | Registration form validation rules |
| §5.2 | Validation | Cycle setup form validation rules |
| §6.1 | Permissions | POST_NOTIFICATIONS runtime permission — Android 13+ |
| §7.2 | Notifications | Streak milestone alert trigger values |
| §8.1 | Exceptions | Uncaught runtime exception / crash reporting strategy |

### 🟡 Medium — Resolve Before Testing (Week 10)

All remaining findings classified as Medium priority (see individual sections above).

### 🟢 Low — Resolve During Polish / Bug-Fix Phase

| Ref | Category | Issue |
|---|---|---|
| §7.4 | Notifications | Missed check-in secondary nudge |

---

*End of Requirement Validation Report — `requerment-validation.md` — Version 2.0*