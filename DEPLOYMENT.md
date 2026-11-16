# SmartMess – Production Cloud Deployment Runbook
**Target Environments:** Supabase (Database), Render (Backend API), Vercel (Frontend Client)  
**Document ID:** SM-DEPLOY-01  
**Version:** 1.0.0  

---

## 1. Architecture & Deployment Overview

```
                          +-------------------------------+
                          |    Vercel Edge Network        |
                          |  (React SPA / Static Edge)    |
                          |   https://smartmess.vercel.app|
                          +---------------+---------------+
                                          |
                                          | HTTPS / REST
                                          v
                          +---------------+---------------+
                          |     Render Cloud Service      |
                          |   (Express Node.js Server)    |
                          |  https://api-smartmess.onrender.com
                          +---------------+---------------+
                                          |
                                          | SSL / PgBouncer :5432
                                          v
                          +---------------+---------------+
                          |   Supabase Cloud Platform     |
                          |   (PostgreSQL 15 Database)    |
                          +-------------------------------+
```

---

## 2. Step 1: Database Setup on Supabase

1. **Create Supabase Project:**
   * Navigate to [https://supabase.com](https://supabase.com) and log in.
   * Click **New Project**, select an organization, name the project `smartmess-db`, set a secure database password, and select your preferred region.
2. **Execute Database DDL Schema:**
   * In the Supabase dashboard, open the **SQL Editor** tab on the left sidebar.
   * Click **New Query**, open the repository file [`backend/database_schema.sql`](file:///c:/Users/Aadit/Downloads/se_project/backend/database_schema.sql), copy its entire content, and paste it into the editor.
   * Click **Run**. Verify that all six tables (`students`, `admins`, `menus`, `ratings`, `attendance`, `complaints`), their foreign keys, CHECK constraints, and B-tree indexes are created successfully.
3. **Retrieve API Credentials:**
   * Go to **Project Settings** $\rightarrow$ **API**.
   * Note the **Project URL** (e.g., `https://xyzcompany.supabase.co`).
   * Note the **anon (public)** key or **service_role (secret)** key.

---

## 3. Step 2: Backend API Deployment on Render

1. **Create Web Service:**
   * Navigate to [https://render.com](https://render.com) and log in.
   * Click **New +** $\rightarrow$ **Web Service**.
   * Connect your GitHub repository containing the SmartMess project.
2. **Configure Service Settings:**
   * **Name:** `smartmess-api`
   * **Region:** Same geographical region as your Supabase database instance.
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node src/server.js`
   * **Instance Type:** `Free` (or Starter)
3. **Configure Environment Variables:**
   Under the **Environment** tab, inject the following keys:
   ```env
   NODE_ENV=production
   PORT=10000
   CLIENT_URL=https://smartmess.vercel.app
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-supabase-service-role-or-anon-key
   JWT_SECRET=super_secret_jwt_random_string_minimum_32_characters_long
   JWT_EXPIRES_IN=24h
   BREAKFAST_START=07:00
   BREAKFAST_END=10:00
   LUNCH_START=12:00
   LUNCH_END=14:30
   SNACKS_START=16:30
   SNACKS_END=18:30
   DINNER_START=19:30
   DINNER_END=22:00
   ```
4. **Health Check Configuration:**
   * Set **Health Check Path** to `/api/health`.
5. **Provision Initial Administrator Account:**
   * Once deployed, open the Render **Shell** tab on the dashboard and execute:
     ```bash
     node src/scripts/createAdmin.js --name "Mess Manager" --email "admin@smartmess.edu" --password "Admin@Secure2024"
     ```
   * Confirm that the output displays `Admin account successfully created!`.

---

## 4. Step 3: Frontend Deployment on Vercel

1. **Import Repository to Vercel:**
   * Navigate to [https://vercel.com](https://vercel.com) and log in.
   * Click **Add New...** $\rightarrow$ **Project**.
   * Select the SmartMess GitHub repository.
2. **Configure Project Settings:**
   * **Framework Preset:** `Vite`
   * **Root Directory:** Edit and set to `frontend`.
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
   * **Install Command:** `npm install`
3. **Environment Variables:**
   Under **Environment Variables**, add:
   ```env
   VITE_API_URL=https://smartmess-api.onrender.com/api
   ```
4. **Single Page Application (SPA) Routing Configuration:**
   To guarantee that client-side React Router paths (e.g., `/dashboard`, `/admin/menus`) don't return 404 errors on page reload, verify that [`frontend/vercel.json`](file:///c:/Users/Aadit/Downloads/se_project/frontend/vercel.json) exists with rewrite rules.

---

## 5. Step 4: CORS & Domain Confinement

In the Render backend dashboard, update the `CLIENT_URL` environment variable to match the production domain issued by Vercel:
```env
CLIENT_URL=https://your-custom-mess-domain.vercel.app
```
Redeploy the backend service to apply the updated CORS origin whitelist.

---

## 6. Post-Deployment Smoke Test Protocol

Execute the following 5-point smoke test to confirm end-to-end production readiness:

| Step | Action | Expected Result | Verified? |
| :---: | :--- | :--- | :---: |
| **1** | Ping `GET https://your-backend.onrender.com/api/health` | HTTP 200 `{ "success": true, "message": "SmartMess API is fully operational" }` | [ ] |
| **2** | Open frontend URL in browser | Landing page loads with header, hero banner, feature grid, and footer | [ ] |
| **3** | Log in with initial Admin credentials (`admin@smartmess.edu`) | Redirects to `/admin/dashboard`; KPI counters populate from Supabase | [ ] |
| **4** | Register a test student at `/register` | Form submits; shows pending approval notice | [ ] |
| **5** | Approve test student in `/admin/verifications`, then log in as student | Student can view today's menu, mark attendance during active meal window, and submit a rating | [ ] |
