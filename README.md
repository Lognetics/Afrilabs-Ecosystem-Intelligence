# Afrilabs Ecosystem OS

**Africa's Innovation Command Center** — a multi-department CRM + Ecosystem Intelligence Platform connecting partnerships, programs, funding, member hubs, events, communications and internal operations.

> Note: this is a **clean-room implementation** modeled on Afrilabs' public mission and the requirements in the PRD. It is not a copy of any proprietary codebase.

---

## Stack

- **Next.js 14** (App Router, server actions)
- **TypeScript** strict
- **Tailwind CSS** with custom Afrilabs-inspired palette (deep green + accent orange)
- **Prisma 5** with **SQLite** for dev (swap `provider = "postgresql"` for production — schema is portable)
- **NextAuth** with credentials provider
- **Recharts** ready, **lucide-react** icons
- **bcryptjs** for password hashing

---

## Quick start

```bash
npm install
npm run setup     # prisma db push + seed
npm run dev       # http://localhost:3000
```

Demo logins (also shown on the login page — click to autofill):

| Role               | Email                            | Password   |
|--------------------|----------------------------------|------------|
| Super Admin        | admin@afrilabs.test              | admin1234  |
| Office of COO      | coo@afrilabs.test                | coo1234    |
| Office of ED       | ed@afrilabs.test                 | ed1234     |
| Partnerships Lead  | partnerships@afrilabs.test       | p1234      |
| Programs Lead      | programs@afrilabs.test           | pr1234     |
| Member Services    | members@afrilabs.test            | m1234      |
| Events (AAG)       | events@afrilabs.test             | e1234      |

---

## System architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  Marketing site /  +  /login                                         │
└─────────────────────────────┬────────────────────────────────────────┘
                              │ NextAuth credentials
        ┌─────────────────────┴────────────────────┐
        │   App shell (sidebar + topbar)           │
        │                                          │
        │   /dashboard          (cross-org view)    │
        │   /partnerships       Partnerships CRM    │
        │   /programs           Programs OS         │
        │   /funding            Funding ledger      │
        │   /members            Hubs + payments     │
        │   /events             Event lifecycle     │
        │   /collaboration      Unified activity    │
        │   /campaigns          Ad/comms engine     │
        │   /intelligence       AI recommendations  │
        │   /africonnect        Integration layer   │
        │   /audit              Audit log           │
        │   /jobs               Jobs board          │
        │   /departments/*      12 dept dashboards  │
        │   /admin/users        User management     │
        └─────────────────┬────────────────────────┘
                          │
                ┌─────────┴──────────┐
                │  /api/*  REST + sync │
                └─────────┬──────────┘
                          │
                  ┌───────┴────────┐
                  │   Prisma ORM    │
                  └───────┬────────┘
                          │
                  ┌───────┴────────┐
                  │ SQLite / Postgres │
                  └────────────────┘
```

---

## Data model (high level)

| Entity              | Key relations |
|---------------------|---------------|
| `User`              | role, department |
| `Partner`           | → contacts, partnerships, fundingSources |
| `Partnership`       | → partner, owner, programs (M:N), funding (M:N), events |
| `Program`           | → partners (M:N), fundingSources, events, hubs (M:N), startups (M:N), metrics |
| `FundingSource`     | type=GRANT/INVESTMENT/SPONSORSHIP, status=PLEDGED→DISBURSED, → partner, program |
| `Hub`               | tier, status, engagementScore, africonnectId, → payments, programs |
| `HubPayment`        | status=PAID/PENDING/OVERDUE/EXPIRED, period dates |
| `Event`             | status=PLANNING→COMPLETED, → program, tasks, partners, hubs |
| `Task`              | dept, priority, → event, assignee |
| `Campaign`          | channel, audience filter, → recipients/opens/clicks |
| `Activity`          | unified feed across the system |
| `Message`           | per-partnership/program/event thread |
| `Booking`, `Job`    | procurement & jobs board |
| `AuditLog`          | immutable trail |
| `AfriconnectSyncLog`| integration history |

See `prisma/schema.prisma` for the full schema.

---

## Role-based access

`src/lib/rbac.ts` defines capabilities per role. Roles: `SUPER_ADMIN`, `COO`, `ED`, `DEPT_HEAD`, `STAFF`, `PARTNER`, `HUB_ADMIN`. Pages can call `can(session.user.role, "edit:partnerships")` to gate writes.

---

## Key workflows

### Partnership → Program flow
1. Partnerships team logs a contact → `Partnership` row in `PROSPECT`.
2. They link it to a `Program` via `PartnershipProgram`.
3. An `Activity` of type `PARTNERSHIP_CREATED` is emitted — appears on the Programs team feed.
4. The program detail page surfaces *suggested partners* (rule-based AI in `src/lib/intelligence.ts`).

### Hub payment → segmentation flow
1. Member Services records a payment via `/members/[id]`.
2. `getHubSegments()` in `src/lib/segmentation.ts` recomputes paid/pending/expired buckets.
3. Campaigns can target `PAID_HUBS`, `REGION:West Africa`, `TIER:PREMIUM`, etc.

### Event planning → execution flow
1. Event is created in `PLANNING`.
2. Tasks are added per department (PROCUREMENT travel, COMMS press, EVENTS venue, …).
3. Status moves `PROMOTION → EXECUTION → POST_EVENT → COMPLETED`.
4. Attendance metrics are tracked; activities flow back to the unified feed.

---

## Africonnect integration

The PRD names three sync endpoints — they exist:

| Method | Path                       | Purpose |
|--------|----------------------------|---------|
| GET    | `/api/sync/hubs`           | Hubs with shared profile fields |
| POST   | `/api/sync/hubs`           | Upsert hubs from Africonnect (matches `africonnectId`) |
| GET    | `/api/sync/programs`       | Active programs + cohort hubs |
| GET    | `/api/sync/activities`     | Recent ecosystem activity (paginated via `?since=&limit=`) |

Auth: `Authorization: Bearer $AFRICONNECT_API_KEY` (configured via env var).

```bash
curl http://localhost:3000/api/sync/hubs \
  -H "Authorization: Bearer $AFRICONNECT_API_KEY"
```

Every sync writes a row to `AfriconnectSyncLog`, surfaced on the **/africonnect** and **/departments/tech** pages.

---

## Decision intelligence

`src/lib/intelligence.ts` exposes four functions used by the **/intelligence** page and the `/api/intelligence` endpoint:

- `computeHubPriorities(limit)` — which hubs to engage first (tier + engagement + payment recency)
- `computeChurnRisk(threshold)` — hubs likely to lapse (overdue payments, low engagement, time since last payment)
- `suggestPartnerProgramMatches(limit)` — rule-based fit score using region, sector, partner type ↔ program type
- `predictFundingSuccess()` — likelihood score for pledged/approved funding

These are **rule-based today** with stable interfaces — swap them for ML or Claude API calls in `intelligence.ts` without touching the UI.

---

## Departmental dashboards

12 role-based views under `/departments/*`:

`coo`, `ed`, `tech`, `programs`, `partnerships`, `events`, `members`, `procurement`, `comms`, `finance`, `audit`, `hr`.

Each one re-queries Prisma against the same models, scoped to that team's KPIs.

---

## REST API surface

| Path                       | Methods   |
|----------------------------|-----------|
| `/api/partnerships`        | GET, POST |
| `/api/programs`            | GET, POST |
| `/api/funding`             | GET, POST |
| `/api/hubs`                | GET, POST |
| `/api/events`              | GET, POST |
| `/api/campaigns`           | GET, POST |
| `/api/intelligence`        | GET       |
| `/api/sync/hubs`           | GET, POST |
| `/api/sync/programs`       | GET       |
| `/api/sync/activities`     | GET       |
| `/api/auth/[...nextauth]`  | NextAuth  |

---

## Switching to Postgres

1. In `prisma/schema.prisma`, change `provider = "sqlite"` → `provider = "postgresql"`.
2. Set `DATABASE_URL="postgresql://..."` in `.env`.
3. Run `npx prisma migrate dev --name init`.
4. `npm run db:seed`.

The schema uses no SQLite-only features.

---

## Project layout

```
prisma/
  schema.prisma
  seed.ts
src/
  app/
    layout.tsx, page.tsx, globals.css, providers.tsx
    login/page.tsx
    dashboard/page.tsx
    partnerships/{page,new/page,[id]/page}.tsx
    programs/{page,new/page,[id]/page}.tsx
    funding/page.tsx
    members/{page,[id]/page}.tsx
    events/{page,[id]/page}.tsx
    collaboration/page.tsx
    campaigns/{page,new/page}.tsx
    intelligence/page.tsx
    jobs/page.tsx
    audit/page.tsx
    africonnect/page.tsx
    departments/{coo,ed,tech,programs,partnerships,events,members,
                 procurement,comms,finance,audit,hr}/page.tsx
    admin/users/page.tsx
    api/
      auth/[...nextauth]/route.ts
      sync/{hubs,programs,activities}/route.ts
      {partnerships,programs,funding,hubs,events,campaigns,intelligence}/route.ts
  components/
    layout/{Shell,Sidebar,Topbar}.tsx
    ui/{Button,Card,Badge,Input,Empty}.tsx
  lib/
    prisma.ts, auth.ts, rbac.ts, utils.ts,
    intelligence.ts, segmentation.ts, sync-auth.ts
  types/
    next-auth.d.ts
```

---

## What's intentionally minimal (and easy to extend)

- **Email delivery** — campaigns are persisted with status/recipients but `SENT` doesn't actually call SMTP. Wire up Resend/SendGrid in `/api/campaigns` POST.
- **Real-time** — collaboration feed is server-rendered; pair with Pusher / Ably / Server-Sent Events for live updates.
- **File uploads** (logos, contracts) — schema fields exist (`logoUrl`); plug in S3/UploadThing.
- **ML intelligence** — heuristics today, identical interfaces ready for an LLM-backed implementation.
- **Multi-tenancy** — single-org assumed; add an `organizationId` column on top-level entities to support white-labelling.

---

## License

Proprietary — Afrilabs.
