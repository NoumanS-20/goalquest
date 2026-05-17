# GoalQuest — AtomQuest Hackathon 1.0

> **In-House Goal Setting & Tracking Portal**
> An end-to-end, audit-ready system covering the entire goal lifecycle from creation through quarterly check-ins, with built-in analytics, escalations, and reports.

---

## Live Demo & Submission

| Item                | Link                                                                |
| ------------------- | ------------------------------------------------------------------- |
| **Live URL**        | _(deploy to Vercel — instructions below)_                           |
| **Source code**     | This repository                                                     |
| **Architecture**    | [`/docs/architecture.svg`](./docs/architecture.svg)                 |
| **Demo accounts**   | Password for all is `demo1234` · one-click switch in the login page |

| Role     | Email                  | Highlights                                                |
| -------- | ---------------------- | --------------------------------------------------------- |
| Admin    | `admin@atomberg.com`   | Org, cycles, escalations, reports, audit, settings, unlock |
| Manager  | `rohan@atomberg.com`   | Team approvals, inline edits, comments, shared goals      |
| Manager  | `priya@atomberg.com`   | Engineering team                                          |
| Employee | `kabir@atomberg.com`   | Approved goals + Q1 check-ins logged                      |
| Employee | `anika@atomberg.com`   | Goals SUBMITTED, awaiting manager approval                |
| Employee | `vikram@atomberg.com`  | Approved engineering goals                                |
| Employee | `meera@atomberg.com`   | Goals still in DRAFT                                      |

---

## What's Implemented

### Phase 1 — Goal Creation & Approval (Must-Have)
- ✓ Employee creates goal sheet — Thrust Area, UoM, Target, Weightage, Description
- ✓ All 6 UoM types: `MIN_NUMERIC`, `MIN_PCT`, `MAX_NUMERIC`, `MAX_PCT`, `TIMELINE`, `ZERO`
- ✓ Weightage validation: **total = 100%**, **min 10%**, **max 8 goals**, enforced both client + server
- ✓ Manager (L1) approval workflow with inline editing, return-for-rework, lock-on-approve
- ✓ Admin can unlock locked goals (audit-logged)
- ✓ Shared / departmental goals — manager pushes to multiple reports, weightage editable, title/target read-only, sync on parent check-in

### Phase 2 — Achievement Tracking & Quarterly Check-ins (Must-Have)
- ✓ Quarterly update interface — log Actual vs Planned
- ✓ Status: `Not Started` / `On Track` / `Completed`
- ✓ Manager check-in module — Planned vs Achievement view, structured Check-in Comment thread
- ✓ System-computed score per UoM (BRD formulas):
  - **Min Numeric/%** → Achievement ÷ Target
  - **Max Numeric/%** → Target ÷ Achievement
  - **Timeline** → 100% if completed by deadline, else 0%
  - **Zero** → 100% if actual=0, else 0%

### Reporting & Governance
- ✓ **Achievement Report** — CSV export (Planned vs Actual, all employees, all quarters)
- ✓ **Completion Dashboard** — real-time view with per-quarter coverage bars
- ✓ **Audit Trail** — every change (CREATE / UPDATE / APPROVE / RETURN / LOCK / UNLOCK / CHECKIN / DELETE) captured with actor, field, old → new value, timestamp

### Bonus (Section 5)
- ✓ **Analytics Module** — QoQ trend line, status breakdown, thrust-area pie, UoM mix, completion heatmap, manager-effectiveness scoreboard
- ✓ **Rule-based Escalations** — configurable thresholds for submit/approve/check-in delays; auto-creates alerts, one-click resolve
- ✓ Cycle configuration (Phase 1 open + Q1–Q4 windows + escalation day-thresholds)
- ✓ Polished light/dark theme with brand gradient and animations
- ✓ One-click role switcher for fast demo evaluation
- ✓ Empty states, optimistic toasts, accessible form errors

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                       Next.js 16 (App Router)                        │
│   ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│   │  Server         │  │  Client          │  │  API Routes        │  │
│   │  Components     │  │  Components      │  │  (Edge/Node)       │  │
│   │  (data fetch)   │  │  (forms/charts)  │  │                    │  │
│   └────────┬────────┘  └────────┬─────────┘  └─────────┬──────────┘  │
│            │                    │                      │             │
│            └────────────┬───────┴──────────────────────┘             │
│                         ▼                                            │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │  Domain layer — src/lib/                                     │   │
│   │  · session (cookie-based, DB-backed)                         │   │
│   │  · validation (Zod schemas + business rules)                 │   │
│   │  · scoring (UoM formulas)                                    │   │
│   │  · audit (write-only log)                                    │   │
│   └──────────────────────────────────────────────────────────────┘   │
│                         ▼                                            │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │  Prisma ORM ──────────► SQLite (dev) / Turso libSQL (prod)   │   │
│   │  · User · Cycle · Goal · CheckIn · CheckInComment            │   │
│   │  · SharedGoal · AuditLog · Escalation · Session              │   │
│   └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                          ▲
              Vercel CDN (static assets) + Serverless Functions
```

**Why this stack:**
- **Next.js 16 App Router** — single deploy, server-first rendering, sub-100ms TTFB
- **Prisma** — type-safe data layer that scales from SQLite (dev) to Postgres/libSQL (prod)
- **Tailwind v4 + shadcn-style primitives** — design tokens drive both themes; no CSS-in-JS overhead
- **Recharts** — declarative SVG charts that look great on both light/dark
- **No NextAuth complexity** — a 60-line cookie session is enough for an internal tool and keeps cost optimisation tight
- **Vercel** — zero-config deploy from GitHub, automatic edge caching, free tier covers a hackathon demo

---

## Local Setup

```bash
# 1. Install
npm install

# 2. Set up the database (SQLite — zero external deps)
npx prisma migrate dev --name init

# 3. Seed demo data (3 roles, 7 employees, 7 thrust areas, FY 2026-27 cycle)
npm run db:seed

# 4. Run
npm run dev
# → open http://localhost:3000
```

### Reset everything
```bash
npm run db:reset   # wipes DB and re-applies migrations
npm run db:seed    # re-seed demo data
```

---

## Deploying to Vercel

```bash
# 1. Push to GitHub
git init && git add -A && git commit -m "GoalQuest" && git remote add origin <your-repo> && git push -u origin main

# 2. Import the repo on Vercel
#    - Framework: Next.js (auto-detected)
#    - Build command: npm run build (default)

# 3. For Vercel + persistent DB, swap SQLite → Turso libSQL (free tier):
#    - Create a Turso DB: https://turso.tech
#    - Add the libSQL Prisma adapter and set DATABASE_URL + TURSO_AUTH_TOKEN env vars
#    - Re-deploy
#
# For a quick demo, you can also deploy with the seeded SQLite file baked in.
```

---

## Key Design Decisions

| Decision                                  | Why                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| Server components by default              | Smaller JS payload, faster page loads, native data-fetching                    |
| Cookie session over JWT/NextAuth          | One round-trip, server-revocable, simpler audit story                          |
| Single Goal table with `parentGoalId`     | Shared/departmental goals reuse the goal pipeline (status, locks, audit)       |
| Score computed on write (not on read)     | Keeps reports cheap; one column per check-in stores the cached value           |
| Escalations as a separate `cron` endpoint | Can be wired to Vercel Cron in one line — no in-process schedulers             |
| Tailwind tokens via CSS vars              | Light/dark + brand colours change in one file; no rebuild                      |

---

## BRD Compliance Matrix

| Requirement                              | Where to see it                              |
| ---------------------------------------- | -------------------------------------------- |
| Goal creation form                       | `/dashboard/goals/new`                       |
| Weightage = 100% enforcement             | `/dashboard/goals` + API `/goals/submit`     |
| Min 10% per goal, max 8                  | `src/lib/validation.ts`                      |
| Manager approval & inline edit           | `/dashboard/team/[id]`                       |
| Lock on approve                          | API `/goals/[id]/approve`                    |
| Shared goals                             | "Push shared goal" button on `/dashboard/team` |
| Quarterly check-ins                      | `/dashboard/checkins`                        |
| Score formulas (4 UoM types)             | `src/lib/scoring.ts`                         |
| Check-in comments                        | `/dashboard/team/[id]` (manager) + `CommentBox` |
| Cycle windows config                     | `/dashboard/cycles` (admin)                  |
| Admin unlock                             | `/dashboard/settings`                        |
| Achievement Report (CSV)                 | `/api/reports/achievement.csv`               |
| Completion Dashboard                     | `/dashboard/reports`                         |
| Audit Trail                              | `/dashboard/audit`                           |
| Analytics + heatmap                      | `/dashboard/analytics`                       |
| Escalations                              | `/dashboard/escalations` + `/api/escalations/run` |

---

## Project structure

```
goalquest/
├── prisma/
│   ├── schema.prisma          # 9-model schema
│   └── seed.ts                # demo data
├── src/
│   ├── app/                   # Next.js routes (server-first)
│   │   ├── dashboard/         # role-aware UI
│   │   └── api/               # mutation endpoints
│   ├── components/
│   │   ├── ui/                # shadcn-style primitives
│   │   └── views/             # role overviews
│   └── lib/                   # db, session, scoring, audit, validation
└── README.md
```

---

Built with care for the **AtomQuest Hackathon 1.0** by Atomberg Technologies.
