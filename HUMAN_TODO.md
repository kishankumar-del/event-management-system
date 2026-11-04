# HUMAN_TODO.md: Manual Actions Required by Project Owner

This document outlines all external actions, account configurations, and deployments that require manual user intervention. The AI agent cannot perform external cloud dashboard clicks, create third-party credentials, or record video on your behalf.

Follow these step-by-step instructions to ensure full points on Deployment (5 Marks) and Submission Pack (5 Marks).

---

## 1. MongoDB Atlas Setup (Database Hosting)

The project requires a hosted MongoDB Atlas database for both local development and Render deployment.

### Step-by-Step Instructions:
1. **Sign in / Create Account:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in.
2. **Create a Free Cluster:**
   - Click **Create Deployment** (or **Build a Database**).
   - Choose the **M0 Free** tier (AWS or GCP provider in your closest region).
   - Name the cluster (e.g., `Cluster0` or `event-system`).
   - Click **Create**.
3. **Configure Database Access (User Credentials):**
   - In the left sidebar, navigate to **Security** -> **Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `ems_admin` (or your choice).
   - Password: Click **Autogenerate Secure Password** (copy and save this safely).
   - Database User Privileges: Select **Read and write to any database** (or **Atlas Admin**).
   - Click **Add User**.
4. **Configure Network Access (IP Whitelist):**
   - In the left sidebar, navigate to **Security** -> **Network Access**.
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`). *Note: This is mandatory so both your local machine and Render's dynamic cloud instances can connect.*
   - Click **Confirm**.
5. **Obtain Connection String:**
   - In the left sidebar, click **Database**.
   - Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string format:
     ```text
     mongodb+srv://ems_admin:<password>@cluster0.xxxxx.mongodb.net/event_management?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the database user's password and ensure the database name is `event_management`.
   - Place this connection string into your `backend/.env` file as `MONGODB_URI`.

---

## 2. GitHub Repository Setup & Initial Push

The project must reside in a public or accessible GitHub repository for grading and continuous deployment.

### Step-by-Step Instructions:
1. **Create GitHub Repository:**
   - Go to [GitHub New Repository](https://github.com/new).
   - Repository Name: `event-management-system` (or your preferred name).
   - Description: `MERN Event Management System - College Project 9`.
   - Visibility: **Public** (recommended for evaluation and easy deployment).
   - Do **NOT** check "Initialize with README", `.gitignore`, or license (the project already contains these).
   - Click **Create repository**.
2. **Push Local Code to GitHub:**
   - Open PowerShell or terminal in `e:\ISD Pro`:
     ```powershell
     git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/event-management-system.git
     git branch -M main
     git push -u origin main
     ```

---

## 3. Render Deployment (Backend Service)

Render will host the Node.js Express API.

### Step-by-Step Instructions:
1. **Sign in to Render:** Go to [Render](https://render.com) and sign in (preferably with your GitHub account).
2. **Create New Web Service:**
   - Click **New +** -> **Web Service**.
   - Select **Build and deploy from a Git repository**.
   - Select your `event-management-system` repository.
3. **Configure Service Settings:**
   - **Name:** `event-management-backend` (will give you `https://event-management-backend.onrender.com`).
   - **Region:** Closest to your database (e.g., Singapore, Frankfurt, Oregon).
   - **Branch:** `main`.
   - **Root Directory:** `backend` (CRITICAL: must point to the backend subfolder).
   - **Runtime:** `Node`.
   - **Build Command:** `npm install`.
   - **Start Command:** `npm start`.
   - **Instance Type:** `Free`.
4. **Configure Environment Variables:**
   - Click **Advanced** -> **Add Environment Variable** and enter:
     - `NODE_ENV`: `production`
     - `PORT`: `10000`
     - `MONGODB_URI`: `<Your MongoDB Atlas connection string from Step 1>`
     - `JWT_SECRET`: `<A secure 32+ character random string>`
     - `JWT_EXPIRES_IN`: `7d`
     - `CORS_ORIGIN`: `https://<YOUR_NETLIFY_SITE_NAME>.netlify.app` *(update this after creating Netlify site)*
5. **Deploy & Verify:**
   - Click **Create Web Service**.
   - Monitor the logs until you see `Server running on port 10000` and `Connected to MongoDB Atlas`.
   - Test the health check endpoint in your browser: `https://<your-render-url>/api/health`.

---

## 4. Netlify Deployment (Frontend Application)

Netlify will host the React + Vite Single Page Application.

### Step-by-Step Instructions:
1. **Sign in to Netlify:** Go to [Netlify](https://www.netlify.com) and sign in.
2. **Add New Site from Git:**
   - Click **Add new site** -> **Import an existing project**.
   - Choose **GitHub** and authorize access to your `event-management-system` repo.
3. **Configure Build Settings:**
   - **Branch to deploy:** `main`.
   - **Base directory:** `frontend` (CRITICAL: must point to the frontend subfolder).
   - **Build command:** `npm run build`.
   - **Publish directory:** `dist` (or `frontend/dist`).
4. **Configure Environment Variables:**
   - Go to **Site configuration** -> **Environment variables**.
   - Click **Add a variable**:
     - Key: `VITE_API_URL`
     - Value: `https://<your-render-url>/api` *(your live Render backend URL from Step 3)*
5. **Deploy Site:**
   - Click **Deploy site**.
   - Netlify will build and deploy your application.
   - Note the generated site URL (e.g., `https://event-box-office.netlify.app`).
6. **Cross-Link CORS:**
   - Return to **Render** -> your Web Service -> **Environment Variables**.
   - Set `CORS_ORIGIN` to match your exact Netlify site URL (e.g., `https://event-box-office.netlify.app` with no trailing slash).
   - Click **Save changes** on Render to trigger an automatic redeploy.

---

## 5. Seed Database on Atlas

Once your Atlas connection string is configured in `backend/.env`:
1. Run the seed script locally against your Atlas database:
   ```powershell
   cd backend
   node src/seed/seed.js
   ```
2. Verify that the console logs show successful insertion of:
   - 1 Admin
   - 2 Organizers
   - 5 Attendees
   - 3 Venues
   - 6 Events
   - Ticket Tiers, Registrations, and Payments.

---

## 6. Record Demo Video (2-3 Minutes)

The submission pack requires a short 2-3 minute demo video showcasing the system's core features.

### Step-by-Step Instructions:
1. **Reference the Script:** Open `docs/demo-script.md` (which contains an exact scene-by-scene script with timestamps and spoken narration prompts).
2. **Setup Recording Tool:** Use OBS Studio, Loom, or Windows Game Bar (`Win + G`).
3. **Key Scenes to Capture:**
   - **Scene 1 (0:00 - 0:45) Public Catalogue & Attendee Booking:** Browse events on the Box Office interface, view an event detail, pick ticket tier, complete checkout, and show the rendered perforated Ticket Stub on "My Tickets".
   - **Scene 2 (0:45 - 1:45) Organizer Workflow & Check-in:** Log in as organizer (`organizer1@eventbox.com`), view "My Events", demonstrate ticket roster, and toggle 1-click attendance check-in. Open Organizer Reports to show pure SVG/CSS revenue and attendance graphs.
   - **Scene 3 (1:45 - 2:30) Admin Moderation:** Log in as admin (`admin@eventbox.com`), show the Users management table (toggle active status), and global reports dashboard.
   - **Scene 4 (2:30 - 3:00) Architecture Summary:** Briefly highlight the layered MVC+S backend architecture, atomic inventory protection, and deployed production URLs.
4. **Upload & Share:**
   - Upload to YouTube (Unlisted), Google Drive (Public link), or Loom.
   - Paste the video link into the primary `README.md`.

---

## 7. Final Submission Checklist

Before final submission of the assignment, verify that you have:
- [ ] Pushed all code to GitHub (`main` branch).
- [ ] Verified live Render API health check: `https://<render-url>/api/health`.
- [ ] Verified live Netlify frontend navigation and registration flow.
- [ ] Updated `README.md` with:
  - GitHub Repository URL
  - Live Frontend URL (Netlify)
  - Live Backend URL (Render)
  - Demo Video link
  - Seed demo credentials
- [ ] Exported Postman collection and environment located in `docs/`.
- [ ] ER diagram and screenshots verified in `docs/`.

