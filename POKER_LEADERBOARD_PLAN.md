# Poker Leaderboard App Plan

## 1. Product Scope

### Entities & Rules
- **Player**
  - name (unique-ish), optional avatar
- **Game**
  - createdAt, date/label, status: OPEN | CLOSED
  - entries per player:
    - boughtChips (total bought during game)
    - leftChips (chips remaining at end; editable until game is closed; admin can still correct later)
- **Stats / Leaderboard**
  - Per player (across all games):
    - totalBought = Σ bought
    - totalLeft = Σ left (or only closed games, depending on preference)
    - profit: left - bought
  - Per game:
    - list of players + bought/left

### Permissions
- **Admin**: CRUD players, CRUD games, edit game entries, close/open game
- **Guest**: view everything read-only
- **Subscribers**: receive emails on “game closed” and/or “game updated”

## 2. Recommended Architecture

### Option A (Recommended): Next.js fullstack on Vercel + MongoDB Atlas
- One repo, one deploy target
- React UI + API routes in the same project
- Easy auth + environment variables
- Hosting notes (free tiers):
  - Vercel Hobby plan (free)
  - MongoDB Atlas M0 free cluster

### Option B: React on Netlify + Node API on Render + MongoDB Atlas
- More moving pieces, but doable
- Netlify and Render have free tiers with limits

## 3. Data Model (MongoDB)

Use 3 collections:

- **players**
  - _id
  - name (string, required, unique index)
  - createdAt
- **games**
  - _id
  - title (e.g., “Friday night #12”)
  - date (optional)
  - status (OPEN|CLOSED)
  - createdAt, closedAt (optional)
- **gameEntries**
  - _id
  - gameId (ref)
  - playerId (ref)
  - boughtChips (number, default 0)
  - leftChips (number, default 0)
  - updatedAt
  - Unique index: (gameId, playerId)

## 4. API Design

### Public (read-only)
- `GET /api/leaderboard` — Returns players aggregated totals
- `GET /api/games` — List games
- `GET /api/games/:id` — Game details + entries list
- `GET /api/players/:id` — Player history across games

### Admin
- `POST /api/admin/login`
- `POST /api/admin/players` / `PATCH` / `DELETE`
- `POST /api/admin/games` / `PATCH` / `DELETE`
- `PUT /api/admin/games/:id/entries` — Bulk update entries
- `POST /api/admin/games/:id/close` — Sets status CLOSED

### Subscribers
- `POST /api/subscribe` (email)
- `POST /api/unsubscribe` (token link)

## 5. Authentication

- One admin account stored in env vars:
  - ADMIN_EMAIL
  - ADMIN_PASSWORD_HASH (bcrypt)
- Login returns a session cookie (httpOnly) with a signed token (JWT or iron-session)
- Middleware protects /admin routes and /api/admin/*
- Guests have no auth and can only hit public endpoints

## 6. UI Plan (React + React Aria)

### Pages
- **Public**
  - / Leaderboard
  - /games Game list
  - /games/[id] Game detail
  - /players/[id] Player detail
  - /subscribe (or modal)
- **Admin**
  - /admin/login
  - /admin dashboard
  - Players manager
  - Games manager
  - /admin/games/[id] (editable grid)

### React Aria Components
- Table/grid: React Aria Table / Grid patterns
- Dialog for confirmations
- Form validation with accessible errors
- Toasts for “Saved”
- Accessibility wins: keyboard navigation, ARIA labeling, focus management

## 7. Email Subscriptions

- Store subscribers: email, verified boolean, unsubscribeToken, createdAt
- Double opt-in recommended
- Sending provider: Resend/SendGrid/Mailgun

## 8. Aggregations (Leaderboard Math)

- Server-side aggregation: gameEntries joined to games
- Group by playerId: sum(boughtChips), sum(leftChips), countDistinct(gameId)
- Sort by profit desc, then totalLeft desc
- Cache options: recompute on demand or store leaderboardSnapshots

## 9. Step-by-Step Build Plan (Milestones)

### Milestone 1 — Skeleton + DB
- Create Next.js app (App Router)
- Add Mongo connection + Mongoose models
- Public pages with mocked data

### Milestone 2 — Admin Auth + CRUD
- Admin login + protected routes
- Players CRUD
- Games CRUD (create/open)

### Milestone 3 — Game Entry Editor
- Admin “game table editor”
- Bulk save endpoint
- Close game action

### Milestone 4 — Public Views
- Leaderboard aggregation endpoint + UI
- Game list + game details
- Player details page

### Milestone 5 — Subscriptions + Emails
- Subscribe + verify + unsubscribe
- Send emails on “game closed”

### Milestone 6 — Polish
- Input validation
- Audit fields
- Export CSV (optional)

## 10. Deployment (Free Deployment Paths)

### Recommended: Vercel + MongoDB Atlas
- Create MongoDB Atlas M0 free cluster
- Put MONGODB_URI in Vercel env vars
- Deploy Next.js to Vercel (connect GitHub/GitLab repo)
- Add env vars: ADMIN_EMAIL, ADMIN_PASSWORD_HASH, EMAIL_PROVIDER_KEY, APP_URL

### Alternative: Netlify + Render + Atlas
- Netlify free plan has fixed monthly limits
- Render free includes 750 instance hours/month

## 11. Repo Structure (Next.js)
- /app (routes/pages)
- /app/admin/* (admin UI)
- /app/api/* (public API)
- /app/api/admin/* (admin API)
- /lib/db.ts (Mongo connect)
- /models/* (Mongoose schemas)
- /lib/auth/* (session helpers)
- /lib/email/* (send + templates)

## 12. Admin Can Edit Any Past Game

- Strict: once CLOSED, entries read-only (except “reopen game” admin action)
- Flexible: allow edits even when CLOSED, but log updatedAt and show “Last corrected on…”
- Recommended: Flexible + audit (timestamps + “edited by admin”)

---

## Minimal DB Schema (Mongoose Models)

### Player
```js
{
  name: { type: String, required: true, unique: true },
  avatar: String,
  createdAt: { type: Date, default: Date.now }
}
```

### Game
```js
{
  title: String,
  date: Date,
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  createdAt: { type: Date, default: Date.now },
  closedAt: Date
}
```

### GameEntry
```js
{
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  boughtChips: { type: Number, default: 0 },
  leftChips: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
}
```

### Subscriber
```js
{
  email: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  unsubscribeToken: String,
  createdAt: { type: Date, default: Date.now }
}
```

---

## API Contract (Endpoints)

### Public
- `GET /api/leaderboard` — aggregated player stats
- `GET /api/games` — list games
- `GET /api/games/:id` — game details
- `GET /api/players/:id` — player history

### Admin
- `POST /api/admin/login` — login
- `POST /api/admin/players` — add player
- `PATCH /api/admin/players/:id` — edit player
- `DELETE /api/admin/players/:id` — delete player
- `POST /api/admin/games` — add game
- `PATCH /api/admin/games/:id` — edit game
- `DELETE /api/admin/games/:id` — delete game
- `PUT /api/admin/games/:id/entries` — bulk update entries
- `POST /api/admin/games/:id/close` — close game

### Subscribers
- `POST /api/subscribe` — subscribe
- `POST /api/unsubscribe` — unsubscribe

---

## Deployment Steps (Vercel + MongoDB Atlas)
1. Create MongoDB Atlas M0 cluster, get connection URI.
2. Deploy Next.js app to Vercel, connect repo.
3. Set env vars: MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, EMAIL_PROVIDER_KEY, APP_URL.
4. Test app, verify admin login, CRUD, public views, email flow.

---

## Next Steps
- Use this plan as a reference for development and onboarding.
- Create GitHub issues from milestones for task tracking (optional).
- Start with project scaffolding and DB setup.
