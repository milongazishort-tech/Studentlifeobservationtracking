# RESTful API Specification
## Student Life Progress & Self-Improvement Tracker
**Course:** CSE 3210 (Software Engineering / App Development) · SMUCT  
**Architecture Source:** `arcthitecture.md` (v2.0), `PRD.md` (v2.0), `database.md` (v2.1) & `databse-schema.md`  
**Protocol:** HTTPS / RESTful JSON  
**Base URL:** `http://localhost:5000/api/v1` (Production: `https://api.studentlifetracker.com/api/v1`)  
**Specification Version:** `1.1.0` (with Standardized Versioning & Complete Error Handling)

---

## Table of Contents
1. [API Overview & Standards](#1-api-overview--standards)
2. [API Version Control Strategy](#2-api-version-control-strategy)
3. [Authentication & Security Headers](#3-authentication--security-headers)
4. [Global Error Handling Framework](#4-global-error-handling-framework)
   - 4.1 [Standard Error Response Envelope](#41-standard-error-response-envelope)
   - 4.2 [Comprehensive Error Code Directory](#42-comprehensive-error-code-directory)
   - 4.3 [HTTP Status Code Mapping & Scenarios](#43-http-status-code-mapping--scenarios)
   - 4.4 [Express Global Error Handler Implementation](#44-express-global-error-handler-implementation)
5. [Endpoint Matrix (Quick Reference)](#5-endpoint-matrix-quick-reference)
6. [Detailed API Endpoints (`/api/v1`)](#6-detailed-api-endpoints-apiv1)
   - 6.1 [Authentication Service (`/api/v1/auth`)](#61-authentication-service-apiv1auth)
   - 6.2 [User & Profile Service (`/api/v1/users`)](#62-user--profile-service-apiv1users)
   - 6.3 [Cycle Lifecycle Service (`/api/v1/cycles`)](#63-cycle-lifecycle-service-apiv1cycles)
   - 6.4 [Daily Checklist Service (`/api/v1/checklist`)](#64-daily-checklist-service-apiv1checklist)
   - 6.5 [Daily Score Service (`/api/v1/scores`)](#65-daily-score-service-apiv1scores)
   - 6.6 [Weekly Report Service (`/api/v1/weekly`)](#66-weekly-report-service-apiv1weekly)
   - 6.7 [Monthly Report Service (`/api/v1/monthly`)](#67-monthly-report-service-apiv1monthly)
   - 6.8 [Notification & Web Push Service (`/api/v1/notifications`)](#68-notification--web-push-service-apiv1notifications)

---

## 1. API Overview & Standards

- **Format:** All requests and responses exchange UTF-8 encoded JSON with header `Content-Type: application/json`.
- **Date Format:** ISO 8601 extended format (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Time Format:** 24-hour military notation (`HH:mm`, e.g., `"06:30"`, `"23:00"`).
- **Timezone Awareness:** Client requests MUST include the header `x-timezone-offset` (representing client time difference from UTC in minutes, e.g., `-360` for Bangladesh UTC+6) to ensure midnight calendar dates align with student local time.

---

## 2. API Version Control Strategy

The API implements **URI Path Versioning** backed by **Semantic Versioning (SemVer)** to guarantee backward compatibility as the product evolves.

### 2.1 Versioning Rules
1. **URI Prefixing:** All endpoints are explicitly prefixed with the major version identifier:
   ```
   /api/v1/...
   ```
2. **Major Versions (`v1` $\rightarrow$ `v2`):** Introduced ONLY when there are breaking contract changes (e.g., removing a required checklist field, changing scoring weight distributions, or restructuring the response envelope).
3. **Minor / Patch Updates:** Backward-compatible changes (e.g., adding non-breaking optional fields, updating insights generation copy, or internal query optimizations) do not alter the URI path.
4. **Deprecation Policy:** When a version is deprecated:
   - The server appends standard HTTP deprecation headers:
     ```http
     Deprecation: @1735689600
     Sunset: Wed, 31 Dec 2026 23:59:59 GMT
     Link: <https://api.studentlifetracker.com/docs/v2>; rel="successor-version"
     ```
   - Previous versions remain supported for at least **90 days** post-deprecation notice.

---

## 3. Authentication & Security Headers

Protected endpoints require the standard HTTP Bearer token scheme:

```http
Authorization: Bearer <jwt_access_token>
x-timezone-offset: -360
```

- **Algorithm:** HS256
- **Token Payload:** `{ "userId": "655b1a1f4f1c2d0012a4b801", "email": "milon.cse@smuct.edu.bd" }`
- **Token Expiry:** 7 days

---

## 4. Global Error Handling Framework

### 4.1 Standard Error Response Envelope

Every error returned by the API follows a deterministic, client-friendly structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Class participation attended cannot exceed total scheduled classes.",
    "field": "item3_classParticipation_attended",
    "timestamp": "2026-11-20T21:45:00.000Z",
    "path": "/api/v1/checklist"
  }
}
```

- `code` (`String`): Machine-readable programmatic error identifier.
- `message` (`String`): Human-readable descriptive explanation suitable for UI presentation.
- `field` (`String | null`): Exact payload property that caused the failure (if applicable).
- `timestamp` (`Date`): ISO timestamp when the error was trapped.
- `path` (`String`): Endpoint URI where the exception was triggered.

---

### 4.2 Comprehensive Error Code Directory

| HTTP Status | Error Code (`code`) | Trigger Condition |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Request payload fails schema validation rules (e.g., input out of bounds, invalid regex). |
| `400` | `INVALID_TIME_FORMAT` | Time string fails `HH:mm` regex or is outside $00:00 \dots 23:59$. |
| `400` | `GRACE_WINDOW_EXPIRED`| Attempting to submit yesterday's checklist past the 24-hour cutoff window. |
| `400` | `WEEK_NOT_UNLOCKED` | Attempting to access weekly analytics before that week has concluded. |
| `400` | `CYCLE_NOT_COMPLETED`| Attempting to fetch the 30-day monthly report before Day 30 is completed. |
| `401` | `UNAUTHORIZED` | Missing `Authorization` header, token malformed, or secret mismatch. |
| `401` | `TOKEN_EXPIRED` | JWT validity period ($\ge 7$ days) has lapsed. Client must re-authenticate. |
| `401` | `INVALID_CREDENTIALS` | Password mismatch or user account not found during login. |
| `403` | `EMAIL_NOT_VERIFIED` | Account has not clicked the activation link dispatched via email. |
| `403` | `FORBIDDEN_RESOURCE` | Authenticated user attempts to modify or view data belonging to another student. |
| `404` | `NOT_FOUND` | Generic resource (cycle, user, score) does not exist in database. |
| `404` | `NO_ACTIVE_CYCLE` | Action requires an ongoing cycle, but none has status `'active'`. |
| `404` | `NO_ENTRY_TODAY` | Checklist inquiry for today has not been submitted yet. |
| `409` | `EMAIL_ALREADY_EXISTS`| Attempting to register an email already present in `users`. |
| `409` | `ACTIVE_CYCLE_EXISTS` | Attempting to start a new cycle when an active cycle is currently ongoing. |
| `409` | `ALREADY_SUBMITTED_TODAY`| Attempting `POST /checklist` when a record for today already exists (client must use `PUT`). |
| `429` | `RATE_LIMIT_EXCEEDED`| Client exceeded requests threshold ($100\text{ req}/15\text{m}$ or $10\text{ auth req}/15\text{m}$). |
| `500` | `INTERNAL_SERVER_ERROR`| Uncaught server error, database network timeout, or aggregation crash. |

---

### 4.3 HTTP Status Code Mapping & Scenarios

| Status Code | Description | Scenario Example |
|---|---|---|
| **200 OK** | Standard success | Fetching profile, reading weekly report, updating checklist. |
| **201 Created** | Entity created | New account registration, cycle initialization, first-time daily checklist submission. |
| **400 Bad Request** | Syntax / rule failure | Class participation fraction $a > b$, text note $> 500$ chars, invalid start date in future. |
| **401 Unauthorized** | Missing/invalid token | Expired JWT token in header, missing Bearer token on protected routes. |
| **403 Forbidden** | Policy restriction | Unverified email attempting to start a cycle, user trying to access other user's cycle. |
| **404 Not Found** | Missing record | Requesting `/api/v1/scores/cycle/non_existent_id`. |
| **409 Conflict** | State conflict | Starting cycle 2 while cycle 1 is active, submitting checklist twice on same calendar date. |
| **429 Too Many Requests** | Rate limit throttled | Brute-force login attempts from a single IP. |
| **500 Server Error** | Unexpected crash | MongoDB connection drop during multi-document transaction. |

---

### 4.4 Express Global Error Handler Implementation

The following production-ready middleware handles and normalizes all errors across the application:

```javascript
// middleware/errorHandler.middleware.js
const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred. Please try again later.';
  let field = err.field || null;

  // 1. Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    const firstKey = Object.keys(err.errors)[0];
    message = err.errors[firstKey].message;
    field = firstKey;
  }

  // 2. MongoDB Duplicate Key (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const fieldName = Object.keys(err.keyValue)[0];
    if (fieldName === 'email') {
      code = 'EMAIL_ALREADY_EXISTS';
      message = 'An account with this email address already exists.';
      field = 'email';
    } else if (fieldName === 'userId' && err.keyValue.date) {
      code = 'ALREADY_SUBMITTED_TODAY';
      message = 'Checklist for this date has already been submitted. Use PUT /today to update.';
    } else {
      code = 'DUPLICATE_ENTRY';
      message = `Duplicate value recorded for field: ${fieldName}`;
      field = fieldName;
    }
  }

  // 3. JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid authentication token provided.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Your session has expired. Please log in again.';
  }

  // Log server-side critical errors
  if (statusCode === 500) {
    console.error(`[CRITICAL ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  // Unified Error Payload
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      field,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  });
};

module.exports = errorHandler;
```

---

## 5. Endpoint Matrix (Quick Reference)

| Category | Method | Versioned Endpoint Path | Auth Req? | Purpose |
|---|---|---|:---:|---|
| **Auth** | `POST` | `/api/v1/auth/register` | ❌ No | Register new student account |
| **Auth** | `POST` | `/api/v1/auth/login` | ❌ No | Authenticate & retrieve JWT |
| **Auth** | `GET` | `/api/v1/auth/verify-email/:token` | ❌ No | Confirm student email address |
| **Auth** | `POST` | `/api/v1/auth/forgot-password` | ❌ No | Request password recovery email |
| **Auth** | `POST` | `/api/v1/auth/reset-password/:token`| ❌ No | Set new password via token |
| **User** | `GET` | `/api/v1/users/me` | ✅ Yes | Fetch profile & targets |
| **User** | `PUT` | `/api/v1/users/me` | ✅ Yes | Update profile info & times |
| **User** | `DELETE`| `/api/v1/users/me` | ✅ Yes | Cascaded account & data deletion |
| **Cycle**| `POST` | `/api/v1/cycles` | ✅ Yes | Start a new 30-day tracking cycle |
| **Cycle**| `GET` | `/api/v1/cycles/active` | ✅ Yes | Get currently active cycle status |
| **Cycle**| `GET` | `/api/v1/cycles` | ✅ Yes | List user cycle history |
| **Cycle**| `PATCH`| `/api/v1/cycles/:id/abandon` | ✅ Yes | Cancel an ongoing active cycle |
| **Checklist** | `POST`| `/api/v1/checklist` | ✅ Yes | Submit today's 12-item checklist |
| **Checklist** | `PUT` | `/api/v1/checklist/today` | ✅ Yes | Edit/update today's checklist |
| **Checklist** | `PUT` | `/api/v1/checklist/yesterday` | ✅ Yes | Edit/fill yesterday's entry (grace) |
| **Checklist** | `GET` | `/api/v1/checklist/today` | ✅ Yes | Fetch today's saved activity entry |
| **Checklist** | `GET` | `/api/v1/checklist/:date` | ✅ Yes | Fetch entry by date (`YYYY-MM-DD`) |
| **Scores**| `GET` | `/api/v1/scores/today` | ✅ Yes | View today's calculated score |
| **Scores**| `GET` | `/api/v1/scores/:date` | ✅ Yes | View score by date (`YYYY-MM-DD`) |
| **Scores**| `GET` | `/api/v1/scores/cycle/:cycleId` | ✅ Yes | View all 30 scores for a cycle |
| **Weekly**| `GET` | `/api/v1/weekly/:weekNumber` | ✅ Yes | Get 7-day report (Weeks 1–4, 5) |
| **Monthly**| `GET` | `/api/v1/monthly/:cycleId` | ✅ Yes | Get 30-day Life Stage report |
| **Notify**| `POST` | `/api/v1/notifications/subscribe` | ✅ Yes | Register Web Push VAPID keys |
| **Notify**| `DELETE`| `/api/v1/notifications/unsubscribe` | ✅ Yes | Unregister push subscription |

---

## 6. Detailed API Endpoints (`/api/v1`)

### 6.1 Authentication Service (`/api/v1/auth`)

#### 1. Register User
- **Endpoint:** `POST /api/v1/auth/register`
- **Auth Required:** ❌ No
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Md. Mahfuzur Rahman Milon",
  "email": "milon.cse@smuct.edu.bd",
  "password": "Password123#",
  "university": "Shanto-Mariam University of Creative Technology",
  "department": "Computer Science & Engineering"
}
```
- **Responses:**
  - `201 Created`:
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email before logging in."
}
```
  - `400 Bad Request` (`VALIDATION_ERROR`): Missing fields or password too weak.
  - `409 Conflict` (`EMAIL_ALREADY_EXISTS`): Email already registered.

---

#### 2. User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Auth Required:** ❌ No
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "email": "milon.cse@smuct.edu.bd",
  "password": "Password123#"
}
```
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "655b1a1f4f1c2d0012a4b801",
      "name": "Md. Mahfuzur Rahman Milon",
      "email": "milon.cse@smuct.edu.bd",
      "university": "Shanto-Mariam University of Creative Technology",
      "department": "Computer Science & Engineering",
      "targetWakeUpTime": "06:30",
      "targetSleepTime": "23:00"
    }
  }
}
```
  - `401 Unauthorized` (`INVALID_CREDENTIALS`): Wrong password or email.
  - `403 Forbidden` (`EMAIL_NOT_VERIFIED`): Email address unconfirmed.

---

#### 3. Email Verification
- **Endpoint:** `GET /api/v1/auth/verify-email/:token`
- **Auth Required:** ❌ No
- **URL Params:** `token` (String, crypto hash)
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "message": "Email address verified successfully. You may now log in."
}
```
  - `400 Bad Request` (`INVALID_OR_EXPIRED_TOKEN`): Token expired or invalid.

---

#### 4. Forgot Password
- **Endpoint:** `POST /api/v1/auth/forgot-password`
- **Auth Required:** ❌ No
- **Request Body:**
```json
{
  "email": "milon.cse@smuct.edu.bd"
}
```
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "message": "If the account exists, a password reset link has been dispatched."
}
```

---

#### 5. Reset Password
- **Endpoint:** `POST /api/v1/auth/reset-password/:token`
- **Auth Required:** ❌ No
- **URL Params:** `token` (String)
- **Request Body:**
```json
{
  "newPassword": "NewStrongPassword456#"
}
```
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "message": "Password has been successfully updated. Please log in."
}
```

---

### 6.2 User & Profile Service (`/api/v1/users`)

#### 1. Get Current Profile
- **Endpoint:** `GET /api/v1/users/me`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "655b1a1f4f1c2d0012a4b801",
    "name": "Md. Mahfuzur Rahman Milon",
    "email": "milon.cse@smuct.edu.bd",
    "university": "Shanto-Mariam University of Creative Technology",
    "department": "Computer Science & Engineering",
    "targetWakeUpTime": "06:30",
    "targetSleepTime": "23:00",
    "reminderTime": "21:30",
    "reminderEnabled": true,
    "emailVerified": true,
    "createdAt": "2026-11-01T08:00:00.000Z"
  }
}
```

---

#### 2. Update Profile & Target Times
- **Endpoint:** `PUT /api/v1/users/me`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Request Body:**
```json
{
  "name": "Md. Mahfuzur Rahman Milon",
  "university": "Shanto-Mariam University of Creative Technology",
  "department": "Computer Science & Engineering",
  "targetWakeUpTime": "06:00",
  "targetSleepTime": "22:30",
  "reminderTime": "21:00",
  "reminderEnabled": true
}
```
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "data": {
    "targetWakeUpTime": "06:00",
    "targetSleepTime": "22:30",
    "reminderTime": "21:00",
    "reminderEnabled": true
  },
  "message": "Profile targets updated successfully."
}
```

---

#### 3. Delete Account (Cascaded Data Erasure)
- **Endpoint:** `DELETE /api/v1/users/me`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "message": "Account and all associated tracking data have been permanently erased."
}
```

---

### 6.3 Cycle Lifecycle Service (`/api/v1/cycles`)

#### 1. Start New 30-Day Cycle
- **Endpoint:** `POST /api/v1/cycles`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Headers:** `x-timezone-offset: -360`
- **Request Body:**
```json
{
  "startDate": "2026-11-01T00:00:00.000Z",
  "targetWakeUpTime": "06:30",
  "targetSleepTime": "23:00"
}
```
- **Responses:**
  - `201 Created`:
```json
{
  "success": true,
  "data": {
    "cycleId": "655b1b3a4f1c2d0012a4b802",
    "cycleNumber": 1,
    "startDate": "2026-11-01T00:00:00.000Z",
    "endDate": "2026-11-30T00:00:00.000Z",
    "status": "active",
    "currentStreak": 0,
    "targetWakeUpTime": "06:30",
    "targetSleepTime": "23:00"
  }
}
```
  - `409 Conflict` (`ACTIVE_CYCLE_EXISTS`): A cycle is already active. Must complete or abandon it first.

---

#### 2. Get Active Cycle Status
- **Endpoint:** `GET /api/v1/cycles/active`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "data": {
    "cycleId": "655b1b3a4f1c2d0012a4b802",
    "cycleNumber": 1,
    "dayNumber": 14,
    "startDate": "2026-11-01T00:00:00.000Z",
    "endDate": "2026-11-30T00:00:00.000Z",
    "status": "active",
    "currentStreak": 14,
    "hasSubmittedToday": true
  }
}
```
  - `404 Not Found` (`NO_ACTIVE_CYCLE`): No cycle currently in progress.

---

#### 3. Get Cycle History
- **Endpoint:** `GET /api/v1/cycles`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "cycleId": "655b1b3a4f1c2d0012a4b802",
      "cycleNumber": 1,
      "startDate": "2026-11-01T00:00:00.000Z",
      "endDate": "2026-11-30T00:00:00.000Z",
      "status": "completed",
      "currentStreak": 29
    }
  ]
}
```

---

#### 4. Abandon Ongoing Cycle
- **Endpoint:** `PATCH /api/v1/cycles/:id/abandon`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **URL Params:** `id` (ObjectId of the active cycle)
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "message": "Cycle marked as abandoned. You may now start a fresh cycle."
}
```

---

### 6.4 Daily Checklist Service (`/api/v1/checklist`)

#### 1. Submit Today's Checklist
- **Endpoint:** `POST /api/v1/checklist`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Headers:** `x-timezone-offset: -360`
- **Request Body (12 Life Areas):**
```json
{
  "isOffDay": false,
  "item1_earlyMorning": true,
  "item2_universityAttendance": "yes",
  "item3_classParticipation_attended": 4,
  "item3_classParticipation_total": 4,
  "item4_personalDiscipline": true,
  "item5_socialInteractions": 4,
  "item6_dailyLearning": "Practiced full-stack REST API validation with express-validator.",
  "item7_physicalActivity": true,
  "item7_physicalMinutes": 30,
  "item8_skillDevelopmentMinutes": 75,
  "item9_classWorkRecap": true,
  "item10_socialMediaControl": "controlled",
  "item11_selfReflection": "High academic focus; bedtime routine maintained.",
  "item12_sleepOnTime": true
}
```
- **Responses:**
  - `201 Created`:
```json
{
  "success": true,
  "data": {
    "dayNumber": 14,
    "date": "2026-11-14T00:00:00.000Z",
    "totalScore": 100.0,
    "achievedPoints": 100.0,
    "maxAvailablePoints": 100,
    "currentStreak": 14,
    "scores": {
      "item1": 8,
      "item2": 10,
      "item3": 8,
      "item4": 8,
      "item5": 6,
      "item6": 10,
      "item7": 10,
      "item8": 10,
      "item9": 10,
      "item10": 6,
      "item11": 8,
      "item12": 6
    }
  },
  "message": "Today's checklist recorded and scored successfully."
}
```
  - `400 Bad Request` (`VALIDATION_ERROR`): Validation failure (e.g., attended > total classes).
  - `409 Conflict` (`ALREADY_SUBMITTED_TODAY`): Entry already exists. Use `PUT /api/v1/checklist/today` to edit.

---

#### 2. Edit Today's Checklist (`PUT /today`)
- **Endpoint:** `PUT /api/v1/checklist/today`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Headers:** `x-timezone-offset: -360`
- **Request Body:** Same schema as `POST /api/v1/checklist`.
- **Behavior:** Updates existing record and re-calculates score. **Streak does NOT increment**.
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "data": {
    "dayNumber": 14,
    "totalScore": 94.0,
    "achievedPoints": 94.0,
    "currentStreak": 14,
    "scores": { "item1": 8, "item2": 10, "...": "..." }
  },
  "message": "Today's entry successfully updated."
}
```

---

#### 3. Edit Yesterday's Checklist (Grace Window)
- **Endpoint:** `PUT /api/v1/checklist/yesterday`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Headers:** `x-timezone-offset: -360`
- **Request Body:** Same schema as `POST /api/v1/checklist`.
- **Responses:**
  - `200 OK`: Returns recalculated score for yesterday.
  - `400 Bad Request` (`GRACE_WINDOW_EXPIRED`): Submitted past the 1-day grace limit.

---

#### 4. Get Today's Activity Record
- **Endpoint:** `GET /api/v1/checklist/today`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Headers:** `x-timezone-offset: -360`
- **Responses:**
  - `200 OK`: Returns the raw 12-item responses submitted today.
  - `404 Not Found` (`NO_ENTRY_TODAY`): Nothing submitted yet for today.

---

### 6.5 Daily Score Service (`/api/v1/scores`)

#### 1. Get Today's Score Breakdown
- **Endpoint:** `GET /api/v1/scores/today`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Headers:** `x-timezone-offset: -360`
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "data": {
    "date": "2026-11-14T00:00:00.000Z",
    "dayNumber": 14,
    "totalScore": 100.0,
    "achievedPoints": 100.0,
    "maxAvailablePoints": 100,
    "scores": {
      "item1": 8, "item2": 10, "item3": 8, "item4": 8,
      "item5": 6, "item6": 10, "item7": 10, "item8": 10,
      "item9": 10, "item10": 6, "item11": 8, "item12": 6
    }
  }
}
```

---

#### 2. Get All Scores for Active Cycle
- **Endpoint:** `GET /api/v1/scores/cycle/:cycleId`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **URL Params:** `cycleId`
- **Responses:**
  - `200 OK`: Returns array of 30 score objects (used to render 30-day timeline chart).

---

### 6.6 Weekly Report Service (`/api/v1/weekly`)

#### 1. Get Weekly Analytics & Focus Tip
- **Endpoint:** `GET /api/v1/weekly/:weekNumber`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **URL Params:** `weekNumber` (Integer: $1, 2, 3, 4,$ or $5$)
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "data": {
    "weekNumber": 2,
    "startDay": 8,
    "endDay": 14,
    "weeklyAverageScore": 88.5,
    "daysTracked": 7,
    "daysInWeek": 7,
    "bestDay": {
      "date": "2026-11-14T00:00:00.000Z",
      "score": 100.0
    },
    "lowestDay": {
      "date": "2026-11-09T00:00:00.000Z",
      "score": 76.0
    },
    "streakAtEndOfWeek": 14,
    "areaBreakdown": {
      "item1": 0.86,
      "item2": 1.00,
      "item3": 0.95,
      "item4": 0.88,
      "item5": 0.80,
      "item6": 1.00,
      "item7": 0.70,
      "item8": 0.85,
      "item9": 0.90,
      "item10": 0.75,
      "item11": 0.90,
      "item12": 0.80
    },
    "deltaFromPreviousWeek": 6.5,
    "focusTip": "Consider increasing physical exercise to at least 15 minutes daily for better balance."
  }
}
```
  - `400 Bad Request` (`WEEK_NOT_UNLOCKED`): Week has not completed yet.

---

### 6.7 Monthly Report Service (`/api/v1/monthly`)

#### 1. Get 30-Day Life Stage & Insight Report
- **Endpoint:** `GET /api/v1/monthly/:cycleId`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **URL Params:** `cycleId`
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "data": {
    "cycleNumber": 1,
    "lifeScore": 86.4,
    "habitConsistency": 96.67,
    "daysTracked": 29,
    "totalDays": 30,
    "lifeStage": 8,
    "lifeStageName": "High Achiever",
    "lifeStageDescription": "Demonstrates strong discipline and balanced consistency across academic and personal habits.",
    "strengths": [
      { "item": 2, "areaName": "University Attendance", "completionRate": 0.98 },
      { "item": 6, "areaName": "Daily Learning", "completionRate": 0.95 },
      { "item": 9, "areaName": "Class Work Recap", "completionRate": 0.92 }
    ],
    "weaknesses": [
      { "item": 7, "areaName": "Physical Activity", "completionRate": 0.65 },
      { "item": 10, "areaName": "Social Media Control", "completionRate": 0.70 },
      { "item": 12, "areaName": "Sleeping on Time", "completionRate": 0.72 }
    ],
    "areaCompletionRates": {
      "item1": 0.88, "item2": 0.98, "item3": 0.90, "item4": 0.85,
      "item5": 0.82, "item6": 0.95, "item7": 0.65, "item8": 0.84,
      "item9": 0.92, "item10": 0.70, "item11": 0.88, "item12": 0.72
    },
    "progressTrend": [
      { "weekNumber": 1, "averageScore": 82.0, "daysTracked": 7 },
      { "weekNumber": 2, "averageScore": 88.5, "daysTracked": 7 },
      { "weekNumber": 3, "averageScore": 85.0, "daysTracked": 7 },
      { "weekNumber": 4, "averageScore": 89.0, "daysTracked": 7 },
      { "weekNumber": 5, "averageScore": 91.0, "daysTracked": 1 }
    ],
    "lifeInsight": "During the last 30 days, your academic consistency and daily learning habits were exceptional. Physical activity and sleep timing showed some variance. Maintaining your current study discipline while setting a firmer bedtime will help you reach Stage 9.",
    "improvementSuggestions": [
      "Schedule 20 minutes of daily physical exercise before afternoon study sessions.",
      "Place your phone away from the bed 30 minutes before your target sleep time.",
      "Maintain your high university attendance rate into the next cycle."
    ],
    "hasEnoughData": true
  }
}
```
  - `400 Bad Request` (`CYCLE_NOT_COMPLETED`): Cycle is still on Days $1 \dots 29$.

---

### 6.8 Notification & Web Push Service (`/api/v1/notifications`)

#### 1. Subscribe to Web Push Notifications
- **Endpoint:** `POST /api/v1/notifications/subscribe`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/eXampleEndpoint123",
  "keys": {
    "p256dh": "BNcRdreALRF8FsEteGUn3N_JqcQSwPP3YoPrqUTNqnyStYwcFA29eKnstpkunf47n4YgHpt1",
    "auth": "tBHItSI1Wj5ixk3eA2uvBw"
  }
}
```
- **Responses:**
  - `201 Created`:
```json
{
  "success": true,
  "message": "Web push subscription registered successfully."
}
```

---

#### 2. Unsubscribe from Web Push Notifications
- **Endpoint:** `DELETE /api/v1/notifications/unsubscribe`
- **Auth Required:** ✅ Yes (`Bearer Token`)
- **Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/eXampleEndpoint123"
}
```
- **Responses:**
  - `200 OK`:
```json
{
  "success": true,
  "message": "Push subscription removed."
}
```

---

*End of RESTful API Specification — `api-spec.md` (v1.1.0)*
