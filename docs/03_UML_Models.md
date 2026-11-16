# SmartMess – System Modelling & UML Specification
**Document ID:** SM-SDLC-03  
**Version:** 1.0.0  
**Standard:** Unified Modeling Language (UML 2.5) / Structured Analysis  
**Project:** SmartMess – Smart Hostel Mess Management System  

---

## 1. Introduction
This document details the object-oriented and structured architectural models of the **SmartMess** system. It provides static domain representations (Class Diagram, ER Diagram), behavioral models (Use Case, Sequence, Activity, and State Diagrams), and structured data transformations (Data Flow Diagrams Level 0 and Level 1). All models use Mermaid syntax with explanatory narratives.

---

## 2. Use Case Model

### 2.1 Use Case Diagram
The Use Case Diagram depicts the functional interactions between the two core system actors: **Student** (Resident) and **Admin** (Mess Manager/Warden).

```mermaid
flowchart LR
    subgraph Actors
        S(["Student"])
        A(["Admin / Warden"])
    end

    subgraph SmartMess_System ["SmartMess System Boundary"]
        UC01(["Register Account"])
        UC02(["Authenticate / Login"])
        UC03(["View Today's Menu"])
        UC04(["View Weekly Menu"])
        UC05(["Rate Meal (1-5 Stars)"])
        UC06(["Manage Personal Ratings"])
        UC07(["Mark Meal Attendance"])
        UC08(["View Attendance History"])
        UC09(["Submit Complaint"])
        UC10(["Track Complaint Status"])
        UC11(["Update Profile & Password"])

        UC12(["Admin Login"])
        UC13(["Verify / Reject Students"])
        UC14(["Manage Student Directory (Block/Delete)"])
        UC15(["Create / Update / Delete Menu"])
        UC16(["Reorder Dishes (Drag & Drop)"])
        UC17(["Copy Previous Week Menu"])
        UC18(["Filter & Inspect Ratings"])
        UC19(["Resolve & Respond to Complaints"])
        UC20(["Export Attendance CSV Report"])
        UC21(["View Analytics & Attendance Forecast"])
    end

    S --> UC01
    S --> UC02
    S --> UC03
    S --> UC04
    S --> UC05
    S --> UC06
    S --> UC07
    S --> UC08
    S --> UC09
    S --> UC10
    S --> UC11

    A --> UC12
    A --> UC13
    A --> UC14
    A --> UC15
    A --> UC16
    A --> UC17
    A --> UC18
    A --> UC19
    A --> UC20
    A --> UC21
```

*Explanation:* Students interact with operational daily functions (menus, attendance, ratings, grievances), while Admins oversee master data (menu curation, user lifecycle approvals, grievance resolution, reporting, and forecasting).

---

## 3. Class Diagram

### 3.1 Domain & Service Class Diagram
The Class Diagram illustrates the structural entities, attributes, visibility, methods, and relationships within the backend layered architecture.

```mermaid
classDiagram
    class Student {
        +UUID id
        +String name
        +String email
        +String password
        +String roll_number
        +String hostel_name
        +String room_number
        +String phone_number
        +Boolean is_verified
        +Boolean is_blocked
        +DateTime created_at
        +register()
        +login()
        +updateProfile()
        +changePassword()
    }

    class Admin {
        +UUID id
        +String name
        +String email
        +String password
        +String role
        +DateTime created_at
        +login()
        +verifyStudent()
        +blockStudent()
        +updateMenu()
        +respondComplaint()
    }

    class Menu {
        +UUID id
        +Date date
        +String day
        +String[] breakfast
        +String[] lunch
        +String[] snacks
        +String[] dinner
        +DateTime created_at
        +getToday()
        +getWeekly()
        +upsertMenu()
        +copyWeek()
    }

    class Rating {
        +UUID id
        +UUID student_id
        +UUID menu_id
        +String meal_type
        +Integer rating
        +String comment
        +DateTime created_at
        +submitRating()
        +updateRating()
        +deleteRating()
    }

    class Attendance {
        +UUID id
        +UUID student_id
        +Date date
        +Boolean breakfast
        +Boolean lunch
        +Boolean snacks
        +Boolean dinner
        +DateTime created_at
        +markAttendance()
        +getHistory()
        +generateReport()
    }

    class Complaint {
        +UUID id
        +UUID student_id
        +String title
        +String description
        +String status
        +String admin_response
        +DateTime created_at
        +DateTime updated_at
        +create()
        +updateStatus()
        +listByStudent()
    }

    Student "1" --> "0..*" Rating : submits
    Student "1" --> "0..*" Attendance : records
    Student "1" --> "0..*" Complaint : lodges
    Menu "1" --> "0..*" Rating : evaluated_by
    Admin "1" --> "0..*" Complaint : resolves
    Admin "1" --> "0..*" Menu : manages
```

*Explanation:* The diagram shows strong associations where a `Student` can author multiple `Rating`, `Attendance`, and `Complaint` entities. A `Menu` is linked to multiple meal-specific `Rating` items. `Admin` orchestrates `Menu` updates and responds to `Complaint` items.

---

## 4. Sequence Diagrams

### 4.1 Sequence Diagram 1: Student Authentication & JWT Issuance

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Browser as React SPA (Client)
    participant AuthCtrl as authController
    participant Model as StudentModel
    participant DB as Supabase PostgreSQL
    participant JWT as jsonwebtoken

    Student->>Browser: Enters email and password, clicks Login
    Browser->>AuthCtrl: POST /api/auth/login { email, password }
    AuthCtrl->>Model: findByEmail(email)
    Model->>DB: SELECT * FROM students WHERE email = $1
    DB-->>Model: Student record
    Model-->>AuthCtrl: Student record

    alt Student not found
        AuthCtrl-->>Browser: 401 Unauthorized ("Invalid credentials")
    else Password comparison fails
        AuthCtrl-->>Browser: 401 Unauthorized ("Invalid credentials")
    else Student is unverified (is_verified == false)
        AuthCtrl-->>Browser: 403 Forbidden ("Account pending administrative verification")
    else Student is blocked (is_blocked == true)
        AuthCtrl-->>Browser: 403 Forbidden ("Account blocked by administrator")
    else Credentials valid & verified
        AuthCtrl->>JWT: sign({ id, role: 'student', email }, JWT_SECRET, { expiresIn: '24h' })
        JWT-->>AuthCtrl: Signed Bearer Token
        AuthCtrl-->>Browser: 200 OK { token, student: { id, name, email, roll_number } }
        Browser->>Browser: Store token in localStorage / AuthContext
        Browser-->>Student: Redirect to Dashboard view
    end
```

---

### 4.2 Sequence Diagram 2: Student Registration & Admin Verification Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Browser as React Client
    participant AuthCtrl as authController
    participant AdminCtrl as adminController
    actor Admin
    participant DB as Supabase PostgreSQL

    Student->>Browser: Fills registration form
    Browser->>AuthCtrl: POST /api/auth/register { name, email, roll_number, password, hostel... }
    AuthCtrl->>DB: INSERT INTO students (..., is_verified=false)
    DB-->>AuthCtrl: Created student record
    AuthCtrl-->>Browser: 201 Created ("Registration successful. Awaiting admin approval.")
    
    Note over Admin, AdminCtrl: Admin logs in and navigates to Verification portal
    Admin->>Browser: Opens Pending Approvals
    Browser->>AdminCtrl: GET /api/admin/students?verified=false
    AdminCtrl->>DB: SELECT * FROM students WHERE is_verified = false
    DB-->>AdminCtrl: List of pending students
    AdminCtrl-->>Browser: Pending students list
    
    Admin->>Browser: Clicks "Approve" for student
    Browser->>AdminCtrl: PUT /api/admin/students/:id/verify
    AdminCtrl->>DB: UPDATE students SET is_verified = true WHERE id = :id
    DB-->>AdminCtrl: Updated record
    AdminCtrl-->>Browser: 200 OK ("Student successfully verified")
    Browser-->>Admin: Table updates with toast notification
```

---

### 4.3 Sequence Diagram 3: Rate a Meal Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Browser as React Client
    participant StudentCtrl as studentController
    participant DB as Supabase PostgreSQL

    Student->>Browser: Selects 4 stars and types comment for Lunch
    Browser->>StudentCtrl: POST /api/student/ratings { menu_id, meal_type, rating: 4, comment }
    Note over StudentCtrl: Middleware verifies JWT and extracts student_id
    StudentCtrl->>DB: SELECT id FROM ratings WHERE student_id = $1 AND menu_id = $2 AND meal_type = $3
    
    alt Existing rating found for today's meal
        DB-->>StudentCtrl: Existing rating record
        StudentCtrl-->>Browser: 409 Conflict ("You have already rated this meal")
    else No duplicate found
        DB-->>StudentCtrl: null
        StudentCtrl->>DB: INSERT INTO ratings (student_id, menu_id, meal_type, rating, comment)
        DB-->>StudentCtrl: Created rating record
        StudentCtrl-->>Browser: 201 Created { success: true, data: rating }
        Browser-->>Student: Update UI star state & render success toast
    end
```

---

### 4.4 Sequence Diagram 4: Mark Attendance with Time Window Validation

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Browser as React Client
    participant StudentCtrl as studentController
    participant TimeUtil as MealWindowValidator
    participant DB as Supabase PostgreSQL

    Student->>Browser: Clicks "Mark Lunch Attendance"
    Browser->>StudentCtrl: POST /api/student/attendance { meal_type: "lunch" }
    
    StudentCtrl->>TimeUtil: isWithinMealWindow("lunch", serverCurrentTime)
    alt Outside Window (e.g. 15:30)
        TimeUtil-->>StudentCtrl: false (allowed: 12:00 - 14:30)
        StudentCtrl-->>Browser: 400 Bad Request ("Lunch window is 12:00 to 14:30")
    else Inside Window (e.g. 12:45)
        TimeUtil-->>StudentCtrl: true
        StudentCtrl->>DB: SELECT * FROM attendance WHERE student_id = $1 AND date = CURRENT_DATE
        alt No row for today
            StudentCtrl->>DB: INSERT INTO attendance (student_id, date, lunch) VALUES ($1, CURRENT_DATE, true)
            DB-->>StudentCtrl: Row created
        else Row exists and lunch is already true
            StudentCtrl-->>Browser: 400 Bad Request ("Attendance already marked for lunch today")
        else Row exists and lunch is false
            StudentCtrl->>DB: UPDATE attendance SET lunch = true WHERE student_id = $1 AND date = CURRENT_DATE
            DB-->>StudentCtrl: Row updated
        end
        StudentCtrl-->>Browser: 200 OK ("Lunch attendance marked successfully")
        Browser-->>Student: Button turns green: "Marked"
    end
```

---

### 4.5 Sequence Diagram 5: Complaint Lifecycle & Administrative Redressal

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Browser as React Client
    participant StudentCtrl as studentController
    participant AdminCtrl as adminController
    actor Admin
    participant DB as Supabase PostgreSQL

    Student->>Browser: Submits complaint ("Cold food served at dinner")
    Browser->>StudentCtrl: POST /api/student/complaints { title, description }
    StudentCtrl->>DB: INSERT INTO complaints (student_id, title, description, status='pending')
    DB-->>StudentCtrl: Created complaint
    StudentCtrl-->>Browser: 201 Created { success: true, complaint }

    Admin->>Browser: Reviews open complaints on Admin Portal
    Browser->>AdminCtrl: GET /api/admin/complaints?status=pending
    AdminCtrl->>DB: SELECT * FROM complaints WHERE status = 'pending'
    DB-->>AdminCtrl: Open complaints list
    AdminCtrl-->>Browser: Render list
    
    Admin->>Browser: Selects complaint, types response, sets status to 'resolved'
    Browser->>AdminCtrl: PUT /api/admin/complaints/:id { status: "resolved", admin_response: "Food warmer serviced" }
    AdminCtrl->>DB: UPDATE complaints SET status = $1, admin_response = $2, updated_at = NOW() WHERE id = $3
    DB-->>AdminCtrl: Updated complaint
    AdminCtrl-->>Browser: 200 OK ("Complaint status updated")

    Student->>Browser: Refreshes "My Complaints"
    Browser->>StudentCtrl: GET /api/student/complaints
    StudentCtrl->>DB: SELECT * FROM complaints WHERE student_id = $1
    DB-->>StudentCtrl: List with updated response
    StudentCtrl-->>Browser: 200 OK
    Browser-->>Student: Displays green badge "Resolved" and warden response
```

---

## 5. Activity Diagrams

### 5.1 Activity Diagram 1: Student Registration to Verification Flow

```mermaid
flowchart TD
    Start([Start]) --> A[Fill Student Registration Form]
    A --> B{All Required Fields Present?}
    B -- No --> C[Show Validation Errors]
    C --> A
    B -- Yes --> D[Dispatch Registration POST /api/auth/register]
    D --> E{Email / Roll Number Unique?}
    E -- No --> F[Return 409 Conflict Error]
    F --> A
    E -- Yes --> G[Insert record with is_verified=false, is_blocked=false]
    G --> H[Display 'Pending Approval' Message to Student]
    H --> I[Admin reviews pending verification queue]
    I --> J{Admin Decision}
    J -- Reject --> K[Delete student record / notify rejection]
    K --> EndRejected([Account Rejected])
    J -- Approve --> L[Set is_verified = true]
    L --> M[Student can now log in with JWT token]
    M --> EndVerified([Account Active])
```

---

### 5.2 Activity Diagram 2: Attendance Marking Flow

```mermaid
flowchart TD
    Start([Start]) --> A[Student opens Attendance Screen]
    A --> B[Fetch Today's Attendance Record]
    B --> C[Select Meal Slot: Breakfast, Lunch, Snacks, or Dinner]
    C --> D{Is Meal Window Currently Active?}
    D -- No --> E[Display 'Window Closed' with Operating Hours]
    E --> Terminate([Action Disallowed])
    D -- Yes --> F{Has Meal Already Been Marked Today?}
    F -- Yes --> G[Show 'Already Marked' Badge]
    G --> Terminate
    F -- No --> H[Enable 'Mark Attendance' Action Button]
    H --> I[Student clicks button]
    I --> J[Send POST /api/student/attendance]
    J --> K[Server validates timestamp and updates database]
    K --> L[Return 200 OK]
    L --> M[Display Confirmation Toast & Disable Button]
    M --> Success([Attendance Successfully Logged])
```

---

## 6. State Machine Diagrams

### 6.1 State Diagram 1: Grievance / Complaint Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending : Student submits complaint
    Pending --> In_Progress : Admin marks under review
    In_Progress --> Resolved : Admin investigates & publishes remedy
    In_Progress --> Rejected : Admin rejects (invalid/duplicate)
    Pending --> Rejected : Admin dismisses directly
    Pending --> Resolved : Direct resolution provided
    Resolved --> [*]
    Rejected --> [*]
```

*Explanation:* A complaint enters the `Pending` state immediately upon submission. The mess warden transitions it to `In_Progress` when an investigation commences, and concludes it as either `Resolved` (with corrective action) or `Rejected` (with explanatory rationale).

---

### 6.2 State Diagram 2: Student Account Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Unverified : Registration completed
    Unverified --> Verified : Admin approves identity
    Unverified --> [*] : Admin rejects registration
    Verified --> Blocked : Admin blocks (disciplinary / non-payment)
    Blocked --> Verified : Admin unblocks student
    Verified --> [*] : Admin deletes account (graduation / exit)
    Blocked --> [*] : Admin deletes account
```

*Explanation:* Students commence in an `Unverified` holding state. Once `Verified`, they enjoy full student privileges. Disciplinary infractions or hostel exit allow transition to `Blocked` or permanent removal.

---

## 7. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    STUDENTS ||--o{ RATINGS : submits
    STUDENTS ||--o{ ATTENDANCE : records
    STUDENTS ||--o{ COMPLAINTS : logs
    MENUS ||--o{ RATINGS : receives
    ADMINS ||--o{ COMPLAINTS : responds_to
    ADMINS ||--o{ MENUS : manages

    STUDENTS {
        uuid id PK
        string name
        string email UK
        string password
        string roll_number UK
        string hostel_name
        string room_number
        string phone_number
        boolean is_verified
        boolean is_blocked
        timestamp created_at
    }

    ADMINS {
        uuid id PK
        string name
        string email UK
        string password
        string role
        timestamp created_at
    }

    MENUS {
        uuid id PK
        date date UK
        string day
        text_array breakfast
        text_array lunch
        text_array snacks
        text_array dinner
        timestamp created_at
    }

    RATINGS {
        uuid id PK
        uuid student_id FK
        uuid menu_id FK
        string meal_type
        int rating
        text comment
        timestamp created_at
    }

    ATTENDANCE {
        uuid id PK
        uuid student_id FK
        date date
        boolean breakfast
        boolean lunch
        boolean snacks
        boolean dinner
        timestamp created_at
    }

    COMPLAINTS {
        uuid id PK
        uuid student_id FK
        string title
        text description
        string status
        text admin_response
        timestamp created_at
        timestamp updated_at
    }
```

*Relational Constraints:*
* `RATINGS`: Unique composite constraint on `(student_id, menu_id, meal_type)` prevents multiple ratings per meal.
* `ATTENDANCE`: Unique composite constraint on `(student_id, date)` enforces a single daily attendance record per student.
* `MENUS`: Unique constraint on `date` guarantees exactly one published menu per calendar day.

---

## 8. Data Flow Diagrams (DFD)

### 8.1 DFD Level 0 (Context Diagram)

```mermaid
flowchart TD
    Student([Student])
    Admin([Mess Admin / Warden])
    System((SmartMess System))
    
    Student -- Registration Data, Credentials --> System
    Student -- Meal Ratings, Attendance Check-in, Complaints --> System
    System -- Menus, Attendance Status, Complaint Remedies, Auth Tokens --> Student
    
    Admin -- Admin Credentials, Menu Updates, Dish Ordering --> System
    Admin -- Student Verification, Complaint Resolutions --> System
    System -- System Metrics, Ratings Summaries, Attendance Reports CSV, Forecasts --> Admin
```

---

### 8.2 DFD Level 1 (Decomposition Diagram)

```mermaid
flowchart TD
    Student([Student])
    Admin([Mess Admin])
    
    subgraph Processes
        P1((1.0 Authentication & Access Control))
        P2((2.0 Menu Management Service))
        P3((3.0 Rating & Sentiment Processing))
        P4((4.0 Digital Attendance & Validation))
        P5((5.0 Grievance Redressal Engine))
        P6((6.0 Analytics & Attendance Forecasting))
    end
    
    subgraph Data_Stores [Data Stores]
        D1[(D1: Students)]
        D2[(D2: Admins)]
        D3[(D3: Menus)]
        D4[(D4: Ratings)]
        D5[(D5: Attendance)]
        D6[(D6: Complaints)]
    end

    %% Auth Flows
    Student -->|Credentials / Reg Info| P1
    Admin -->|Admin Login| P1
    P1 <-->|Read / Write| D1
    P1 <-->|Read| D2
    P1 -->|JWT / Status| Student
    P1 -->|JWT / Status| Admin

    %% Menu Flows
    Admin -->|Upsert Dishes / Drag & Drop| P2
    P2 <-->|Read / Write| D3
    P2 -->|Daily & Weekly Menus| Student

    %% Rating Flows
    Student -->|Submit Star Rating & Comment| P3
    P3 <-->|Store / Query| D4
    P3 -->|Aggregated Ratings| P6

    %% Attendance Flows
    Student -->|Meal Attendance Click| P4
    P4 <-->|Check Window & Record| D5
    P4 -->|Attendance Logs & CSV| Admin
    P4 -->|Daily Attendance Counts| P6

    %% Complaint Flows
    Student -->|Lodge Complaint| P5
    Admin -->|Review & Attach Response| P5
    P5 <-->|Read / Update Status| D6

    %% Analytics Flows
    P6 -->|Visual SVG Trends & 7-Day Moving Avg Forecast| Admin
```
