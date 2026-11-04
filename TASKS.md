# Project 9: Event Management System - Live Grading Checklist & Traceability Matrix

> **Single Source of Truth** for project grading, task tracking, and evidence verification.  
> **Rule:** Items are marked `[x]` ONLY after explicit verification (running code, hitting API endpoint, or viewing UI in browser).

---

## Rubric Breakdown & Evaluation Summary

| Rubric Area | Max Marks | Verified Score | Status |
|---|:---:|:---:|:---:|
| 1. REST API Features | 15 | 0 / 15 | In Progress |
| 2. Mongoose Design & Database | 10 | 0 / 10 | In Progress |
| 3. Authentication & Security | 10 | 0 / 10 | In Progress |
| 4. UI Design & Responsiveness | 5 | 0 / 5 | In Progress |
| 5. Deployment & Production Setup | 5 | 0 / 5 | In Progress |
| 6. Git, Documentation & Submission Pack | 5 | 0 / 5 | In Progress |
| **Total** | **50** | **0 / 50** | **Phase 0 (Planning)** |

---

## 1. REST API Features (15 Marks)

| Status | Requirement | Scope & Constraints | Evidence / Verification Target |
|:---:|---|---|---|
| [x] | Separate Architecture Layers | Explicit separation: router, controller, middleware, service, model, db config | Verified in `backend/src/{routes,controllers,middleware,config}` |
| [x] | Centralized Error Handling | One error middleware + custom `AppError` class + `catchAsync` wrapper | Verified in `backend/src/utils/AppError.js`, `backend/src/middleware/errorHandler.js` |
| [x] | Standard Error Response Shape | Consistent JSON error output `{ status, message, errors }` | Verified via 404 test in `backend/tests/health.test.js` |
| [x] | Server-Side Input Validation | `express-validator` on all mutation endpoints | Verified in `backend/src/validators/*`, tested in `backend/tests/validation.test.js` |
| [ ] | User API (Admin CRUD) | List, get, update role/status, delete with pagination & filters | `GET/PATCH/DELETE /api/users` |
| [ ] | Venue API (CRUD) | List (public), create (org/admin), update, delete with city filter | `GET/POST/PATCH/DELETE /api/venues` |
| [ ] | Event API (CRUD) | Search, filter (category, city, status), sort, pagination | `GET/POST/PATCH/DELETE /api/events` |
| [ ] | TicketType API (CRUD) | Create tiers per event, view tiers, edit, delete | `GET/POST/PATCH/DELETE /api/ticket-types` |
| [ ] | Registration API (CRUD) | Create booking, view (scoped by role), cancel, check-in | `GET/POST/PATCH /api/registrations` |
| [ ] | Payment API (Tracking) | Record simulated payment, list receipts, get receipt | `GET/POST /api/payments` |
| [ ] | Search, Filters & Sorting | Multi-field text search, query filters, sort ascending/descending | Tested on `/api/events?search=...&sort=...` |
| [ ] | Pagination Contract | List endpoints return `{ data, page, limit, total, totalPages }` | Verified on all 6 list endpoints |
| [ ] | Atomic Oversell Prevention | `$inc: { quantitySold: Q }` with conditional `$expr` boundary check | Tested with concurrent/excess requests |
| [ ] | Sale Window & Status Guards | Reject registration if event not published or `now` outside `saleStart`-`saleEnd` | Unit/integration test with boundary timestamps |
| [ ] | Inventory Restoration on Cancel | Cancelling registration restores `quantitySold` atomically | Tested via `PATCH /api/registrations/:id/cancel` |
| [ ] | MongoDB Aggregation Reports | Registrations per event, revenue by event, attendance rate, ticket tier breakdown | `GET /api/reports/organizer`, `GET /api/reports/admin` |
| [x] | Health Check Endpoint | `GET /api/health` returning 200 OK and uptime for Render pinging | Verified via `backend/tests/health.test.js` (200 OK) |

---

## 2. Mongoose Design & Database (10 Marks)

| Status | Requirement | Scope & Constraints | Evidence / Verification Target |
|:---:|---|---|---|
| [x] | Standalone DB Connection | MongoDB connection configured in dedicated file with lifecycle events | Verified in `backend/src/config/db.js` |
| [ ] | MongoDB Atlas Connection | Connects to remote MongoDB Atlas cluster via connection string | Environment variable `MONGODB_URI` |
| [x] | User Model | `name`, `email` (unique), `passwordHash` (select: false), `role`, `isActive`, timestamps | Verified in `backend/src/models/User.js` & `backend/tests/models.test.js` |
| [x] | Venue Model & Indexes | `name`, `address`, `city`, `capacity`, `createdBy(ref)`. Indexes on `city` and `name` | Verified in `backend/src/models/Venue.js` & `backend/tests/models.test.js` |
| [x] | Event Model & Indexes | `title`, `description`, `category`, `startDate`, `endDate`, `venue(ref)`, `organizer(ref)`, `status`, `capacity`. Text index on title/desc; compound index on status+startDate | Verified in `backend/src/models/Event.js` & `backend/tests/models.test.js` |
| [x] | TicketType Model & Indexes | `event(ref)`, `name`, `price`, `quantityTotal`, `quantitySold`, `saleStart`, `saleEnd`. Unique index on event+name | Verified in `backend/src/models/TicketType.js` & `backend/tests/models.test.js` |
| [x] | Registration Model & Indexes | `user(ref)`, `event(ref)`, `ticketType(ref)`, `quantity`, `status`, `attendance`, `checkedInAt`, `registrationCode`. Unique index on user+event+ticketType; index on event | Verified in `backend/src/models/Registration.js` & `backend/tests/models.test.js` |
| [x] | Payment Model & Indexes | `registration(ref)`, `amount`, `method`, `status`, `reference` (unique), `paidAt` | Verified in `backend/src/models/Payment.js` & `backend/tests/models.test.js` |
| [ ] | Model Relationships (Refs) | Real Mongoose `ref` relations populated on retrieval | `populate('venue organizer ticketType user')` verified |
| [x] | Idempotent Seed Script | Seeds 1 admin, 2 organizers, 5 attendees, 3 venues, 6 events, ticket tiers, registrations, payments | Verified in `backend/src/seed/seed.js` |
| [x] | Printed Demo Credentials | Seed script logs clean table of demo accounts and passwords | Verified in `backend/src/seed/seed.js` |

---

## 3. Authentication & Security (10 Marks)

| Status | Requirement | Scope & Constraints | Evidence / Verification Target |
|:---:|---|---|---|
| [x] | Password Hashing | `bcrypt` with salt rounds >= 12 | Verified in `backend/src/models/User.js` pre-save hook |
| [x] | Sensitive Field Masking | `passwordHash` has `select: false` and is never returned in API responses | Verified in `backend/src/services/authService.js` & tests |
| [x] | JWT Generation & Verification | Secure JWT tokens signed with expiration and secret from env | Verified in `backend/src/services/authService.js`, `backend/src/middleware/auth.js` |
| [x] | RBAC Middleware | `authorizeRoles('admin', 'organizer', 'attendee')` route guarding | Verified: 403 Forbidden on unauthorized roles in `backend/tests/auth.test.js` |
| [ ] | Record Isolation (Attendee) | Attendees can only query/view their own registrations and payments | Enforced in services & queries |
| [ ] | Record Isolation (Organizer)| Organizers can only manage their own events, venues, and registrations | Enforced in services & queries |
| [ ] | Global Access (Admin) | Admin accounts bypass ownership restrictions to moderate all records | Admin endpoints & queries verified |
| [x] | Admin Self-Registration Block | `/api/auth/register` rejects attempts to create `admin` role | Verified in `backend/tests/validation.test.js` (400 validation error) |
| [x] | Security Middlewares | `helmet`, `express-mongo-sanitize`, `express-rate-limit` on auth routes | Verified in `backend/app.js` & `backend/src/routes/authRoutes.js` |
| [x] | CORS Restriction | CORS origin restricted to frontend URL from environment variable | Verified in `backend/app.js` |

---

## 4. UI Design & Responsiveness (5 Marks)

| Status | Requirement | Scope & Constraints | Evidence / Verification Target |
|:---:|---|---|---|
| [ ] | Modern React + Vite | Clean Vite setup with `react-router-dom` | `frontend/package.json`, `frontend/vite.config.js` |
| [ ] | Context API Only | State managed via `AuthContext` and `ToastContext` (no Redux/Zustand) | `frontend/src/context/*` |
| [ ] | Controlled Forms | Strict `event.preventDefault()` pattern with controlled input state | All form pages in `frontend/src/pages/*` |
| [ ] | Dual-Layer Form Validation | Required fields validated in React UI before submission and in Express API | Tested with empty/invalid inputs |
| [ ] | 4 Mandatory UI States | Every async view handles `loading`, `empty`, `error`, and `success` | Tested by throttling network and empty lists |
| [ ] | Box Office Design System | Palette: paper `#F4EFE6`, surface `#FBF8F2`, ink `#17140F`, accent `#D9411E` | `frontend/src/styles/tokens.css` |
| [ ] | Typography Selection | `Newsreader` (serif headings) + `Schibsted Grotesk` (UI) loaded via Google Fonts | `frontend/index.html`, `frontend/src/styles/base.css` |
| [ ] | Tabular Numerals | Tabular font figures used for dates, currencies, and codes | CSS `font-variant-numeric: tabular-nums;` |
| [ ] | Signature Ticket Stub | `<Stub />` with notched corners, perforated dashed border, small-caps code | Rendered on Success, My Tickets, and Check-in |
| [ ] | Mobile Responsiveness | Fully responsive down to 360px; tables adapt to stacked rows | Chrome DevTools device testing |
| [ ] | Accessibility & Touch Targets | 44px minimum touch targets, WCAG AA contrast, visible focus rings | Accessibility audit pass |
| [ ] | Pure SVG/CSS Charts | Reports dashboard renders bar charts using pure SVG/CSS (no chart library) | `frontend/src/pages/organizer/ReportsPage.jsx` |

---

## 5. Deployment & Production Setup (5 Marks)

| Status | Requirement | Scope & Constraints | Evidence / Verification Target |
|:---:|---|---|---|
| [ ] | Backend Render Deployment | Hosted on Render with build/start commands and health check | Render service URL |
| [ ] | Frontend Netlify Deployment| Hosted on Netlify with SPA redirect rules | Netlify site URL |
| [ ] | Client-Side SPA Redirects | `public/_redirects` and `netlify.toml` configured for `/* -> /index.html 200` | Tested by refreshing non-root route on live site |
| [ ] | Production Environment Config| Secrets managed via environment variables (never committed) | `.env.example` in both folders, git check |
| [ ] | CORS Configuration | Backend accepts requests only from deployed frontend URL | Tested live cross-origin request |
| [ ] | Atlas Network Whitelist | Remote MongoDB Atlas access configured for production deployment | MongoDB Atlas connection verified |

---

## 6. Git, Documentation & Submission Pack (5 Marks)

| Status | Requirement | Scope & Constraints | Evidence / Verification Target |
|:---:|---|---|---|
| [ ] | Clean Git Repository | Logical semantic commits (`feat`, `chore`, `style`, `docs`) | `git log --oneline` |
| [ ] | Strict `.gitignore` | Zero `.env`, `node_modules`, or build artifacts tracked in git | `git ls-files .env` returns empty |
| [ ] | Comprehensive README | Overview, features per role, tech stack, env table, setup guide, credentials | `README.md` |
| [ ] | Postman Collection | Exported collection with folders per resource, environment, demo requests | `docs/Event_Management_System.postman_collection.json` |
| [ ] | ER Diagram | Mermaid ER diagram and visual graphic in `docs/` | `docs/er-diagram.md`, `docs/er-diagram.svg` |
| [ ] | Application Screenshots | Visual screenshots of key screens per role in `docs/screenshots/` | PNG images in `docs/screenshots/` |
| [ ] | Demo Video Script | Detailed 2-3 minute scene-by-scene presentation walkthrough | `docs/demo-script.md` |
| [ ] | HUMAN_TODO Action Guide | Step-by-step instructions for tasks only the user can perform | `HUMAN_TODO.md` |

---

## Phase Execution Checklist

- [x] **Phase 1: Repo Scaffold, Tooling & Core Config** (Verified: .gitignore, .env handling, health test pass)
- [x] **Phase 2: Mongoose Models, Indexes & Database Seeding** (Verified: 6 schemas, indexes, validation tests, seed script)
- [x] **Phase 3: Auth, RBAC Middleware, Validation & Central Error Handling** (Verified: JWT, register/login, RBAC 401/403, 20 tests pass)
- [ ] **Phase 4: REST APIs for All 6 Resources & Aggregation Reports**
- [ ] **Phase 5: Frontend Foundation, Tokens & Impeccable Step 2 (Visual Sign-Off)**
- [ ] **Phase 6: Complete CRUD Screens & Role Dashboards**
- [ ] **Phase 7: Reports & Analytics Dashboard (Pure SVG/CSS)**
- [ ] **Phase 8: Impeccable Review Chain & Responsive Polish**
- [ ] **Phase 9: Deployment Configuration & Production Readiness**
- [ ] **Phase 10: Documentation, ER Diagram, Postman & Demo Script**
- [ ] **Final Verification: Traceability Matrix Review & Sign-Off**

