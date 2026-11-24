# Vanguard Institute Portal

**AI-powered College Administration Portal** for *Vanguard Institute of Technology, Pune* — AY 2026-27.

A desktop-first, minimalist SaaS workspace (ChatGPT-inspired: whitespace, tonal surfaces, 1px hairlines, no heavy shadows) with a dual-mode theme, 15 fully interactive modules, and a signature **Agentic Workflow Orchestrator** with human-in-the-loop approvals.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173  (binds 0.0.0.0 for previews)
npm run build      # type-check + production bundle
npm run preview    # serve the production build on :4173
npm run verify     # typecheck → smoke → interaction sweep → build
```

Requires Node 20+. No backend is needed to explore the portal — data lives in a swappable client repository (see **Backend** below) and persists in `localStorage` between reloads. Use **Admin Settings → Data & backend → Reset demo data** to return to seed state.

---

## What is inside

| # | Module | Highlights |
|---|--------|-----------|
| 1 | Dashboard | 6 quick actions, 8 KPIs, 6 charts (enrollment line, department bars, attendance gauge, CGPA histogram, scholarship 4-state, grievance SLA), approval + grievance feeds, activity + pinned notices, live widget customiser |
| 2 | Student Records | Search + department/semester/fee filters, pagination, row selection & bulk export, CSV import with validation/preview, Add Student modal, tabbed profile (Overview & Guardian · Attendance & Academics · Fees, Scholarship & DigiLocker KYC) |
| 3 | Faculty Management | 4 KPIs, workload visualisation, directory with `>20 h` warning badges, expandable teaching allocation, multi-subject Add Faculty modal |
| 4 | Timetable Management | Department/semester/division selectors, conflict detection with error-container banner, Mon–Fri slot grid with clash highlighting, room utilisation, faculty allocation, publish flow |
| 5 | Assignment Management | 3 KPIs, submission velocity chart, status badges (Due Soon / Overdue / Graded), Create Assignment modal |
| 6 | Scholarship Tracker | 4 scheme cards, mandatory AI disclosure banner, nodal-gated applications table with 4 states, review + approval checklist modal |
| 7 | Fees & Submissions | 4 financial KPIs (₹18.42 Cr demand · ₹15.18 Cr collected · ₹3.24 Cr pending · ₹2.48 Cr waivers), fee structure builder with quota categories, searchable payment ledger, Record Payment (UPI/NEFT/Card/DD + UTR) and a printable **official receipt** with amount-in-words |
| 8 | Grievance Management | Category/status/SLA filters, breach indicators, confidential ICC lock (restricted to ICC + Super Admin), triage modal |
| 9 | Student Support | Helpdesk KPIs, ticket queue (Ready / In Review / Assigned), ticket detail with assignment |
| 10 | E-Library | Resource card grid (textbooks, lecture notes, IEEE journals), bookmarks, live download counts, upload flow |
| 11 | Examination Management | `Audit Protected` badge, passphrase-gated `Publish Results`, 28-paper schedule, verification progress |
| 12 | Notices & Announcements | Pinned/active grid, 6 categories incl. Emergency Announcements, compose + pin/withdraw, resend |
| 13 | Course Information | NEP-2020 curriculum table, credit distribution, Add Course |
| 14 | **Agentic Workflow** | 8/4 split orchestrator + audit sidebar, 6 agents, suggested prompts, 4-step execution timeline, structured draft preview, `Copy Report Data` / `Reject` / `Approve & Execute`, timestamped audit entries |
| 15 | Admin Settings | Profile, 2FA badge, security controls, session devices, RBAC matrix (4 roles × 14 modules + AI approval rights), appearance switcher, design tokens, shortcuts, backend panel |

Plus a **Global Search** command palette (`Ctrl/⌘ + K`) indexing modules, quick actions, students, faculty, courses and notices.

---

## Design system

| Token | Light | Dark |
|---|---|---|
| Surface | `#FFFFFF` | `#171717` |
| Surface low / container / high | `#F9FAFB` / `#F3F4F6` / `#EAECEF` | `#1E1E1E` / `#212121` / `#2A2A2A` |
| Text / secondary | `#1B1B24` / `#4B5563` | `#ECECEC` / `#A1A1AA` |
| Border (`outline-variant`) | `#E5E7EB` | `#2E2E32` |
| Primary / container / tint | `#3525CD` / `#4F46E5` / `#EEF2FF` (`#312E81` text) | `#C3C0FF` (`#1D00A5` text) / — / `#23204A` (`#E0E7FF` text) |
| Success · Warning · Info · Error | `#15803D`·`#DCFCE7` / `#B45309`·`#FEF3C7` / `#1D4ED8`·`#DBEAFE` / `#BA1A1A`·`#FFDAD6` | lightly inverted for AA |

* **Type** — Mulish 600/700 (`font-display`) for titles & KPI figures; Instrument Sans 400–700 (`font-sans`) for UI/body/tables; Source Code Pro 500 (`font-mono`) for roll numbers, course codes, receipts, UTRs, timestamps. Fonts are self-hosted via Fontsource (works offline).
* **Numbers** — `tabular-nums` on every metric, money value and table column; currency via `en-IN` grouping (`₹1,64,500`, `₹18.42 Cr`); dates as `DD MMM YYYY`.
* **Motion** — 120 ms for hover/state, 150–200 ms for surfaces/modals, with a `prefers-reduced-motion` escape hatch.
* **Layout** — 256 px / 72 px collapsible sidebar, 56 px sticky header, `max-w-[1440px]` workspace, hairline borders instead of shadows.

Theme is applied via a class on `<html>`, persisted in `localStorage`, and pre-applied in `index.html` to avoid a flash.

---

## Architecture

```
src/
├─ App.tsx                 hash router, global shortcuts, lazy routes, shell
├─ components/
│  ├─ layout/              Sidebar, Header, CommandPalette, Toaster, nav model
│  ├─ ui/                  Button, Badge, Modal (focus-trap/ESC stack), Tabs, Table, Form primitives
│  └─ charts/              dependency-free SVG line/area, gauge, histogram, bar list, sparkline
├─ pages/                  one file per module (lazy-loaded)
├─ store/AppStore.tsx      single source of truth, toasts, audit trail, workflows
├─ lib/                    formatters, hooks (hash route, debounce, clipboard), BaaS seam, workflow engine
├─ data/                   departments + realistic Indian seed data
└─ types.ts                domain model
```

**Interaction details worth knowing**

* Modals use a stack: `Escape` closes only the top-most dialog, focus is trapped, background scroll is locked and focus returns to the trigger.
* `?new=1` deep links (`/students?new=1`, `/fees?tab=submissions&new=1`, …) open the matching modal — used by quick actions and the palette.
* Every CRUD/approval action raises a toast (bottom-right) and appends to the audit trail; AI approvals also write a timestamped audit entry.
* The router is hash-based, so the production build can be hosted on any static host with no rewrite rules.

**Keyboard shortcuts** — `Ctrl/⌘ K` global search · `Ctrl/⌘ B` collapse sidebar · `Ctrl/⌘ J` theme · `Ctrl/⌘ N` new student · `/` search · `Esc` close · `Enter` run orchestrator.

---

## Backend (bring your own BaaS)

The UI never touches storage directly. `src/lib/baas.ts` defines a tiny repository contract:

```ts
interface Driver {
  list<T>(collection: Collection): Promise<T[] | null>;
  replace<T>(collection: Collection, rows: T[]): Promise<void>;
  clear(collection: Collection): Promise<void>;
}
```

* **Today** — `localDriver` persists 15 collections (`students`, `faculty`, `assignments`, `scholarships`, `fee_structures`, `payments`, `grievances`, `tickets`, `resources`, `exams`, `notices`, `courses`, `workflows`, `audit_log`) in `localStorage`.
* **Tomorrow** — implement the HTTP driver in `resolveDriver()` for your BaaS and set:

```bash
VITE_BAAS_DRIVER=appwrite   # appwrite | pocketbase | supabase | local
VITE_BAAS_URL=https://your-baas.example.com
VITE_BAAS_PROJECT=vanguard
```

`src/lib/baas.ts` includes a PocketBase-style example and notes for Appwrite/Supabase collection mapping. Because `useCollection()` is the only binding, no page or component changes.

Suggested server-side guardrails to mirror the UI: RBAC scopes per role, ICC case isolation, immutable audit log (append-only), and human-in-the-loop enforcement before any AI-initiated write.

---

## Verification

This repo ships two headless suites (no browser required):

```bash
npm run smoke   # SSR-renders all 15 pages, hydrates the app in jsdom, checks theme persistence,
                # Ctrl+K palette, sidebar collapse, add-student flow, orchestrator + approval, formatting
npm run sweep   # drives every module's modals, filters and actions (customise, CSV import, conflicts,
                # scholarships, payments/receipt, exams sign-off, notices, courses, workflow reject, settings)
```

Both are wired into `npm run verify`.
