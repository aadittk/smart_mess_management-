# SmartMess – Implementation Notes & Engineering Standards
**Document ID:** SM-SDLC-05  
**Version:** 1.0.0  
**Status:** Approved  
**Project:** SmartMess – Smart Hostel Mess Management System  

---

## 1. Coding Standards & Software Engineering Practices

### 1.1 Architectural Layering & Separation of Concerns
The backend adheres to a strict three-layer architectural separation:
1. **HTTP / Routing Layer (`src/routes/*`):** Dispatches requests, enforces route guards, and mounts validation middleware. Contains no business or database logic.
2. **Controller Layer (`src/controllers/*`):** Orchestrates business rules, extracts sanitized parameters, coordinates model calls, and formats canonical JSON responses (`{ success, message, data }`).
3. **Data Access Model Layer (`src/models/*`):** Encapsulates all interactions with the database. Queries are fully parameterized through the `@supabase/supabase-js` client; direct SQL string concatenation is forbidden.

### 1.2 SOLID Principles Application
* **Single Responsibility Principle (SRP):** Each middleware module handles exactly one concern: `auth.js` verifies JWT signatures, `roleGuard.js` validates role privileges, `rateLimiter.js` guards against brute-force attacks, and `validator.js` enforces request payload schemas.
* **Open/Closed Principle (OCP):** Meal attendance time windows are driven by external environment configuration (`BREAKFAST_START`, `BREAKFAST_END`, etc.) via `utils/timeWindows.js`, allowing operational schedule shifts without modifying business logic code.
* **Liskov Substitution Principle (LSP):** Database models expose standard async domain methods (`create`, `findById`, `delete`), permitting seamless substitution with in-memory test mocks during Jest unit and integration tests.
* **Interface Segregation Principle (ISP):** Client-side API services are segregated by domain: `authApi`, `studentApi`, and `adminApi`, preventing unnecessary coupling across user roles.
* **Dependency Inversion Principle (DIP):** Controllers depend on Model abstractions rather than direct database driver sockets or raw network clients.

### 1.3 DRY (Don't Repeat Yourself) & Centralized Handling
* **Standard Response Envelope:** All successful and erroneous endpoints return consistent JSON objects:
  ```json
  {
    "success": true,
    "message": "Descriptive message",
    "data": null
  }
  ```
* **Centralized Error Handling:** All asynchronous controller errors pass to `next(err)`, caught by `errorHandler.js`. Internal server stack traces are obfuscated in production environments.
* **Axios Interceptor Token Injection:** The client-side Axios instance automatically reads `localStorage.getItem('smartmess_token')` and appends `Authorization: Bearer <token>` to outbound requests, eliminating manual header duplication.

---

## 2. Module-to-Requirement Traceability

The table below maps each specified Functional Requirement (FR) directly to its code implementation artifacts:

| Requirement ID | Module / File | Primary Functions & Components |
| :--- | :--- | :--- |
| **FR-STU-01** (Registration) | `controllers/authController.js`<br>`pages/Register.jsx` | `authController.register`<br>`Register` form with pending approval notice |
| **FR-STU-02** (Student Login) | `controllers/authController.js`<br>`pages/Login.jsx` | `authController.login`<br>`Login` component with unverified/blocked checks |
| **FR-STU-03** (Today's Menu) | `controllers/studentController.js`<br>`pages/TodayMenu.jsx` | `getTodayMenu`<br>`TodayMenu` view with active meal badge & dishes |
| **FR-STU-04** (Weekly Menu) | `controllers/studentController.js`<br>`pages/WeeklyMenu.jsx` | `getWeeklyMenu`<br>`WeeklyMenu` 7-day calendar view |
| **FR-STU-05** (Meal Rating) | `controllers/studentController.js`<br>`pages/TodayMenu.jsx` | `createRating`<br>Interactive `StarRating` modal dialog |
| **FR-STU-06** (My Ratings) | `controllers/studentController.js`<br>`pages/MyRatings.jsx` | `getRatings`, `updateRating`, `deleteRating`<br>`MyRatings` list and edit modal |
| **FR-STU-07** (Mark Attendance)| `controllers/studentController.js`<br>`pages/Attendance.jsx` | `markAttendance`, `isWithinMealWindow`<br>`Attendance` one-click meal check-in |
| **FR-STU-08** (Attendance History)| `controllers/studentController.js`<br>`pages/Attendance.jsx` | `getAttendance`<br>Monthly attendance table with meal checkmarks |
| **FR-STU-09** (Submit Complaint)| `controllers/studentController.js`<br>`pages/Complaints.jsx` | `createComplaint`<br>`Complaints` submission modal form |
| **FR-STU-10** (Track Complaint)| `controllers/studentController.js`<br>`pages/Complaints.jsx` | `getComplaints`<br>Complaint cards with status pill and admin response |
| **FR-STU-11** (Profile/Password)| `controllers/studentController.js`<br>`pages/Profile.jsx` | `getProfile`, `updateProfile`, `changePassword`<br>`Profile` contact info & security forms |
| **FR-ADM-01** (Admin Dashboard)| `controllers/adminController.js`<br>`pages/admin/AdminDashboard.jsx` | `getDashboard`<br>KPI tiles (students, ratings, complaints) |
| **FR-ADM-02** (Menu CRUD) | `controllers/adminController.js`<br>`pages/admin/MenuManagement.jsx` | `getMenus`, `createMenu`, `updateMenu`, `deleteMenu`<br>Menu editor with date picker |
| **FR-ADM-03** (Drag & Drop DnD)| `pages/admin/MenuManagement.jsx` | Native HTML5 `draggable="true"`, `onDragStart`, `onDrop` |
| **FR-ADM-04** (Copy Week) | `controllers/adminController.js`<br>`pages/admin/MenuManagement.jsx` | `copyWeek`<br>`copyWeek` modal duplicating 7 daily menus |
| **FR-ADM-05** (Verification) | `controllers/adminController.js`<br>`pages/admin/StudentVerification.jsx` | `getStudents`, `verifyStudent`, `rejectStudent`<br>Pending registrations approval queue |
| **FR-ADM-06** (Manage Students)| `controllers/adminController.js`<br>`pages/admin/ManageStudents.jsx` | `getStudents`, `blockStudent`, `unblockStudent`, `deleteStudent`<br>Filterable directory |
| **FR-ADM-07** (View Ratings) | `controllers/adminController.js`<br>`pages/admin/ViewRatings.jsx` | `getRatings`<br>Multi-criteria filterable ratings sentiment view |
| **FR-ADM-08** (Resolve Complaint)| `controllers/adminController.js`<br>`pages/admin/ComplaintManagement.jsx` | `getComplaints`, `respondComplaint`<br>Grievance resolution modal |
| **FR-ADM-09** (Attendance CSV)| `controllers/adminController.js`<br>`pages/admin/AttendanceReports.jsx` | `getAttendanceReport`, `exportAttendanceCSV`<br>Meal-wise summary & CSV blob stream |
| **FR-ADM-10** (SVG Analytics) | `controllers/adminController.js`<br>`pages/admin/Analytics.jsx` | `getAnalytics`, `getMovingAverageForecast`<br>Pure SVG Bar & Line charts, Top/Bottom dishes |

---

## 3. Git Branching Strategy & Conventional Commits

### 3.1 Branching Model (GitFlow-Lite)
```
  main (Production Releases)
    ^
    | (PR merge after QA & Tests)
  develop (Integration Branch)
    ^
    |-- feature/auth-jwt-middleware
    |-- feature/student-menu-rating
    |-- feature/student-attendance-window
    |-- feature/admin-menu-dnd
    |-- feature/admin-verification-directory
    |-- feature/svg-analytics-forecast
    |-- test/backend-supertest-suite
```

### 3.2 Suggested Conventional Commit Log (Module-by-Module)

```bash
# Inception & Setup
chore(init): initialize monorepo structure with backend and frontend workspaces
docs(plan): add project plan, gantt schedule, and feasibility analysis
docs(srs): add IEEE 830 compliant software requirements specification
docs(uml): add system models, UML diagrams, ER schema, and DFD level 0/1
docs(arch): add architecture design document and ADRs

# Persistence & Data Modeling
feat(db): add PostgreSQL schema DDL with composite keys, indexes, and triggers
feat(models): implement Student, Admin, Menu, Rating, Attendance, and Complaint models

# Backend Middleware & Security
feat(auth): implement JWT token verification, roleGuard, and bcrypt hashing
feat(security): configure helmet headers, express rate limiting, and CORS whitelist
feat(validation): add express-validator schemas for auth, menus, ratings, and attendance
feat(errors): implement centralized error handling middleware

# Backend API Controllers & Routes
feat(api-auth): add student registration, student login, and admin login endpoints
feat(api-student): implement today/weekly menus, ratings CRUD, and attendance check-in
feat(api-admin): implement menu management, student verification, and CSV export
feat(analytics): add moving-average attendance forecasting and top/bottom dish rankings
feat(scripts): add createAdmin.js provisioning CLI script

# Frontend UI & State Architecture
feat(client-core): setup Vite React SPA with global CSS variables and routing
feat(context): implement AuthContext with persistent session and reactive state
feat(ui): create Button, Card, Modal, StarRating, Loader, and EmptyState components
feat(student-views): implement Dashboard, TodayMenu, WeeklyMenu, and Attendance pages
feat(ratings-complaints): implement MyRatings and Grievances lodging portal
feat(admin-views): build AdminDashboard, StudentVerification, and ManageStudents views
feat(menu-dnd): implement native HTML5 drag-and-drop dish reordering
feat(charts): build responsive SVG Bar and Line charts with attendance projection

# Quality Assurance & Testing
test(backend): add Jest unit tests for models, time windows, and validation rules
test(integration): add Supertest API integration tests covering auth and business logic
test(frontend): add Vitest and React Testing Library tests for key components
ci(qa): audit OWASP top 10 mapping and finalize deployment runbooks
```

---

## 4. Technical Assumptions & Architectural Decisions

1. **Supabase Client Decoupling & Test Isolation:**  
   The application uses environment variables (`SUPABASE_URL`, `SUPABASE_KEY`) to connect to Supabase PostgreSQL. In testing environments (`NODE_ENV === 'test'`), database operations are fully decoupled or mocked, ensuring test suites execute deterministically without external network flakiness.

2. **Meal Time Window Enforcement:**  
   To prevent attendance falsification, meal operating windows are enforced strictly on the server using 24-hour time strings (`07:00` to `10:00`, `12:00` to `14:30`, `16:30` to `18:30`, `19:30` to `22:00`). Client machine clocks are ignored.

3. **Rating Uniqueness Rule:**  
   A student can submit exactly one rating per meal course per calendar day. To change their evaluation, they use the `PUT /api/student/ratings/:id` endpoint or edit modal, preserving data integrity without inflating satisfaction metrics.

4. **Pure SVG/CSS Visualizations:**  
   To minimize production bundle size, eliminate external runtime weight, and showcase foundational computer science styling, all analytical charts (bar graphs, line charts, trend points) are rendered using native SVG elements without any charting libraries.

5. **Native HTML5 Drag and Drop:**  
   Dishes within daily menu meal courses can be reordered by dragging chips via HTML5 `draggable="true"`. Fallback accessible arrow buttons (`Move Up` / `Move Down`) are provided for mobile devices and screen readers.

6. **Admin Provisioning Security:**  
   There is no public signup route for administrators. Admin accounts are provisioned exclusively through the secure, local server script `node src/scripts/createAdmin.js`, protecting against privilege escalation.
