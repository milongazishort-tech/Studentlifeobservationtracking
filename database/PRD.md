# Product Requirements Document (PRD)
## Student Life Progress & Self-Improvement Tracker
**Course:** Software Engineering / Android & Web Application Development (CSE 3210) · SMUCT  
**Authors:** Md. Mahfuzur Rahman Milon (241071019) · Sumaia Abrar (241071010)  
**Date:** November 2026 · Version 2.0 (Updated & Aligned)

---

## 1. Project Overview

### 1.1 Summary

The **Student Life Progress & Self-Improvement Tracker** is a private, cross-platform student lifestyle tracking application that empowers students to observe, understand, and improve their daily habits over a structured **30-day self-improvement cycle**.

Each day, a student completes a **12-item life checklist** spanning academics, physical health, skill development, social interactions, and personal discipline. The app converts daily inputs into a **Daily Score**, aggregates them into **Weekly Results**, and culminates in a **Monthly Report** that assigns the student one of **10 Life Stages**, highlights top strengths and weaknesses, and delivers a personalised, rule-based **Life Insight**.

> [!NOTE]
> The app does not provide medical, psychological, or academic diagnosis. All insights are **data-based lifestyle reflections** derived strictly from the student's own self-reported habits.

### 1.2 Mission Statement

> *Observe Yourself → Understand Yourself → Improve Yourself*

### 1.3 Core Philosophy

- **Privacy-first**: Every student's records are isolated to their own authenticated user ID and never shared publicly or viewed by peers/instructors.
- **Honest self-reporting**: The system evaluates consistency and reflection rather than perfection.
- **Non-judgmental**: Life Stages exist as motivational markers for self-awareness, not institutional grading or ranking.

### 1.4 Technical Stack (Web-First Full-Stack Architecture)

| Layer | Selection | Detail |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router) + React 18 | Responsive Web App / PWA support with Tailwind CSS & Recharts |
| **Backend** | Node.js + Express.js | REST API monolith with JWT authentication & modular service layer |
| **Database** | MongoDB 7+ (Mongoose 8+) | Document database with user-isolated collections and compound indexing |
| **Notifications** | Web Push API (Service Worker) + Nodemailer | In-browser real-time push reminders + optional email notifications |
| **Scheduling** | node-cron | Automated background jobs for midnight missed-day backfills & reminders |
| **Version Control**| Git / GitHub | Code collaboration & version control |

---

## 2. Target Users

### 2.1 Primary Users — University Students
Students enrolled in academic programs seeking:
- Clarity on daily routine, study time, and sleep habits.
- Actionable weekly and monthly feedback on strengths and weaknesses.
- Visual streak and score feedback to remain consistent over 30 days.

### 2.2 Secondary Users — College / Pre-University Students
Students transitioning to higher education wanting to establish disciplined habits early.

### 2.3 Future Users — Administrators *(Out of Scope for v1)*
Institutional oversight for anonymous, aggregated lifestyle analytics.

---

## 3. Core Features & Business Logic

### 3.1 Authentication & Profile
- **Registration**: Email, password (min. 8 characters with alphanumeric/special char validation), full name, university, and department.
- **Email Verification**: Required verification flow prior to complete activation.
- **Login / Session**: Stateless JWT authentication (7-day validity stored in secure `httpOnly` cookie / local storage).
- **Profile & Targets**: Configurable target wake-up and sleep times (used by Items 1 & 12).
- **Account Deletion**: Dedicated "Delete My Account & Data" action in Settings to satisfy privacy rights.

### 3.2 30-Day Cycle Management
- **Cycle Initialization**: User initiates a cycle with a chosen `startDate` (cannot be in the future).
- **Structure**:
  - Week 1: Days 1–7
  - Week 2: Days 8–14
  - Week 3: Days 15–21
  - Week 4: Days 22–28
  - Final Stretch: Days 29–30 (transition into Monthly Report)
- **Cycle Lifecycle**: States include `active`, `completed`, and `abandoned`. Users can cancel/abandon an active cycle if needed.
- **Multi-Cycle History**: Previous cycles are archived and accessible for month-over-month comparison.

### 3.3 Daily Checklist & Exact Scoring Rules

The 12-item checklist awards points based on deterministic rules totaling **100 points**:

| # | Life Area | Input Type | Points | Exact Conversion & Scoring Rule |
|---|---|---|---|---|
| 1 | **Early Morning** | Boolean (Yes/No) | 8 | `Yes` (woke up at/before target wake-up time) = 8 pts; `No` = 0 pts |
| 2 | **University Attendance** | Enum (Yes / No / Off Day) | 10 | `Yes` = 10 pts; `No` = 0 pts; `Off Day` = Excluded from max available points |
| 3 | **Class Participation** | Fraction ($a / b$) | 8 | $(a / b) \times 8$ pts (Clamped $0 \le a \le b$, $b \ge 1$); Excluded on Off Day |
| 4 | **Personal Discipline** | Boolean (Yes/No) | 8 | `Yes` (completed personal/spiritual habit) = 8 pts; `No` = 0 pts |
| 5 | **Social Interaction** | Non-negative Integer | 6 | $\ge 3$ interactions = 6 pts; 2 = 4 pts; 1 = 2 pts; 0 = 0 pts |
| 6 | **Daily Learning** | Free-text note (max 500 ch) | 10 | Non-empty reflective entry = 10 pts; empty = 0 pts |
| 7 | **Physical Activity** | Boolean + Minutes | 10 | `Yes` AND minutes $\ge 15$ = 10 pts; `Yes` with $< 15$ mins = 5 pts; `No` = 0 pts |
| 8 | **Skill / Earning Work** | Non-negative Integer (mins) | 10 | $\ge 60$ mins = 10 pts; 30–59 mins = 6 pts; 15–29 mins = 3 pts; $< 15$ mins = 0 pts |
| 9 | **Class Work Recap** | Boolean (Yes/No) | 10 | `Yes` = 10 pts; `No` = 0 pts |
| 10 | **Social Media Control** | 3-way Selection | 6 | `Controlled` = 6 pts; `Useful` = 3 pts; `Excessive` = 0 pts |
| 11 | **Self-Reflection** | Free-text journal (max 500 ch)| 8 | Meaningful entry recorded = 8 pts; empty = 0 pts |
| 12 | **Sleeping on Time** | Boolean (Yes/No) | 6 | `Yes` (slept at/before target sleep time) = 6 pts; `No` = 0 pts |
| | **Total Normal Day** | | **100** | On `Off Day`, items 2 & 3 are omitted; **Max Available = 82 pts** |

**Daily Score Formula:**
$$\text{Daily Score (\%)} = \min\left(100, \max\left(0, \frac{\text{Points Achieved}}{\text{Maximum Available Points}} \times 100\right)\right)$$

### 3.4 Submission, Editing, and Missed-Day Policy
- **Same-Day Editing (`PUT /today`)**: Users may re-open and update today's submitted checklist anytime before midnight.
- **Grace Window (`PUT /yesterday`)**: Users can fill or edit yesterday’s missing entry up to 23:59 of the next calendar day.
- **Missed Days**: Any calendar day without an entry past the grace window automatically receives a recorded score of **0%** and is marked as missed.
- **Timezone Safety**: Dates are evaluated using the student's local timezone offset transmitted via client headers.

### 3.5 Weekly Results
Available at the conclusion of Days 7, 14, 21, and 28:
- Weekly Average Score & Days Tracked (e.g. "6 of 7 days").
- Best Day and Lowest Day of the week.
- Radar / Bar chart breakdown across the 12 life areas.
- Week-over-Week Change ($\Delta \pm \%$); for Week 1, displays *"Baseline Week"*.
- One context-aware **Focus Tip** targeting the student's lowest scoring area for the week.

### 3.6 Monthly Report & Life Stage Boundaries
Generated after Day 30:
- **Life Score**: Simple arithmetic mean of all 30 Daily Scores.
- **Habit Consistency**: $\frac{\text{Days Tracked}}{30} \times 100\%$.
- **Life Stage System**:

| Stage | Classification Name | Life Score Range (%) |
|---|---|---|
| **Stage 1** | Critical / Highly Unbalanced | 0.00 – 19.99% |
| **Stage 2** | Struggling / Low Discipline | 20.00 – 29.99% |
| **Stage 3** | Inconsistent Routine | 30.00 – 39.99% |
| **Stage 4** | Emerging Awareness | 40.00 – 49.99% |
| **Stage 5** | Moderate Balance | 50.00 – 59.99% |
| **Stage 6** | Steady Progress | 60.00 – 69.99% |
| **Stage 7** | Disciplined Student | 70.00 – 79.99% |
| **Stage 8** | High Achiever | 80.00 – 89.99% |
| **Stage 9** | Exemplary Lifestyle | 90.00 – 94.99% |
| **Stage 10** | Exceptional Self-Development | 95.00 – 100.00% |

- **Top Strengths & Weaknesses**: Top 3 and bottom 3 areas ranked by average completion percentage.
- **Life Insight & Action Recommendations**: Personalised paragraph selected via predefined rule matching. If habit consistency is $< 50\%$ (less than 15 days tracked), a prominent notice indicates the insight is based on limited data.

### 3.7 Notification System
- **Web Push Notifications**: In-browser instant alerts at the student's designated reminder time.
- **Email Notifications**: Fallback reminders for inactive accounts and milestone congratulation alerts (7, 14, 21, and 30-day streaks).
- **Auto-Cancellation**: Reminder is suppressed if today's checklist is already submitted.

---

## 4. User Flows

### Flow 1: Daily Check-in & Real-time Update
`Home Dashboard` $\rightarrow$ `Daily Checklist Form` $\rightarrow$ `Validation Check` $\rightarrow$ `Submit/Update` $\rightarrow$ `Scoring Engine` $\rightarrow$ `Daily Result Screen` (Shows score, breakdown, streak update) $\rightarrow$ `Return to Dashboard`.

### Flow 2: Missed Day Grace Entry
`Home Dashboard (Banner: "Yesterday not recorded")` $\rightarrow$ `Yesterday Grace Form` $\rightarrow$ `Submit` $\rightarrow$ `Recalculate Yesterday's Score` $\rightarrow$ `Update Streak & Weekly Cache`.

### Flow 3: Cycle Completion & Transition
`Day 30 Submission` $\rightarrow$ `Monthly Aggregator Job` $\rightarrow$ `Unlock Monthly Report` $\rightarrow$ `View Life Stage, Insight & Trends` $\rightarrow$ `Option: Archive & Start Cycle 2`.

---

## 5. Out of Scope (Version 1.0)
- Native mobile APK build (migrated to responsive Web App/PWA).
- Real-time chat coaching or generative LLM execution on the server.
- CGPA / institutional transcript synchronization.
- Public leaderboards, student comparison rankings, or social sharing.

---

## 6. Verification & Acceptance Criteria
- 100% of the 12 scoring items calculate accurately based on specified conversion thresholds.
- Missed days default to 0% without crashing weekly/monthly aggregation pipelines.
- Zero data cross-contamination between different student accounts.
