# Kanban Board — Backend

Node.js + Express REST API with PostgreSQL, JWT authentication, WebSockets, and background cron jobs.

---

## Folder Structure

```
backend/
├── .env.example
├── package.json
└── src/
    ├── server.js                    # HTTP server, WebSocket init, cron init
    ├── app.js                       # Express app, middleware, route registration
    ├── db/
    │   ├── pool.js                  # PostgreSQL connection pool (pg)
    │   └── schema.sql               # CREATE TABLE statements — run once
    ├── middleware/
    │   ├── auth-middleware.js       # JWT verification, attaches req.user
    │   └── rate-limiter.js          # IP limiter (global) + email limiter (auth)
    ├── routes/
    │   ├── auth-routes.js           # POST /auth/register, POST /auth/login
    │   └── task-routes.js           # GET /tasks, POST /tasks
    └── services/
        ├── auth-service.js          # bcrypt hashing, JWT generation
        ├── ws-service.js            # Native WebSocket server, broadcastToUser()
        └── cron-service.js          # node-cron scheduled cleanup job
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database

```bash
psql -U postgres -c "CREATE DATABASE kanban_db;"
psql -U postgres -d kanban_db -f src/db/schema.sql
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/kanban_db
JWT_SECRET=replace_with_long_random_string
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
FRONTEND_ORIGIN=http://localhost:5500
```

Generate a secure `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Start the server

```bash
npm run dev      # development — auto-restarts on file changes (nodemon)
npm start        # production
```

Server starts on `http://localhost:3000` (or `PORT` from `.env`).

---

## Database Schema

### `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PK | Auto-increment |
| `email` | VARCHAR(255) UNIQUE | Required |
| `password_hash` | VARCHAR(255) | bcrypt, 12 rounds |
| `created_at` | TIMESTAMPTZ | Default `NOW()` |

### `tasks`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Generated client-side via `crypto.randomUUID()` |
| `user_id` | INTEGER FK → users | Cascade delete |
| `title` | VARCHAR(255) | Required |
| `note` | TEXT | Optional |
| `column_name` | VARCHAR(50) | `to-do` / `doing` / `done` |
| `priority` | VARCHAR(20) | `Low` / `Medium` / `High` |
| `task_order` | INTEGER | Sort order within column |
| `deleted` | BOOLEAN | Soft-delete flag |
| `updated_at` | TIMESTAMPTZ | Used for conflict resolution |
| `created_at` | TIMESTAMPTZ | Default `NOW()` |

---

## REST API Reference

### Authentication

All task routes require the header:

```
Authorization: Bearer <jwt_token>
```

---

### `POST /auth/register`

Register a new user.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Validation:**
- `email` — required, valid email format
- `password` — required, minimum 8 characters

**Response `201`:**
```json
{
  "user": { "id": 1, "email": "user@example.com" },
  "token": "<jwt>"
}
```

**Error responses:**

| Status | Message |
|--------|---------|
| 400 | `Email and password are required` |
| 400 | `Invalid email format` |
| 400 | `Password must be at least 8 characters` |
| 400 | `Email already in use` |
| 500 | `Internal server error` |

---

### `POST /auth/login`

Login with an existing account.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response `200`:**
```json
{
  "user": { "id": 1, "email": "user@example.com" },
  "token": "<jwt>"
}
```

**Error responses:**

| Status | Message |
|--------|---------|
| 400 | `Email and password are required` |
| 400 | `Invalid email or password` |

> Rate limited to **5 requests per 15 minutes** per email address.

---

### `GET /tasks`

Returns all non-deleted tasks for the authenticated user, ordered by `column_name` then `task_order`.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Build the API",
      "note": "Use Express + pg",
      "column_name": "doing",
      "priority": "High",
      "task_order": 0,
      "deleted": false,
      "updated_at": "2026-03-14T10:00:00.000Z",
      "created_at": "2026-03-14T09:00:00.000Z"
    }
  ]
}
```

---

### `POST /tasks`

Handles **create**, **update**, and **soft-delete** in a single endpoint.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request body:**
```json
{
  "id":          "550e8400-e29b-41d4-a716-446655440000",
  "title":       "Build the API",
  "note":        "Use Express + pg",
  "column_name": "to-do",
  "priority":    "High",
  "task_order":  0,
  "deleted":     false,
  "updated_at":  "2026-03-14T10:00:00.000Z"
}
```

To **soft-delete** a task, send the same body with `"deleted": true`. The row is kept in the database and cleaned up by the nightly cron job after 30 days.

**Conflict resolution (offline-first):**
Uses `ON CONFLICT (id) DO UPDATE ... WHERE tasks.updated_at <= EXCLUDED.updated_at`.
If the server already has a **newer** copy (another device synced first), the update is skipped and the server's current version is returned so the client can reconcile.

**Response `200`:**
```json
{ "task": { ...saved task row... } }
```

**Error responses:**

| Status | Message |
|--------|---------|
| 400 | `Task id is required` |
| 400 | `Task title is required` |
| 401 | `Missing or invalid authorization header` |
| 401 | `Invalid or expired token` |
| 500 | `Failed to save task` |

---

### `GET /health`

Quick health check — no auth required.

**Response `200`:**
```json
{ "status": "ok" }
```

---

## WebSocket API

Connect to the WebSocket server by appending the JWT as a query parameter:

```
ws://localhost:3000?token=<jwt_token>
```

The server authenticates the token on connection. Invalid tokens are immediately closed with code `4001`.

### Server → Client messages

All messages are JSON strings:

```json
{ "type": "TASK_UPDATED", "payload": { ...task row... } }
{ "type": "TASK_DELETED", "payload": { ...task row... } }
```

Messages are scoped to the authenticated user — other users' updates are never sent.

A heartbeat ping is sent every 30 seconds. Connections that do not respond with a pong are terminated.

---

## Rate Limiting

| Limiter | Scope | Window | Max Requests |
|---------|-------|--------|-------------|
| `ipLimiter` | All routes | 15 minutes | 100 per IP |
| `authLimiter` | `/auth/*` only | 15 minutes | 5 per email (falls back to IP) |

---

## Cron Jobs

Jobs are initialized when the server starts via `initCronJobs()`.

| Schedule | Job | Description |
|----------|-----|-------------|
| `0 0 * * *` (midnight daily) | Soft-delete cleanup | Permanently deletes tasks where `deleted = TRUE` and `updated_at < NOW() - 30 days` |

---

## Postman Collection

A ready-to-import Postman collection and environment are in the `postman/` directory:

```
backend/postman/
├── Kanban-Board.postman_collection.json
└── Kanban-Board.postman_environment.json
```

### How to import

1. Open Postman → **Import** (top-left)
2. Drag and drop both JSON files (or click **Upload Files** and select them)
3. Select the **Kanban Board - Local** environment from the environment dropdown (top-right)
4. Run requests in order: **Register → Login → Tasks**

The Login request automatically saves the returned JWT to the `token` environment variable so all subsequent requests are pre-authorized.

### Running automated tests

Install Newman (Postman's CLI runner):

```bash
npm install -g newman
```

Run the full test suite:

```bash
newman run postman/Kanban-Board.postman_collection.json \
  --environment postman/Kanban-Board.postman_environment.json
```

Each request includes test scripts that assert status codes, response shapes, and business rules (auth validation, conflict resolution, soft-delete, etc.).