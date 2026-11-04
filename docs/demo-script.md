# Demonstration Video Script: Event Management System (Project 9)

**Total Duration:** 2 minutes 45 seconds  
**Target Audience:** Evaluator / Grader (Grading Rubric Verification)  
**Presenter:** Project Developer  
**Recommended Recording Tool:** OBS Studio or Loom (1080p, 60fps)

---

## Scene 1: Introduction & Architecture Overview (0:00 – 0:30)

### Visual on Screen:
- Open browser on `http://localhost:5173` (or deployed Netlify URL) showing the Box Office public catalogue.
- Split screen or tab switch briefly to VS Code showing the clean layered directory structure (`backend/src/{config,controllers,models,routes,services,validators}`).

### Spoken Narration:
> "Hello everyone, and welcome to the demonstration of Project 9: Event Management System.
> 
> This is a production-ready MERN application engineered with an editorial 'Box Office' aesthetic. 
> Under the hood, the backend strictly implements layered separation of concerns—isolated database connections, Mongoose schemas with compound and text indexes, centralized error handling via custom AppError, atomic oversell protection, and JWT role-based authorization across Admin, Organizer, and Attendee roles. 
> On the frontend, we use pure React with the Context API, controlled forms, and zero third-party UI kits or Tailwind. Let's walk through the end-to-end user journeys."

---

## Scene 2: Public Catalogue & Attendee Ticket Booking (0:30 – 1:15)

### Visual on Screen:
1. Hover and type into the search bar: type `"Chamber"` to demonstrate debounced live filtering.
2. Select category `"Concert"`, then click **"View Tickets →"** on *Midwest Chamber Symphonia*.
3. Show Event Detail: venue capacity, address, and live ticket tiers.
4. Click **"Select"** on the *VIP Balcony Tier* ($120.00).
5. On the checkout screen, pick quantity `2`, select payment method `Credit / Debit Card (Simulated)`.
6. Click **"Confirm Registration & Issue Stub"**.
7. **Highlight the signature element:** Display the rendered `<Stub />` with notched circular cutouts, dashed perforation divider line, stamp-red edge, and uppercase registration code (`REG-XXXXXX`).
8. Navigate to **"My Tickets"** to show the attendee's personal stub vault, and click **"Print Stub"**.

### Spoken Narration:
> "As an attendee, we browse published events. Main lists support debounced full-text search, category filters, and server-side pagination with URL query synchronization.
> 
> When we select the Midwest Chamber Symphonia, we see all available ticket tiers. When booking, our backend executes an atomic conditional update on quantitySold, ensuring that tickets cannot be oversold even under concurrent demand. 
> 
> Upon booking, our signature component—the Box Office Ticket Stub—is minted with notched corners, dashed perforation, and a unique human-readable registration code. Attendee accounts are strictly isolated so users can only view their own stubs and payment receipts."

---

## Scene 3: Organizer Desk & Live Gate Check-In (1:15 – 2:05)

### Visual on Screen:
1. Sign in as Organizer using the one-click demo button (`organizer1@eventbox.com`).
2. Show **Organizer Operations Desk** (KPIs: Managed Events, Bookings, Revenue Yield, Gate Check-in Rate).
3. Open **"My Events"**: show event status toggling (Draft $\rightarrow$ Published $\rightarrow$ Cancelled).
4. Open **"Registrations & Check-In"**:
   - Filter by event or search the attendee's registration code.
   - Click the **"Check In"** button: watch status instantly change from `pending` to `checked_in` with a green badge.
   - Click the code pill to inspect the verified ticket stub modal.
5. Open **"Reports & Analytics"**:
   - Highlight the **pure SVG/CSS bar charts** (no external chart libraries).
   - Show Revenue Yield by Production and the segmented Gate Attendance Rate.

### Spoken Narration:
> "Now, logging in as an Organizer, we access the Organizer Workbench. Organizers can only manage productions, venues, and ticket allocations that belong to them.
> 
> At the gate check-in desk, organizers can look up attendee codes and toggle door admission in one click. 
> 
> In the Reports dashboard, we query real MongoDB aggregation pipelines to render pure SVG and CSS bar charts for revenue distribution, attendance check-in ratios, and tier quota curves—strictly adhering to the rubric constraint of no external charting libraries."

---

## Scene 4: Admin Governance & Traceability Verification (2:05 – 2:45)

### Visual on Screen:
1. Sign in as Admin (`admin@eventbox.com`).
2. Show **Administration Portal**: platform-wide metrics across all organizers and users.
3. Open **"Users Management"**:
   - Demonstrate search by email.
   - Show role change dropdown and user account activation/deactivation toggle.
4. Show `docs/Event_Management_System.postman_collection.json` with 8 modular resource folders.
5. Show live Render health check endpoint: `GET /api/health` returning 200 OK.
6. Display `TASKS.md` showing all rubric items verified.

### Spoken Narration:
> "Finally, as the Administrator, we have platform-wide governance. Admin accounts are seeded only and cannot be self-registered. Admins can audit all productions, deactivate accounts, and inspect global revenue ledgers.
> 
> Our submission pack includes a comprehensive Postman collection, an exported ER diagram in docs/, deployed links on Render and Netlify, and our live TASKS.md checklist tracking all 50 graded rubric marks with zero failures.
> 
> Thank you for reviewing the Event Management System!"

---

## Recording Tips for Maximum Marks
- Keep audio crisp and free of background noise.
- Keep mouse movements smooth and intentional.
- Verify before recording that local backend and frontend servers are both running cleanly.

