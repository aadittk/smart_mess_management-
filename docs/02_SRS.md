# Software Requirements Specification (SRS)
## SmartMess – Smart Hostel Mess Management System
**Document Standard:** IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018 Compliant  
**Version:** 1.0.0  
**Status:** Approved  
**Author:** Software Engineering Team  

---

## 1. Introduction

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) document is to define the complete functional and non-functional requirements for the **SmartMess** platform. This document serves as the foundational contract between the university mess administration, student residents, software engineering team, and evaluators, guiding all design, implementation, and verification activities.

### 1.2 Scope of the Product
SmartMess is an integrated, mobile-first web system engineered to digitize hostel dining hall operations. The system automates:
* Student onboarding and administrative verification.
* Menu publishing and weekly scheduling.
* Multi-criterion meal feedback and rating collection.
* Digital attendance check-in governed by meal-specific time windows.
* Student grievance lodging and status tracking.
* Mess manager oversight, attendance reporting, CSV data export, and predictive attendance forecasting for food waste reduction.

### 1.3 Definitions, Acronyms, and Abbreviations
* **ACID:** Atomicity, Consistency, Isolation, Durability.
* **ADR:** Architecture Decision Record.
* **BVA:** Boundary Value Analysis.
* **CORS:** Cross-Origin Resource Sharing.
* **EP:** Equivalence Partitioning.
* **FK:** Foreign Key.
* **HMR:** Hot Module Replacement.
* **JWT:** JSON Web Token (RFC 7519).
* **MoSCoW:** Must have, Should have, Could have, Won't have.
* **NFR:** Non-Functional Requirement.
* **PK:** Primary Key.
* **RTM:** Requirements Traceability Matrix.
* **SPA:** Single Page Application.
* **SRS:** Software Requirements Specification.
* **UUID:** Universally Unique Identifier (RFC 4122).

---

## 2. Overall Description

### 2.1 Product Perspective & Context
SmartMess is a self-contained, cloud-hosted client-server web application. The frontend Single Page Application (SPA) runs within modern mobile and desktop web browsers, communicating over HTTPS via RESTful JSON APIs with an Express.js backend hosted on Render, which in turn queries a managed PostgreSQL database on Supabase.

```
+-------------------------------------------------------------+
|                 Student & Admin Web Browsers                |
|                    (Mobile-First React SPA)                 |
+------------------------------+------------------------------+
                               | HTTPS / JSON (REST API)
+------------------------------v------------------------------+
|                   Node.js / Express API Server              |
|          (JWT Auth, Rate Limiter, Validation, Models)        |
+------------------------------+------------------------------+
                               | PostgreSQL Protocol (SSL)
+------------------------------v------------------------------+
|                Supabase PostgreSQL 15 Database              |
|        (Relational Tables, Constraints, Indexes, Triggers)  |
+-------------------------------------------------------------+
```

### 2.2 User Classes and Characteristics
1. **Student Resident (End-User):**
   * *Profile:* Enrolled university student residing in on-campus hostels.
   * *Technical Literacy:* High proficiency with mobile interfaces.
   * *Access:* Access restricted to authenticated and admin-verified student accounts.
   * *Tasks:* View daily/weekly menus, mark attendance during meal windows, submit 1–5 star ratings with comments, raise complaints, manage profile.
2. **Mess Administrator / Warden (Administrative User):**
   * *Profile:* Mess manager, catering contractor supervisor, or institutional warden.
   * *Technical Literacy:* Moderate proficiency with desktop web dashboards.
   * *Access:* Created solely via a dedicated, secure server CLI script (`createAdmin.js`).
   * *Tasks:* Verify/block students, curate and reorder daily menus, export attendance reports to CSV, resolve complaints, analyze ratings and attendance trends, review next-day attendance forecast.

### 2.3 Operating Environment
* **Client Environment:** Any web browser supporting ECMAScript 2022+ (Google Chrome 110+, Apple Safari 16+, Mozilla Firefox 115+, Microsoft Edge 110+) on iOS, Android, macOS, Linux, and Windows.
* **Server Environment:** Node.js runtime (v18.x or v20.x LTS) on Linux x86_64.
* **Database Environment:** Supabase Cloud PostgreSQL 15 with SSL connection enforcement.

### 2.4 Design and Implementation Constraints
1. **No External Charting or UI Libraries:** All visualizations must be rendered using semantic, responsive SVG and pure CSS Modules. Drag-and-drop menu reordering must utilize the native HTML5 Drag and Drop API.
2. **Security Constraint:** Passwords must be hashed using `bcrypt` with a minimum salt work factor of 10. Direct SQL string concatenation is forbidden; all queries must be parameterized via the Supabase client.
3. **Stateless Backend:** Server sessions are prohibited; all authentication must be verified statelessly using signed JWT bearer tokens.
4. **Attendance Window Constraint:** Attendance cannot be marked for past or future dates, and can only be marked once per meal within that meal's designated operating window.

---

## 3. Specific Functional Requirements

Requirements are classified according to the MoSCoW prioritization model: **[M]** Must Have, **[S]** Should Have, **[C]** Could Have, **[W]** Won't Have.

### 3.1 Student Subsystem (FR-STU)

| Req ID | Requirement Statement | MoSCoW | Description & Business Rules |
| :--- | :--- | :---: | :--- |
| **FR-STU-01** | Student Account Registration | **M** | The system shall permit students to register with `name`, university `email`, `password`, `roll_number`, `hostel_name`, `room_number`, and `phone_number`. The account is created with `is_verified = false`. |
| **FR-STU-02** | Student Authentication & Access Control | **M** | The system shall authenticate student credentials using email and password. Login must be denied if the student is unverified (`403 Forbidden`) or blocked (`403 Forbidden`). Successful login returns a signed JWT. |
| **FR-STU-03** | Today's Menu Display | **M** | The system shall display the four meal courses (Breakfast, Lunch, Snacks, Dinner) for the current calendar date, dynamically highlighting the ongoing or upcoming meal. |
| **FR-STU-04** | 7-Day Weekly Menu Calendar | **M** | The system shall allow students to browse menus for any day of the current 7-day week (Monday through Sunday) in an interactive calendar view. |
| **FR-STU-05** | Meal Rating Submission | **M** | The system shall allow verified students to submit an integer rating (1–5 stars) and an optional text comment for any meal of the day. Exactly one rating per meal per student per day is allowed. |
| **FR-STU-06** | Student Rating History & Modification | **M** | The system shall provide a "My Ratings" page where students can view their past ratings, update their rating/comment, or delete their rating. |
| **FR-STU-07** | Digital Meal Attendance Check-In | **M** | The system shall permit students to record attendance for a specific meal with a single click, restricted strictly to the current date and within the configurable time window for that meal type. |
| **FR-STU-08** | Attendance History Log | **S** | The system shall provide students with a personal attendance log showing their attendance status across all meals for the past 30 days. |
| **FR-STU-09** | Grievance / Complaint Submission | **M** | The system shall permit students to submit complaints containing a title and detailed description regarding mess food quality, hygiene, or infrastructure. |
| **FR-STU-10** | Complaint Status Tracking | **M** | The system shall display the real-time status of submitted complaints (`pending`, `in_progress`, `resolved`, `rejected`) and any administrative remarks provided by the mess warden. |
| **FR-STU-11** | Student Profile & Password Update | **S** | The system shall enable students to edit their contact details (room number, phone number) and update their password by confirming their old password. |

### 3.2 Administrator Subsystem (FR-ADM)

| Req ID | Requirement Statement | MoSCoW | Description & Business Rules |
| :--- | :--- | :---: | :--- |
| **FR-ADM-01** | Admin Authentication & Dashboard | **M** | The system shall authenticate administrators via `/api/auth/admin/login` and render a KPI dashboard showing total students, pending approvals, 30-day average meal rating, and open complaints. |
| **FR-ADM-02** | Menu Creation, Editing & Deletion | **M** | The system shall permit admins to create, update, and delete daily menus specifying dishes as array items for Breakfast, Lunch, Snacks, and Dinner. |
| **FR-ADM-03** | Menu Drag-and-Drop Dish Reordering | **M** | The system shall allow admins to reorder dishes within any meal slot using the native HTML5 Drag and Drop API, persisting the reordered array on save. |
| **FR-ADM-04** | Copy Previous Week Menu | **S** | The system shall allow admins to duplicate all 7 days of menus from the previous calendar week into the current week to accelerate schedule planning. |
| **FR-ADM-05** | Student Registration Verification | **M** | The system shall allow admins to inspect pending student registrations and either approve (`is_verified = true`) or reject (delete account) with an optional reason. |
| **FR-ADM-06** | Student Directory Management | **M** | The system shall provide a searchable, filterable directory of all students, enabling admins to block/unblock accounts and permanently remove students. |
| **FR-ADM-07** | Meal Ratings & Sentiment Explorer | **M** | The system shall allow admins to filter, sort, and inspect student ratings by meal type, date range, and star value, displaying individual qualitative comments. |
| **FR-ADM-08** | Complaint Resolution Workflow | **M** | The system shall allow admins to review complaints, transition their status (`pending` → `in_progress` → `resolved`/`rejected`), and attach a detailed response message. |
| **FR-ADM-09** | Attendance Reporting & CSV Export | **M** | The system shall aggregate attendance numbers across dates and meal slots and provide a one-click CSV download containing raw attendance records. |
| **FR-ADM-10** | Visual Analytics & Demand Forecast | **M** | The system shall render pure SVG charts depicting: (1) Average rating per meal type, (2) Daily rating trends, (3) Top 5 and Bottom 5 dishes, (4) Daily attendance trends, and (5) A 7-day moving-average attendance forecast for the next day. |

### 3.3 Cross-Cutting System Requirements (FR-SYS)

| Req ID | Requirement Statement | MoSCoW | Description & Business Rules |
| :--- | :--- | :---: | :--- |
| **FR-SYS-01** | Standard API Response Envelope | **M** | All API responses shall adhere to `{ "success": boolean, "message": string, "data": any }`. |
| **FR-SYS-02** | Rate Limiting on Authentication | **M** | Authentication routes (`/api/auth/*`) shall enforce rate limits (maximum 10 requests per 15-minute window per IP) to mitigate brute-force attacks. |
| **FR-SYS-03** | Centralized Exception Handling | **M** | Any unhandled server exception shall be captured by an Express error middleware and return standard HTTP 500 without leaking stack traces in production. |
| **FR-SYS-04** | Health Check Endpoint | **M** | The API shall expose `GET /api/health` returning system timestamp, uptime, and database connectivity status. |

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Security Requirements (NFR-SEC)
* **NFR-SEC-01 (Password Encryption):** All passwords must be salted and hashed using `bcrypt` with a minimum cost factor of 10. Passwords must never be logged or stored in plain text.
* **NFR-SEC-02 (Stateless JWT Security):** Authentication tokens must be digitally signed with HMAC-SHA256 using a secure server secret (`JWT_SECRET`) with an expiration period of 24 hours.
* **NFR-SEC-03 (Role-Based Authorization):** All administrative endpoints under `/api/admin/*` must enforce an `adminGuard` middleware verifying the `role === 'admin'` claim in the JWT.
* **NFR-SEC-04 (SQL Injection Prevention):** Direct SQL concatenation is strictly prohibited. All queries must be executed through the parameterized Supabase client API.
* **NFR-SEC-05 (HTTP Header Protection):** The API must utilize `helmet` middleware to set secure HTTP headers (XSS Protection, Content Security Policy, Frameguard, HSTS).
* **NFR-SEC-06 (CORS Confinement):** CORS headers must whitelist only the configured frontend domain (`CLIENT_URL`).

### 4.2 Performance Requirements (NFR-PERF)
* **NFR-PERF-01 (API Response Latency):** 95% of API requests under normal load (< 100 concurrent requests) shall complete within 500 ms (excluding cold-start wakeups).
* **NFR-PERF-02 (Database Indexing):** Foreign keys and frequently queried columns (`student_id`, `date`, `status`, `meal_type`) must have B-tree indexes ensuring query execution time under 50 ms.
* **NFR-PERF-03 (Frontend Bundle Size):** Production frontend bundle size must remain under 300 KB gzipped by omitting heavy charting and UI framework libraries.

### 4.3 Reliability & Availability (NFR-REL)
* **NFR-REL-01 (Render Cold-Start Resilience):** The frontend Axios service must intercept network timeouts and render an informative "Server is initializing, please wait..." toast notification.
* **NFR-REL-02 (ACID Database Integrity):** All relational mutations (ratings, complaints, attendance) must adhere to ACID guarantees with foreign key integrity.

### 4.4 Usability & Accessibility (NFR-USA)
* **NFR-USA-01 (Mobile-First Responsiveness):** The user interface must be fully functional across viewport widths from 320 px (iPhone SE) to 2560 px (Ultrawide desktop).
* **NFR-USA-02 (Semantic States):** Every data-driven view must render explicit **Loading** (animated spinner), **Empty** (friendly illustration and message), and **Error** states.
* **NFR-USA-03 (WCAG Contrast):** Text-to-background contrast ratio must satisfy WCAG 2.1 AA standards (minimum 4.5:1 for normal text).

### 4.5 Maintainability & Portability (NFR-MAINT / PORT)
* **NFR-MAINT-01 (Layered Architecture):** Backend code must follow strict separation of concerns: `Routes` → `Middleware` → `Controllers` → `Models` / `Database`.
* **NFR-MAINT-02 (Test Coverage):** Backend codebase must maintain >= 70% branch and line test coverage measured via Jest.
* **NFR-PORT-01 (Environment Independence):** The application must configure all ports, database credentials, JWT secrets, and time windows strictly via `.env` files.

---

## 5. External Interface Requirements

### 5.1 User Interfaces (UI)
* Mobile-first navigation with responsive Top Navbar and collapsible Mobile Drawer / Sidebar.
* Floating Toast Notification component for real-time operation feedback.
* Accessible Modal Dialogs for rating edits, dish reordering, and grievance details.

### 5.2 Software Interfaces
* **Supabase Client:** `@supabase/supabase-js` v2.x for PostgreSQL communications over secure HTTPS.
* **Node.js Crypto / Bcrypt:** For cryptographic hashing and comparison.
* **JSON Web Token Library:** `jsonwebtoken` v9.x for token signing and verification.

### 5.3 Communication Interfaces
* All client-to-server traffic must use HTTPS with TLS 1.3 encryption.
* Data exchange format must be valid UTF-8 JSON.

---

## 6. Detailed Use-Case Specifications

### 6.1 Use Case UC-01: Student Mark Attendance
* **Primary Actor:** Verified Student
* **Preconditions:** Student is logged in; account is verified and not blocked; current time falls within configured meal window.
* **Main Success Scenario:**
  1. Student navigates to the "Attendance" page.
  2. System detects the current date and time and identifies the active meal window (e.g., Breakfast 07:00–10:00).
  3. Student clicks "Mark Breakfast Attendance".
  4. Client dispatches `POST /api/student/attendance` with `{ meal_type: "breakfast" }`.
  5. Backend verifies current server time against `MEAL_WINDOWS.breakfast`.
  6. Backend verifies attendance has not already been marked for today.
  7. Backend records attendance in the `attendance` table.
  8. System returns `{ success: true, message: "Breakfast attendance marked successfully" }`.
  9. UI updates the meal status button to "Marked" (disabled).
* **Extensions (Alternative Flows):**
  * *4a. Outside meal time window:* Backend responds with HTTP 400 (`"Attendance can only be marked during the Breakfast window (07:00 - 10:00)"`). Frontend displays error toast.
  * *4b. Attendance already recorded:* Backend responds with HTTP 400 (`"Breakfast attendance already marked for today"`). Frontend shows alert and disables button.

### 6.2 Use Case UC-02: Admin Menu Management with Drag-and-Drop
* **Primary Actor:** Mess Administrator
* **Preconditions:** Admin is authenticated with valid JWT.
* **Main Success Scenario:**
  1. Admin opens the "Menu Management" view and selects a target date.
  2. System loads the existing menu or an empty template.
  3. Admin types a new dish name and clicks "Add Dish" to the Lunch course.
  4. Admin reorders dishes using native HTML5 drag-and-drop handles.
  5. Admin clicks "Save Menu".
  6. Client dispatches `POST /api/admin/menus` or `PUT /api/admin/menus/:id`.
  7. Backend validates array data and upserts the menu record.
  8. System displays confirmation toast: "Menu saved successfully".
* **Extensions (Alternative Flows):**
  * *2a. Copy Previous Week:* Admin clicks "Copy Previous Week Menu". System fetches menu from 7 days prior and populates all 4 meal arrays.

---

## 7. User Stories & Acceptance Criteria

### US-01: Student Registration & Verification
> **As an** unregistered hostel resident,  
> **I want to** submit my registration with my university roll number, hostel, and room,  
> **So that** the mess manager can verify my residency and grant me mess access.

* **Acceptance Criteria:**
  * **Given** an unregistered student with email `student@hostel.edu` and roll number `2024CS01`,
  * **When** they submit the registration form with valid parameters,
  * **Then** the system creates a student record with `is_verified = false` and returns HTTP 201 with a message informing them their account is pending approval.
  * **Given** an unverified student attempts to log in,
  * **When** their credentials are submitted,
  * **Then** the server responds with HTTP 403: `"Account pending administrative verification"`.

### US-02: Meal Rating Submission
> **As a** verified student,  
> **I want to** rate today's lunch with 1–5 stars and leave a comment,  
> **So that** mess administration is aware of meal quality.

* **Acceptance Criteria:**
  * **Given** a verified student viewing today's menu,
  * **When** they select 4 stars and enter `"Great paneer butter masala"` for Lunch,
  * **Then** the server saves the rating and returns HTTP 201.
  * **Given** the student attempts to submit a second rating for the same Lunch,
  * **When** the request is received,
  * **Then** the system rejects the request with HTTP 409 Conflict.

---

## 8. Requirements Traceability Matrix (RTM)

The matrix below maps each Functional Requirement to its corresponding architectural design element, backend code module, frontend view component, and test case IDs.

| Req ID | Requirement Summary | Design Element | Code Module (Backend / Frontend) | Test Case ID(s) |
| :--- | :--- | :--- | :--- | :--- |
| **FR-STU-01** | Student Registration | Auth Subsystem | `authController.js` / `Register.jsx` | TC-AUTH-01, TC-AUTH-02 |
| **FR-STU-02** | Student Login & JWT | Auth & Route Guard | `authController.js`, `auth.js` / `Login.jsx` | TC-AUTH-03, TC-AUTH-04 |
| **FR-STU-03** | Today's Menu View | Menu Service | `studentController.js` / `TodayMenu.jsx` | TC-MENU-01, TC-MENU-02 |
| **FR-STU-04** | Weekly Menu View | Menu Service | `studentController.js` / `WeeklyMenu.jsx` | TC-MENU-03 |
| **FR-STU-05** | Meal Rating Submission | Rating Service | `studentController.js` / `TodayMenu.jsx` | TC-RATE-01, TC-RATE-02 |
| **FR-STU-06** | My Ratings CRUD | Rating Service | `studentController.js` / `MyRatings.jsx` | TC-RATE-03, TC-RATE-04 |
| **FR-STU-07** | Mark Attendance Window| Attendance Engine | `studentController.js` / `Attendance.jsx` | TC-ATT-01, TC-ATT-02, TC-ATT-03 |
| **FR-STU-08** | Attendance History Log | Attendance Engine | `studentController.js` / `Attendance.jsx` | TC-ATT-04 |
| **FR-STU-09** | Submit Complaint | Grievance Subsystem | `studentController.js` / `Complaints.jsx` | TC-COMP-01 |
| **FR-STU-10** | Track Complaint Status | Grievance Subsystem | `studentController.js` / `Complaints.jsx` | TC-COMP-02 |
| **FR-STU-11** | Profile & Password | User Profile | `studentController.js` / `Profile.jsx` | TC-PROF-01, TC-PROF-02 |
| **FR-ADM-01** | Admin Login & Dashboard| Admin Auth & KPI | `adminController.js` / `AdminDashboard.jsx`| TC-ADM-01, TC-ADM-02 |
| **FR-ADM-02** | Menu CRUD Operations | Menu Management | `adminController.js` / `MenuManagement.jsx`| TC-ADMMENU-01 |
| **FR-ADM-03** | Menu Drag & Drop | Menu Management | `MenuManagement.jsx` | TC-ADMMENU-02 |
| **FR-ADM-04** | Copy Previous Week Menu| Menu Management | `adminController.js` / `MenuManagement.jsx`| TC-ADMMENU-03 |
| **FR-ADM-05** | Student Verification | Verification Engine | `adminController.js` / `StudentVerification.jsx` | TC-VERIF-01, TC-VERIF-02 |
| **FR-ADM-06** | Student Directory Mgmt | User Management | `adminController.js` / `ManageStudents.jsx`| TC-STUMGMT-01, TC-STUMGMT-02 |
| **FR-ADM-07** | Ratings Sentiment View | Rating Explorer | `adminController.js` / `ViewRatings.jsx` | TC-ADMRATE-01 |
| **FR-ADM-08** | Complaint Redressal | Grievance Subsystem | `adminController.js` / `ComplaintManagement.jsx` | TC-ADMCOMP-01 |
| **FR-ADM-09** | Attendance Report & CSV| Reporting Subsystem | `adminController.js` / `AttendanceReports.jsx` | TC-ADMATT-01, TC-ADMATT-02 |
| **FR-ADM-10** | SVG Analytics & Forecast| Analytics Engine | `adminController.js` / `Analytics.jsx` | TC-ANALYTICS-01, TC-ANALYTICS-02 |
| **FR-SYS-01** | Standard Response Env | Common Utilities | `server.js`, `errorHandler.js` | TC-SYS-01 |
| **FR-SYS-02** | Auth Rate Limiting | Security Middleware | `rateLimiter.js` | TC-SYS-02 |
| **FR-SYS-03** | Centralized Errors | Error Middleware | `errorHandler.js` | TC-SYS-03 |
| **FR-SYS-04** | Health Check API | Diagnostic Service | `server.js` | TC-SYS-04 |
