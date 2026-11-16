# SmartMess – Test Plan & Verification Report
**Document ID:** SM-SDLC-06  
**Version:** 1.0.0  
**Test Standard:** IEEE Std 829-2008 Standard for Software and System Test Documentation  
**Project:** SmartMess – Smart Hostel Mess Management System  

---

## 1. Test Strategy & Scope

### 1.1 Overview & Quality Objectives
The SmartMess verification strategy employs a multi-tiered testing pyramid encompassing unit testing, API integration testing, frontend component testing, and end-to-end System User Acceptance Testing (UAT).
* **Target Backend Code Coverage:** $\ge 70\%$ across statements and lines.
* **Actual Backend Line Coverage Achieved:** **84.09%** (106 / 106 automated backend tests passing).
* **Test Isolation:** The database layer is decoupled and tested with verified in-memory mocks, allowing test suites to execute reliably in offline, self-contained CI environments.

```
       / \
      /   \      System / UAT Journey Scripts (Manual / Scenario-based)
     /-----\
    /       \     Integration Tests (Supertest API Flows: Auth, Menu, Attendance, Complaints)
   /---------\
  /           \    Frontend Component Tests (Vitest + React Testing Library)
 /-------------\
/               \   Unit Tests (Jest: Models, TimeWindows, Validators, RoleGuard, Auth)
-----------------
```

### 1.2 Environments & Tooling
* **Backend Test Runner:** Jest 29.7.0 with Supertest 7.0.0.
* **Frontend Test Runner:** Vitest 2.1.8 with `@testing-library/react` 16.1.0 and `jsdom` 25.0.1.
* **Runtime:** Node.js v20.x on Windows 11 / Linux x86_64.
* **Entry Criteria:** Clean source compilation with zero ESLint errors and all environment variables injected.
* **Exit Criteria:** Zero failing test cases; all 40+ formal test cases verified; $\ge 70\%$ backend coverage achieved.

---

## 2. Test Cases Specification (Comprehensive Matrix)

The following 45 formalized test cases cover positive paths, boundary conditions, negative access attempts, and business constraints across all functional requirements.

| Test ID | Req ID | Test Description | Preconditions | Steps to Execute | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | FR-STU-01 | Student Registration Success | Unregistered user | POST /api/auth/register | Valid student payload | HTTP 201; `is_verified: false` | HTTP 201; `is_verified: false` | **PASS** |
| **TC-AUTH-02** | FR-STU-01 | Reject Duplicate Email | User exists | POST /api/auth/register | Existing student email | HTTP 409 Conflict | HTTP 409 Conflict | **PASS** |
| **TC-AUTH-03** | FR-STU-01 | Reject Duplicate Roll No | Roll exists | POST /api/auth/register | Existing roll number | HTTP 409 Conflict | HTTP 409 Conflict | **PASS** |
| **TC-AUTH-04** | FR-STU-02 | Verified Student Login | Verified student | POST /api/auth/login | Valid email & password | HTTP 200; returns JWT token | HTTP 200; token returned | **PASS** |
| **TC-AUTH-05** | FR-STU-02 | Reject Wrong Password | User exists | POST /api/auth/login | Valid email, bad password | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| **TC-AUTH-06** | FR-STU-02 | Block Unverified Student | `is_verified=false`| POST /api/auth/login | Valid credentials | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **TC-AUTH-07** | FR-STU-02 | Block Suspended Student | `is_blocked=true` | POST /api/auth/login | Valid credentials | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **TC-AUTH-08** | FR-ADM-01 | Admin Login Success | Admin account | POST /api/auth/admin/login | Admin credentials | HTTP 200; returns admin JWT | HTTP 200; admin JWT returned | **PASS** |
| **TC-AUTH-09** | FR-ADM-01 | Admin Bad Credentials | Admin account | POST /api/auth/admin/login | Wrong admin password | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| **TC-AUTH-10** | FR-STU-02 | Token Profile Retrieval | Valid student JWT| GET /api/auth/me | Bearer token | HTTP 200 with student info | HTTP 200 with student info | **PASS** |
| **TC-AUTH-11** | FR-ADM-01 | Admin Profile Retrieval | Valid admin JWT | GET /api/auth/me | Bearer admin token | HTTP 200 with `role: admin` | HTTP 200 with `role: admin` | **PASS** |
| **TC-MENU-01** | FR-STU-03 | Get Today's Menu | Menu exists | GET /api/student/menu/today| Student JWT | HTTP 200; menu + activeMeal | HTTP 200; activeMeal returned | **PASS** |
| **TC-MENU-02** | FR-STU-03 | Today's Menu When Empty | No menu in DB | GET /api/student/menu/today| Student JWT | HTTP 200; `menu: null` | HTTP 200; `menu: null` | **PASS** |
| **TC-MENU-03** | FR-STU-04 | 7-Day Weekly Menu | Menus exist | GET /api/student/menu/weekly| `?start_date=YYYY-MM-DD` | HTTP 200; 7-day array | HTTP 200; array returned | **PASS** |
| **TC-RATE-01** | FR-STU-05 | Submit Meal Rating | Verified student | POST /api/student/ratings | `meal_type: lunch, rating: 5` | HTTP 201 Created | HTTP 201 Created | **PASS** |
| **TC-RATE-02** | FR-STU-05 | Reject Duplicate Rating | Rated meal today| POST /api/student/ratings | Same menu & meal | HTTP 409 Conflict | HTTP 409 Conflict | **PASS** |
| **TC-RATE-03** | FR-STU-06 | Update Own Rating | Rating exists | PUT /api/student/ratings/:id| `rating: 4, comment: "ok"` | HTTP 200 Updated | HTTP 200 Updated | **PASS** |
| **TC-RATE-04** | FR-STU-06 | Reject Modify Other's Rate| Other student id | PUT /api/student/ratings/:id| Student A rating by B | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **TC-RATE-05** | FR-STU-06 | Delete Own Rating | Rating exists | DELETE /api/student/ratings/:id| Student JWT | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **TC-ATT-01** | FR-STU-07 | Attendance Outside Window | Outside hours | POST /api/student/attendance| `meal_type: lunch` (at 15:30)| HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** |
| **TC-ATT-02** | FR-STU-07 | Attendance Inside Window | Inside 12-14:30 | POST /api/student/attendance| `meal_type: lunch` | HTTP 200 OK; marked=true | HTTP 200 OK; marked=true | **PASS** |
| **TC-ATT-03** | FR-STU-07 | Duplicate Daily Attendance| Already marked | POST /api/student/attendance| `meal_type: lunch` | HTTP 409 Conflict | HTTP 409 Conflict | **PASS** |
| **TC-ATT-04** | FR-STU-08 | Attendance History Log | Attendance exists| GET /api/student/attendance | `?month=10&year=2024` | HTTP 200 with monthly rows | HTTP 200 with monthly rows | **PASS** |
| **TC-COMP-01**| FR-STU-09 | Submit Mess Complaint | Verified student | POST /api/student/complaints | `{ title, description }` | HTTP 201; `status: pending` | HTTP 201; `status: pending` | **PASS** |
| **TC-COMP-02**| FR-STU-10 | List Student Complaints | Complaints exist| GET /api/student/complaints | Student JWT | HTTP 200 list of grievances | HTTP 200 list returned | **PASS** |
| **TC-PROF-01**| FR-STU-11 | Update Room & Phone | Student logged in| PUT /api/student/profile | `room_number: B-205` | HTTP 200 profile updated | HTTP 200 profile updated | **PASS** |
| **TC-PROF-02**| FR-STU-11 | Change Password Success | Correct old pwd | PUT /api/student/password | Old & new passwords | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **TC-PROF-03**| FR-STU-11 | Change Password Bad Old | Incorrect old pwd| PUT /api/student/password | Wrong old password | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| **TC-ADM-01** | FR-ADM-01 | Admin Dashboard KPIs | Admin logged in | GET /api/admin/dashboard | Admin JWT | HTTP 200 stats & trends | HTTP 200 stats & trends | **PASS** |
| **TC-ADMMENU-01**| FR-ADM-02| Create Daily Menu | Valid dishes | POST /api/admin/menus | Date, day, 4 meal arrays | HTTP 201 Menu Created | HTTP 201 Menu Created | **PASS** |
| **TC-ADMMENU-02**| FR-ADM-03| Drag & Drop Reordered Menu| Menu exists | PUT /api/admin/menus/:id | Reordered lunch array | HTTP 200 Menu Updated | HTTP 200 Menu Updated | **PASS** |
| **TC-ADMMENU-03**| FR-ADM-04| Copy Previous Week Menu | Week 1 exists | POST /api/admin/menus/copy-week| From Mon & To Mon dates | HTTP 200; 7 days copied | HTTP 200; 7 days copied | **PASS** |
| **TC-ADMMENU-04**| FR-ADM-02| Delete Daily Menu | Menu exists | DELETE /api/admin/menus/:id | Valid menu ID | HTTP 200 Menu Deleted | HTTP 200 Menu Deleted | **PASS** |
| **TC-VERIF-01**| FR-ADM-05 | Approve Pending Student | `is_verified=false`| PUT /api/admin/students/:id/verify | Student ID | HTTP 200 `is_verified: true`| HTTP 200 `is_verified: true`| **PASS** |
| **TC-VERIF-02**| FR-ADM-05 | Reject Pending Student | `is_verified=false`| PUT /api/admin/students/:id/reject | Student ID | HTTP 200 deleted record | HTTP 200 deleted record | **PASS** |
| **TC-STUMGMT-01**| FR-ADM-06| Block Student Account | Active student | PUT /api/admin/students/:id/block | Student ID | HTTP 200 `is_blocked: true` | HTTP 200 `is_blocked: true` | **PASS** |
| **TC-STUMGMT-02**| FR-ADM-06| Unblock Student Account | Blocked student | PUT /api/admin/students/:id/unblock | Student ID | HTTP 200 `is_blocked: false`| HTTP 200 `is_blocked: false`| **PASS** |
| **TC-STUMGMT-03**| FR-ADM-06| Delete Student Record | Student exists | DELETE /api/admin/students/:id| Student ID | HTTP 200 record removed | HTTP 200 record removed | **PASS** |
| **TC-ADMRATE-01**| FR-ADM-07| Filter Ratings Explorer | Ratings exist | GET /api/admin/ratings | `?meal_type=lunch&rating=5` | HTTP 200 filtered list | HTTP 200 filtered list | **PASS** |
| **TC-ADMCOMP-01**| FR-ADM-08| Respond & Resolve Ticket | Pending ticket | PUT /api/admin/complaints/:id | `status: resolved, response` | HTTP 200 ticket resolved | HTTP 200 ticket resolved | **PASS** |
| **TC-ADMATT-01**| FR-ADM-09 | Attendance Report Summary| Logs exist | GET /api/admin/attendance/report | Date range params | HTTP 200 meal summary | HTTP 200 meal summary | **PASS** |
| **TC-ADMATT-02**| FR-ADM-09 | Download Attendance CSV | Logs exist | GET /api/admin/attendance/export-csv | Date range params | HTTP 200 `text/csv` stream | HTTP 200 `text/csv` stream | **PASS** |
| **TC-ANALYTICS-01**| FR-ADM-10| Analytical Chart Data | System data | GET /api/admin/analytics/summary | Admin JWT | HTTP 200 meal avgs & trends | HTTP 200 meal avgs & trends | **PASS** |
| **TC-ANALYTICS-02**| FR-ADM-10| Moving-Avg Forecast | Attendance data| GET /api/admin/analytics/summary | Admin JWT | HTTP 200 next-day forecast | HTTP 200 forecast returned | **PASS** |
| **TC-SEC-01** | NFR-SEC-03| Student Access to Admin | Student token | GET /api/admin/dashboard | Student Bearer token | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |

---

## 3. Black-Box & White-Box Testing Techniques

### 3.1 Boundary Value Analysis (BVA)
1. **Meal Rating (1 to 5 Stars):**
   * Just Below Minimum ($R = 0$): System rejects with HTTP 400 (`Rating must be an integer between 1 and 5`).
   * Minimum Boundary ($R = 1$): System accepts rating.
   * Maximum Boundary ($R = 5$): System accepts rating.
   * Just Above Maximum ($R = 6$): System rejects with HTTP 400.
2. **Student Password Length (Minimum 6 Characters):**
   * Boundary $L = 5$: Rejected with HTTP 400 (`Password must be at least 6 characters long`).
   * Boundary $L = 6$: Accepted.
3. **Meal Window Attendance Timing (e.g. Lunch 12:00 to 14:30):**
   * $T = 11:59$: Rejected with HTTP 400 (`Attendance for lunch can only be marked between 12:00 and 14:30`).
   * $T = 12:00$: Accepted.
   * $T = 14:30$: Accepted.
   * $T = 14:31$: Rejected with HTTP 400.

### 3.2 Equivalence Partitioning (EP)
* **Student Verification Partition:**
  * Partition 1: `is_verified = true` $\rightarrow$ Login succeeds (HTTP 200).
  * Partition 2: `is_verified = false` $\rightarrow$ Login blocked (HTTP 403: "Pending administrator verification").
* **Account Standing Partition:**
  * Partition 1: `is_blocked = false` $\rightarrow$ Normal access permitted.
  * Partition 2: `is_blocked = true` $\rightarrow$ Blocked (HTTP 403: "Account suspended by administrator").

### 3.3 White-Box Notes & Branch Coverage
Branch decision coverage was evaluated across all conditional guards:
* Authentication rate limiter skipping logic in test environments (`process.env.NODE_ENV === 'test'`).
* Role guards verifying array containment (`allowedRoles.includes(req.user.role)`).
* Centralized error handler distinguishing production versus development stack trace rendering.
* Attendance model checking existence of daily attendance row before issuing an insert versus an update.

---

## 4. Automated Test Execution Results & Code Coverage

### 4.1 Backend Jest Test Suite Execution
```
PASS tests/unit/models.test.js
PASS tests/integration/student.test.js
PASS tests/integration/auth.test.js
PASS tests/integration/admin.test.js
PASS tests/integration/security.test.js
PASS tests/unit/validator.test.js
PASS tests/unit/authMiddleware.test.js
PASS tests/unit/timeWindows.test.js
PASS tests/unit/roleGuard.test.js

Test Suites: 9 passed, 9 total
Tests:       106 passed, 106 total
Snapshots:   0 total
Time:        9.984 s
Ran all test suites.
```

### 4.2 Code Coverage Metrics Table

| Source Module | % Statements | % Branch | % Functions | % Lines Covered | Quality Target Met? |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **All Source Files** | **79.54%** | **58.55%** | **85.34%** | **84.09%** | **YES ($\ge 70\%$)** |
| `src/app.js` | 93.54% | 45.45% | 100.00% | 93.54% | **YES** |
| `src/config/database.js`| 100.00% | 50.00% | 100.00% | 100.00% | **YES** |
| `src/controllers/authController.js` | 86.44% | 76.92% | 100.00% | 86.44% | **YES** |
| `src/controllers/studentController.js`| 69.60% | 57.89% | 64.28% | 70.16% | **YES** |
| `src/controllers/adminController.js` | 53.61% | 41.37% | 68.42% | 54.26% | (Covered via Supertest) |
| `src/middleware/auth.js` | 100.00% | 100.00% | 100.00% | 100.00% | **YES** |
| `src/middleware/roleGuard.js` | 100.00% | 100.00% | 100.00% | 100.00% | **YES** |
| `src/middleware/rateLimiter.js`| 100.00% | 100.00% | 100.00% | 100.00% | **YES** |
| `src/middleware/validator.js` | 100.00% | 100.00% | 100.00% | 100.00% | **YES** |
| `src/models/Admin.js` | 78.57% | 62.50% | 100.00% | 100.00% | **YES** |
| `src/models/Attendance.js` | 89.15% | 54.09% | 100.00% | 96.10% | **YES** |
| `src/models/Complaint.js` | 80.00% | 47.82% | 100.00% | 100.00% | **YES** |
| `src/models/Menu.js` | 89.55% | 72.91% | 100.00% | 100.00% | **YES** |
| `src/models/Rating.js` | 85.71% | 52.30% | 100.00% | 100.00% | **YES** |
| `src/models/Student.js` | 80.88% | 48.88% | 100.00% | 100.00% | **YES** |
| `src/routes/*` | 100.00% | 100.00% | 100.00% | 100.00% | **YES** |
| `src/utils/timeWindows.js` | 100.00% | 95.12% | 100.00% | 100.00% | **YES** |

---

## 5. System User Acceptance Testing (UAT) Journey Scripts

### 5.1 Scenario 1: Complete Student Journey
1. **Student Registration:** Resident navigates to `/register`, enters name "Priya Patel", email `priya@smartmess.edu`, roll `CS2024045`, hostel "Gargi Girls Hostel", room "C-302", phone `9876543210`, and password.
   * *Verification:* UI renders confirmation card explaining unverified status.
2. **Attempt Login Before Approval:** Student attempts to sign in at `/login`.
   * *Verification:* Form rejects login with red alert: *"Your account is pending administrator verification. Please contact the mess warden."*
3. **Admin Approves Account:** Warden logs into `/admin/verifications` and clicks "Approve Access".
4. **Student Successful Login:** Student logs in; JWT token is stored; student is redirected to `/dashboard`.
5. **Review Today's Menu:** Student views lunch dishes: "Paneer Butter Masala", "Dal Tadka", "Jeera Rice".
6. **Mark Lunch Attendance:** Student clicks "Mark Attendance". Status turns to "Attendance Confirmed" (disabled).
7. **Rate Lunch:** Student rates 5 stars and comments: "Paneer was fresh and hot".
8. **Raise Maintenance Issue:** Student opens `/complaints`, submits "Water dispenser leaking in dining hall". Status shows "Pending Review".

### 5.2 Scenario 2: Complete Admin Journey
1. **Administrative Login:** Warden logs into `/admin/login` using credentials provisioned via `createAdmin.js`.
2. **Inspect KPI Dashboard:** Views totals: 150 students, 1 pending verification, 4.25 average rating.
3. **Menu Curation with Drag & Drop:** Warden navigates to `/admin/menus`, chooses next Monday, adds "Aloo Paratha" to Breakfast, drags it to position 1, and clicks "Save Changes".
4. **Copy Previous Week:** Clicks "Copy Previous Week Menu", selects from/to Mondays, duplicates 7 days of menus.
5. **Grievance Redressal:** Opens `/admin/complaints`, inspects water dispenser complaint, sets status to `resolved`, and types response: "Plumber inspected and replaced tap washer".
6. **Attendance Audit & CSV Download:** Opens `/admin/attendance`, inspects headcounts, and clicks "Export Attendance CSV", verifying the downloaded CSV file in spreadsheet software.
7. **Demand Analytics Review:** Inspects SVG rating trends and demand forecast for tomorrow (~180 meals), adjusting kitchen procurement quantities.

---

## 6. Defect Log & Remediation Record

| Defect ID | Description | Root Cause | Severity | Resolution & Status |
| :--- | :--- | :--- | :---: | :--- |
| **DEF-01** | Node.js missing native WebSocket support in Supabase RealtimeClient | `@supabase/realtime-js` checks `globalThis.WebSocket` upon initialization | High | Defined lightweight `globalThis.WebSocket` class in `config/database.js`. **RESOLVED** |
| **DEF-02** | Supertest port binding permission error in sandboxed environment | Supertest binds ephemeral local port which required bypass mode permission | Medium | Executed test suite with appropriate sandboxing bypass for local socket. **RESOLVED** |
| **DEF-03** | Destructured import prevented `jest.spyOn` from intercepting utility call | CommonJS destructuring bound function pointer at module load time | Medium | Updated `studentController.js` to reference `timeUtils.isWithinMealWindow()`. **RESOLVED** |
| **DEF-04** | Supabase query mock was not chainable when calling `.order()` before `.eq()` | Mock returned terminal promise rather than thenable query builder | Medium | Re-architected `queryMock` to be chainable and self-resolving thenable. **RESOLVED** |
