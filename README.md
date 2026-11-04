# Event Management System (Project 9)

A comprehensive, production-ready MERN stack Event Management System engineered for college grading criteria. Features role-based access control (Admin, Organizer, Attendee), atomic inventory checks to eliminate ticket overselling, real-time ticket stubs, and MongoDB aggregation analytics presented in an editorial "Box Office" aesthetic.

---

## Live Deployments & Repository
- **GitHub Repository:** `https://github.com/<YOUR_GITHUB_USERNAME>/event-management-system` *(Update after user push)*
- **Frontend URL (Netlify):** `https://<YOUR_NETLIFY_SITE>.netlify.app` *(Update after user deploy)*
- **Backend API URL (Render):** `https://<YOUR_RENDER_SERVICE>.onrender.com` *(Update after user deploy)*
- **Demo Video:** `https://<DEMO_VIDEO_LINK>` *(2-3 minutes walkthrough)*

---

## Role Features Overview
- **Attendee:**
  - Browse published events with full-text search, category, and date filtering.
  - Multi-tier ticket selection with real-time availability.
  - Simulated payment processing (Card, UPI, Cash) with unique reference generation.
  - Interactive perforated Ticket Stubs with printable views and unique registration codes.
  - Personal ticket and payment history management.
- **Organizer:**
  - Complete lifecycle management of events, venues, and ticket types.
  - Guarded editing (only owners can modify their own events and venues).
  - Real-time attendee roster with 1-click check-in toggle and search by registration code.
  - Financial auditing for ticket sales.
  - Real MongoDB aggregation reports (revenue by event, attendance rates, sales breakdown) rendered with custom SVG/CSS bar charts.
- **Admin:**
  - Platform-wide moderation and audit of all events, venues, ticket types, registrations, and payments.
  - User account management: activate/deactivate accounts, change roles, safe deletion.
  - Global platform analytics and financial volume reporting.

---

## Tech Stack
- **Backend:** Node.js, Express.js (Layered MVC+S architecture: Router $\rightarrow$ Controller $\rightarrow$ Middleware $\rightarrow$ Service $\rightarrow$ Model $\rightarrow$ DB)
- **Database:** MongoDB Atlas with Mongoose (validation, compound indexes, text indexes, references)
- **Security & Auth:** JWT, bcryptjs password hashing (`select: false`), Helmet, express-rate-limit, express-mongo-sanitize, CORS origin locking
- **Frontend:** React 18, Vite, React Router v6, Context API (`AuthContext`, `ToastContext`), Plain CSS Custom Properties (Box Office design system)
- **Icons:** `lucide-react` (1.5 stroke width)
- **Typography:** `Newsreader` (serif headings) + `Schibsted Grotesk` (UI)

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|---|---|---|
| `PORT` | Local server port | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | 32+ character random secret string | `super_secret_jwt_key_...` |
| `JWT_EXPIRES_IN` | Token lifespan | `7d` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## Local Setup & Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas cluster (see `HUMAN_TODO.md`)

### 1. Clone Repository & Setup Backend
```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/event-management-system.git
cd event-management-system/backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string
npm run seed     # Populate database with realistic demo accounts and events
npm run dev      # Starts API on http://localhost:5000
```

### 2. Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## Demo Credentials (from Seed Script)
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@eventbox.com` | `Admin@123456` |
| **Organizer 1** | `organizer1@eventbox.com` | `Org@123456` |
| **Organizer 2** | `organizer2@eventbox.com` | `Org@123456` |
| **Attendee 1** | `attendee1@eventbox.com` | `User@123456` |
| **Attendee 2** | `attendee2@eventbox.com` | `User@123456` |

