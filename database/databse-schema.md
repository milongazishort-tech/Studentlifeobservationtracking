# Database Schema Specification
## Student Life Progress & Self-Improvement Tracker
**Course:** CSE 3210 (Software Engineering / App Development) · SMUCT  
**System Architecture Source:** `arcthitecture.md` (v2.0), `PRD.md` (v2.0) & `database.md` (v2.1)  
**Database Engine:** MongoDB 7.0+ (via Mongoose 8.0+ ODM)  
**Document:** Complete Schema Field Definitions & Specifications

---

## Table of Contents
1. [Overview](#1-overview)
2. [Detailed Field Specifications](#2-detailed-field-specifications)
   - 2.1 [users Collection](#21-users-collection)
   - 2.2 [cycles Collection](#22-cycles-collection)
   - 2.3 [dailyActivities Collection](#23-dailyactivities-collection)
   - 2.4 [dailyScores Collection](#24-dailyscores-collection)
   - 2.5 [weeklySummaries Collection](#25-weeklysummaries-collection)
   - 2.6 [monthlyResults Collection](#26-monthlyresults-collection)
   - 2.7 [pushSubscriptions Collection](#27-pushsubscriptions-collection)

---

## 1. Overview

This document contains the complete and granular field-level schema definitions for all 7 collections utilized in the **Student Life Progress & Self-Improvement Tracker**. Each collection is mapped to its exact data types, constraints, default values, and operational descriptions.

---

## 2. Detailed Field Specifications

### 2.1 `users` Collection
*Represents student identity, credentials, academic profile, and target lifestyle parameters.*

| Field Name | Data Type | Constraint / Validation | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Primary Key, Immutable | Auto-generated | System-generated unique identifier. |
| `name` | `String` | Required, Trim, Length: $2 \dots 100$ | — | Full name of the student. |
| `email` | `String` | Required, Unique, Lowercase, Trim | — | Student's primary login email address. |
| `passwordHash`| `String` | Required | — | bcrypt hash (12 salt rounds). Plain text is never stored. |
| `university` | `String` | Required, Trim, Max: $150$ chars | — | Name of academic institution (e.g., SMUCT). |
| `department` | `String` | Required, Trim, Max: $100$ chars | — | Department or Major of study. |
| `targetWakeUpTime` | `String` | Regex: `^([0-1]?[0-9]\|2[0-3]):[0-5][0-9]$` | `"06:30"` | Scheduled wake-up target in `HH:mm` format. Used by Item 1. |
| `targetSleepTime` | `String` | Regex: `^([0-1]?[0-9]\|2[0-3]):[0-5][0-9]$` | `"23:00"` | Scheduled bedtime target in `HH:mm` format. Used by Item 12. |
| `reminderTime` | `String` | Regex: `^([0-1]?[0-9]\|2[0-3]):[0-5][0-9]$` | `"21:00"` | Configured time for daily reminder notification dispatch. |
| `reminderEnabled` | `Boolean`| Required | `true` | Master flag enabling/disabling push/email reminders. |
| `emailVerified` | `Boolean` | Required | `false` | Status indicating if the registration email was confirmed. |
| `createdAt` | `Date` | Immutable | Current Date | Account registration timestamp. |
| `updatedAt` | `Date` | Auto-updated | Current Date | Profile last update timestamp. |

---

### 2.2 `cycles` Collection
*Manages the 30-day tracking cycle lifecycle, calendar boundary dates, and persistent streak count.*

| Field Name | Data Type | Constraint / Validation | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Primary Key, Immutable | Auto-generated | Unique cycle identifier. |
| `userId` | `ObjectId` | Required, Ref: `users._id`, Indexed | — | Foreign key referencing the student owner. |
| `cycleNumber`| `Number` | Required, Integer, Min: $1$ | `1` | Ordinal sequence of cycles for this user ($1, 2, 3 \dots$). |
| `startDate` | `Date` | Required | — | Calendar date of Day 1 (normalized to student local midnight). |
| `endDate` | `Date` | Required | — | Calendar date of Day 30 (`startDate + 29 days`). |
| `status` | `String` | Enum: `['active', 'completed', 'abandoned']` | `'active'` | Current state of the tracking cycle. |
| `currentStreak`| `Number`| Required, Integer, Min: $0$ | `0` | Count of continuous consecutive logged days. |
| `targetWakeUpTime` | `String` | Required, Format: `HH:mm` | — | Snapshot of target wake-up time frozen at cycle creation. |
| `targetSleepTime` | `String` | Required, Format: `HH:mm` | — | Snapshot of target sleep time frozen at cycle creation. |
| `createdAt` | `Date` | Immutable | Current Date | Cycle start timestamp. |
| `updatedAt` | `Date` | Auto-updated | Current Date | Status update timestamp. |

---

### 2.3 `dailyActivities` Collection
*Stores daily student responses, habit metrics across 12 life areas, and reflection notes.*

| Field Name | Data Type | Constraint / Validation | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Primary Key, Immutable | Auto-generated | Unique daily activity record ID. |
| `userId` | `ObjectId` | Required, Ref: `users._id`, Indexed | — | Foreign key referencing the student. |
| `cycleId` | `ObjectId` | Required, Ref: `cycles._id`, Indexed | — | Foreign key referencing the active cycle. |
| `date` | `Date` | Required, Normalized to local midnight | — | Calendar date of activity. Part of unique compound index. |
| `dayNumber` | `Number` | Required, Integer: $1 \dots 30$ | — | Sequential day index within the 30-day cycle. |
| `isOffDay` | `Boolean` | Required | `false` | `true` if university is not applicable (holiday/weekend). |
| `isMissedDay` | `Boolean` | Required | `false` | `true` if auto-generated by midnight cron backfill. |
| `isGraceEntry` | `Boolean` | Required | `false` | `true` if submitted on Day $N+1$ (yesterday grace window). |
| `item1_earlyMorning` | `Boolean` | Required | `false` | Woke up on or before scheduled `targetWakeUpTime`. |
| `item2_universityAttendance` | `String` | Enum: `['yes', 'no', 'off_day']` | `'no'` | University attendance status. |
| `item3_classParticipation_attended` | `Number` | Min: $0$, Clamped $\le \text{total}$ | `0` | Number of classes attended. |
| `item3_classParticipation_total` | `Number` | Min: $0$ ($0$ allowed on off-days) | `0` | Total scheduled classes for the day. |
| `item4_personalDiscipline` | `Boolean` | Required | `false` | Completed morning routine / religious practice. |
| `item5_socialInteractions` | `Number` | Integer, Min: $0$, Max: $50$ | `0` | Count of meaningful, positive social interactions. |
| `item6_dailyLearning` | `String` | Trim, Max: $500$ characters | `""` | Free-text note on what was learned today. |
| `item7_physicalActivity` | `Boolean` | Required | `false` | Whether physical exercise was performed. |
| `item7_physicalMinutes` | `Number` | Integer, Min: $0$, Max: $1440$ | `0` | Duration of physical exercise in minutes. |
| `item8_skillDevelopmentMinutes` | `Number` | Integer, Min: $0$, Max: $1440$ | `0` | Time spent on skill development or earning activities. |
| `item9_classWorkRecap` | `Boolean` | Required | `false` | Reviewed class materials and organized notes. |
| `item10_socialMediaControl` | `String` | Enum: `['controlled', 'useful', 'excessive']` | `'controlled'`| Social media and news consumption control level. |
| `item11_selfReflection` | `String` | Trim, Max: $500$ characters | `""` | Free-text reflective personal journal entry. |
| `item12_sleepOnTime` | `Boolean` | Required | `false` | Slept on or before scheduled `targetSleepTime`. |
| `submittedAt` | `Date` | Required | Current Date | Exact timestamp of form submission. |

---

### 2.4 `dailyScores` Collection
*Stores normalized percentages, point breakdown, and max available points for every day.*

| Field Name | Data Type | Constraint / Validation | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Primary Key, Immutable | Auto-generated | Unique daily score identifier. |
| `userId` | `ObjectId` | Required, Ref: `users._id`, Indexed | — | Foreign key referencing the student. |
| `cycleId` | `ObjectId` | Required, Ref: `cycles._id`, Indexed | — | Foreign key referencing the cycle. |
| `dailyActivityId` | `ObjectId` | Required, Ref: `dailyActivities._id` | — | $1:1$ reference to the raw activity record. |
| `date` | `Date` | Required, Normalized to local midnight | — | Calendar date matching activity record. |
| `dayNumber` | `Number` | Required, Integer: $1 \dots 30$ | — | Sequential day index within the cycle. |
| `totalScore` | `Number` | Required, Range: $[0.00, 100.00]$ | — | Clamped final Daily Score percentage (2 decimals). |
| `maxAvailablePoints` | `Number` | Enum: `[100, 82]` | `100` | Max possible points ($100$ normal, $82$ on off-days). |
| `achievedPoints` | `Number` | Required, Range: $[0.0, 100.0]$ | — | Total points earned across the 12 items. |
| `scores.item1` | `Number` | Values: $0$ or $8$ | `0` | Early morning points. |
| `scores.item2` | `Number` | Values: $0$ or $10$ | `0` | University attendance points ($0$ on off-day). |
| `scores.item3` | `Number` | Range: $[0.0, 8.0]$ | `0` | Class participation points ($0$ on off-day). |
| `scores.item4` | `Number` | Values: $0$ or $8$ | `0` | Personal discipline points. |
| `scores.item5` | `Number` | Values: $0, 2, 4,$ or $6$ | `0` | Social interaction points ($\ge 3 \rightarrow 6$). |
| `scores.item6` | `Number` | Values: $0$ or $10$ | `0` | Daily learning points (non-empty text = 10). |
| `scores.item7` | `Number` | Values: $0, 5,$ or $10$ | `0` | Physical exercise points ($\ge 15\text{m} \rightarrow 10$). |
| `scores.item8` | `Number` | Values: $0, 3, 6,$ or $10$ | `0` | Skill development points ($\ge 60\text{m} \rightarrow 10$). |
| `scores.item9` | `Number` | Values: $0$ or $10$ | `0` | Class work recap points. |
| `scores.item10`| `Number` | Values: $0, 3,$ or $6$ | `0` | Social media control points. |
| `scores.item11`| `Number` | Values: $0$ or $8$ | `0` | Self-reflection points (non-empty text = 8). |
| `scores.item12`| `Number` | Values: $0$ or $6$ | `0` | Sleeping on time points. |
| `createdAt` | `Date` | Immutable | Current Date | Score computation timestamp. |

---

### 2.5 `weeklySummaries` Collection
*Caches compiled 7-day interval metrics, comparison trends, and targeted focus tips.*

| Field Name | Data Type | Constraint / Validation | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Primary Key, Immutable | Auto-generated | Unique weekly summary ID. |
| `userId` | `ObjectId` | Required, Ref: `users._id`, Indexed | — | Foreign key referencing the student. |
| `cycleId` | `ObjectId` | Required, Ref: `cycles._id`, Indexed | — | Foreign key referencing the cycle. |
| `weekNumber` | `Number` | Required, Integer: $1 \dots 5$ | — | Week index ($1\dots4$ are 7-day weeks; $5$ is Final Stretch). |
| `startDay` | `Number` | Required, Values: $1, 8, 15, 22, 29$ | — | Starting day number of the week. |
| `endDay` | `Number` | Required, Values: $7, 14, 21, 28, 30$ | — | Ending day number of the week. |
| `startDate` | `Date` | Required | — | Calendar start date of the week. |
| `endDate` | `Date` | Required | — | Calendar end date of the week. |
| `weeklyAverageScore` | `Number` | Range: $[0.00, 100.00]$ | — | Arithmetic mean of Daily Scores in this week. |
| `daysTracked` | `Number` | Integer, Range: $0 \dots 7$ | — | Days completed with score $> 0$. |
| `daysInWeek` | `Number` | Enum: `[7, 2]` | `7` | Duration of the period ($7$ for weeks 1–4; $2$ for Final Stretch). |
| `bestDay.date` | `Date` | Optional | — | Date of highest scoring day in week. |
| `bestDay.score`| `Number` | Range: $[0.00, 100.00]$ | — | Score achieved on best day. |
| `lowestDay.date`| `Date` | Optional | — | Date of lowest scoring day in week. |
| `lowestDay.score`| `Number`| Range: $[0.00, 100.00]$ | — | Score achieved on lowest day. |
| `streakAtEndOfWeek` | `Number`| Integer, Min: $0$ | `0` | Active streak count at the end of this week. |
| `areaBreakdown`| `Object` | 12 float keys (`item1` $\dots$ `item12`) | — | Average point performance percentage per area ($0.00 \dots 1.00$). |
| `deltaFromPreviousWeek` | `Number` | Float or `null` | `null` | Percentage difference from prior week (`null` for Week 1). |
| `focusTip` | `String` | Trim | `""` | Rule-generated tip targeting the lowest scoring area. |
| `isGenerated` | `Boolean` | Required | `false` | `true` once aggregation pipeline finishes. |
| `createdAt` | `Date` | Immutable | Current Date | Cache generation timestamp. |

---

### 2.6 `monthlyResults` Collection
*Stores 30-day Life Stage classifications, balance evaluations, and personalized insights.*

| Field Name | Data Type | Constraint / Validation | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Primary Key, Immutable | Auto-generated | Unique monthly report identifier. |
| `userId` | `ObjectId` | Required, Ref: `users._id`, Indexed | — | Foreign key referencing the student. |
| `cycleId` | `ObjectId` | Required, Ref: `cycles._id`, Indexed | — | Foreign key referencing the cycle. Part of unique compound index. |
| `cycleNumber`| `Number` | Required, Integer | — | Sequential cycle index. |
| `lifeScore` | `Number` | Required, Range: $[0.00, 100.00]$ | — | Arithmetic mean of all 30 Daily Scores. |
| `habitConsistency` | `Number` | Required, Range: $[0.00, 100.00]$ | — | Tracking consistency percentage: $\frac{\text{Days Tracked}}{30} \times 100$. |
| `daysTracked` | `Number` | Integer, Range: $0 \dots 30$ | — | Total days logged during the 30-day cycle. |
| `totalDays` | `Number` | Fixed Value: $30$ | `30` | Total scheduled days in cycle. |
| `lifeStage` | `Number` | Integer, Range: $1 \dots 10$ | — | Classified Life Stage ID. |
| `lifeStageName` | `String` | Required | — | Official title (e.g., `"High Achiever"`, `"Disciplined Student"`). |
| `lifeStageDescription`| `String`| Required | — | Educational description of the achieved stage. |
| `strengths` | `Array` | Exactly 3 objects | `[]` | Top 3 areas: `[{ item: Number, areaName: String, completionRate: Number }]`. |
| `weaknesses` | `Array` | Exactly 3 objects | `[]` | Bottom 3 areas: `[{ item: Number, areaName: String, completionRate: Number }]`. |
| `areaCompletionRates` | `Object` | 12 float keys (`item1` $\dots$ `item12`) | — | Completion rates ($0.00 \dots 1.00$) for 12 areas (used by radar charts). |
| `progressTrend`| `Array` | Up to 5 objects | `[]` | Weekly progress points: `[{ weekNumber, averageScore, daysTracked }]`. |
| `lifeInsight` | `String` | Required | — | Predefined rule-matched personalized reflection paragraph. |
| `improvementSuggestions`| `Array of Strings` | $2 \dots 3$ actionable items | `[]` | Practical improvement steps for the next cycle. |
| `hasEnoughData` | `Boolean` | Required | `true` | `false` if `habitConsistency < 50%` (shows limited-data caveat). |
| `isGenerated` | `Boolean` | Required | `false` | `true` once finalized and cached. |
| `createdAt` | `Date` | Immutable | Current Date | Report finalization timestamp. |

---

### 2.7 `pushSubscriptions` Collection
*Manages client browser push notification endpoints and VAPID public/private key pairs.*

| Field Name | Data Type | Constraint / Validation | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Primary Key, Immutable | Auto-generated | Unique subscription identifier. |
| `userId` | `ObjectId` | Required, Ref: `users._id`, Indexed | — | Foreign key referencing the student. |
| `endpoint` | `String` | Required, Trim | — | Browser push service endpoint URL. |
| `keys.p256dh` | `String` | Required | — | Client public encryption key for Web Push. |
| `keys.auth` | `String` | Required | — | Client authentication secret for Web Push. |
| `createdAt` | `Date` | Immutable | Current Date | Subscription registration timestamp. |

---

*End of Database Schema Specification — `databse-schema.md`*
