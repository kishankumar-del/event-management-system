# Event Management System (Project 9)

A comprehensive, production-grade MERN stack Event Management System engineered strictly for university grading criteria. Features role-based access control (Admin, Organizer, Attendee), atomic inventory checks to prevent ticket overselling, real-time ticket stubs, and MongoDB aggregation analytics presented in an editorial "Box Office" aesthetic.

---

## Live Deployments & Submission Pack
- **GitHub Repository:** `https://github.com/kishankumar-del/event-management-system`
- **Frontend URL (Netlify):** `https://event-box-office.netlify.app/`
- **Backend API URL (Render):** `https://event-management-backend-o2tn.onrender.com`
- **API Health Check:** `https://event-management-backend-o2tn.onrender.com/api/health`
- **Demo Video:** `https://<DEMO_VIDEO_LINK>` *(Scene-by-scene script in docs/demo-script.md)*
- **Postman Collection:** `docs/Event_Management_System.postman_collection.json`
- **ER Diagram:** `docs/er-diagram.md` and visual SVG `docs/er-diagram.svg`
- **Screenshots:** High-resolution captures per role in `docs/screenshots/`

---

## Role Features Overview
- **Attendee:**
  - Browse published events with debounced full-text search, category, and date filtering.
  - Multi-tier ticket selection with real-time capacity and sale window enforcement.
  - Simulated payment processing (Card, UPI, Cash) with unique reference generation.
  - Interactive perforated Ticket Stubs with printable views and unique registration codes (`REG-XXXXXX`).
  - Personal ticket and payment receipts archive.
- **Organizer:**
  - Complete lifecycle management of events, venues, and ticket types.
  - Record ownership isolation (only creators can modify their own events and venues).
  - Real-time attendee roster with 1-click check-in toggle and search by registration code.
  - Financial auditing for ticket sales.
  - Real MongoDB aggregation reports (revenue by event, attendance rates, ticket tier sales) rendered with custom pure SVG/CSS bar charts (no external chart libraries).
- **Admin:**
  - Platform-wide moderation and audit of all events, venues, ticket types, registrations, and payments.
  - User account management: activate/deactivate accounts, change roles, safe deletion.
  - Global platform analytics and financial volume reporting.
  - Blocked from self-registration (Admin accounts are seeded only).

---

## Tech Stack & Architecture
- **Backend:** Node.js, Express.js
  - Layered MVC+S architecture: Router $\rightarrow$ Controller $\rightarrow$ Middleware $\rightarrow$ Service $\rightarrow$ Model $\rightarrow$ DB
  - Standalone MongoDB connection with lifecycle event listeners
  - Centralized error handling via custom `AppError` class, `catchAsync`, and global error middleware
- **Database:** MongoDB Atlas with Mongoose
  - 6 Mongoose models: `User`, `Venue`, `Event`, `TicketType`, `Registration`, `Payment`
  - Validation rules, compound unique indexes, and text indexes
- **Security & Auth:**
  - JWT + bcrypt password hashing (`select: false`)
  - Route guards: `auth` middleware and RBAC `authorizeRoles('admin', 'organizer', 'attendee')`
  - Helmet, express-rate-limit, express-mongo-sanitize, CORS origin locked to frontend URL
- **Frontend:** React 18, Vite, React Router v6
  - Context API only (`AuthContext`, `ToastContext`), strictly zero Redux/Zustand
  - Controlled forms using `event.preventDefault()` with dual-layer validation
  - 4 mandatory UI states on every async operation (`loading`, `empty`, `error`, `success`)
  - Pure CSS Custom Properties (`tokens.css`, `base.css`) implementing the "Box Office" design direction
  - Signature `<Stub />` component with notched corners and perforated dashed tear line
  - Tabular numerals (`tabular-nums`) for currency and date alignment

---

## Project Directory Structure

```
event-management-system/
├── TASKS.md                         # Live grading checklist & traceability matrix
├── HUMAN_TODO.md                    # Exact instructions for user-performed actions
├── README.md                        # Primary project documentation
├── .impeccable.md                   # Box Office design direction specifications
├── .gitignore                       # Multi-tier ignore (node_modules, .env, dist)
├── docs/
│   ├── Event_Management_System.postman_collection.json  # Exported Postman collection
│   ├── Event_Management_System.postman_environment.json # Postman environment
│   ├── er-diagram.md                # Mermaid ER diagram
│   ├── er-diagram.svg               # Visual vector graphic
│   ├── demo-script.md               # 2-3 minute video walkthrough script
│   └── screenshots/                 # Captured screens per role & mobile
│
├── backend/
│   ├── package.json
│   ├── server.js                    # Process entry point & unhandled rejection handlers
│   ├── app.js                       # Express middleware pipeline & security
│   ├── .env.example
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # Isolated Mongoose connection
│   │   │   └── env.js               # Validated environment variables
│   │   ├── models/                  # 6 Mongoose models with validation & indexes
│   │   │   ├── User.js
│   │   │   ├── Venue.js
│   │   │   ├── Event.js
│   │   │   ├── TicketType.js
│   │   │   ├── Registration.js
│   │   │   └── Payment.js
│   │   ├── middleware/              # auth, authorizeRoles, validate, notFound, errorHandler
│   │   ├── controllers/             # Request parsing & HTTP response serialization
│   │   ├── services/                # Pure business logic & atomic transactions
│   │   ├── routes/                  # Express sub-routers
│   │   ├── utils/                   # AppError, catchAsync, apiFeatures, codeGenerator
│   │   ├── validators/              # express-validator request schemas
│   │   └── seed/                    # Idempotent seed script with sample data
│   └── tests/                       # Automated node --test suites
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html                   # Google fonts (Newsreader + Schibsted Grotesk)
    ├── netlify.toml                 # Netlify deployment & SPA rewrite
    ├── public/
    │   ├── _redirects               # SPA routing rewrite rule (/* /index.html 200)
    │   └── favicon.svg              # Minimal stamp-red ticket favicon
    └── src/
        ├── api/client.js            # Universal fetch wrapper with 401 interception
        ├── context/                 # AuthContext and ToastContext
        ├── hooks/                   # useDebounce and usePaginatedList
        ├── layouts/                 # PublicLayout and DashboardLayout
        ├── routes/                  # ProtectedRoute and RoleRoute
        ├── styles/                  # tokens.css and base.css
        ├── components/ui/           # Button, Field, Input, Select, Table, Pagination, Badge, Stub
        └── pages/                   # Public, Attendee, Organizer, Admin screens
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|---|---|---|
| `PORT` | Local server port | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | 32+ character signing key | `super_secret_jwt_signing_key_...` |
| `JWT_EXPIRES_IN` | Token lifespan | `7d` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## Local Setup & Quickstart

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas cluster (see `HUMAN_TODO.md`)

### 1. Run Automated Tests
```bash
cd backend
npm test
```

### 2. Seed Database
```bash
cd backend
npm run seed
```

### 3. Start Backend
```bash
cd backend
npm run dev
# API running on http://localhost:5000
# Health check available on http://localhost:5000/api/health
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
# Client running on http://localhost:5173
```

---

## Demo Credentials Table (from Seed Script)
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@eventbox.com` | `Admin@123456` |
| **Organizer 1** | `organizer1@eventbox.com` | `Org@123456` |
| **Organizer 2** | `organizer2@eventbox.com` | `Org@123456` |
| **Attendee 1** | `attendee1@eventbox.com` | `User@123456` |
| **Attendee 2** | `attendee2@eventbox.com` | `User@123456` |
| **Attendee 3** | `attendee3@eventbox.com` | `User@123456` |

---

## API Route Summary

| Method | Endpoint | Auth | Role(s) | Description |
|---|---|---|---|---|
| `GET` | `/api/health` | No | Public | Uptime & database status |
| `POST`| `/api/auth/register` | No | Public | Register attendee or organizer |
| `POST`| `/api/auth/login` | No | Public | Authenticate user & receive JWT |
| `POST`| `/api/auth/logout` | Yes | All | Clear session |
| `GET` | `/api/auth/me` | Yes | All | Current profile |
| `GET` | `/api/users` | Yes | Admin | Paginated user management |
| `PATCH`| `/api/users/:id` | Yes | Admin | Change user role or status |
| `GET` | `/api/venues` | No | Public | List venues (with city search) |
| `POST`| `/api/venues` | Yes | Organizer, Admin | Create venue |
| `GET` | `/api/events` | No | Public | List published events |
| `POST`| `/api/events` | Yes | Organizer, Admin | Create event |
| `PATCH`| `/api/events/:id` | Yes | Organizer, Admin | Update event details |
| `GET` | `/api/ticket-types` | No | Public | List ticket tiers for event |
| `POST`| `/api/ticket-types` | Yes | Organizer, Admin | Create ticket tier |
| `POST`| `/api/registrations`| Yes | All | Atomic booking & payment simulation |
| `GET` | `/api/registrations`| Yes | All | List registrations (scoped by role) |
| `PATCH`| `/api/registrations/:id/cancel` | Yes | Owner, Org, Admin | Cancel registration & restore inventory |
| `PATCH`| `/api/registrations/:id/check-in` | Yes | Org, Admin | Gate attendance check-in |
| `GET` | `/api/payments` | Yes | All | List payments (scoped by role) |
| `PATCH`| `/api/payments/:id/refund` | Yes | Org, Admin | Refund payment |
| `GET` | `/api/reports/organizer` | Yes | Organizer, Admin | Real MongoDB aggregation metrics |
| `GET` | `/api/reports/admin` | Yes | Admin | Platform-wide aggregation |
