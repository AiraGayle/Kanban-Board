# Kanban Backend 

This is the backend folder structure for Lab Exercise 2.
Stubs are left in place for teammates to fill in.

---

## Folder Structure

```
backend/
├── package.json
├── .env.example
└── src/
    ├── server.js                        ✅ 
    ├── app.js                           ✅ 
    ├── db/
    │   ├── schema.sql                   ✅ 
    │   └── pool.js                      ✅ 
    ├── routes/
    │   ├── task-routes.js               ✅ 
    │   └── auth-routes.js               🔲 STUB → Person 1
    ├── middleware/
    │   └── auth-middleware.js           🔲 STUB → Person 1
    ├── services/
    │   ├── ws-service.js                🔲 STUB → Person 4
    │   └── cron-service.js              🔲 STUB → Person 5
    └── utils/
        └── (jwt-utils.js → Person 1)
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
Edit `.env` — at minimum fill in `DATABASE_URL`.

### 4. Run the server
```bash
npm run dev
```

The server starts on `http://localhost:3000`.

---

## Task API (you can use Postman)

### `GET /tasks`
Returns all non-deleted tasks for the authenticated user.

**Headers:** `Authorization: Bearer <token>` *(stub accepts any request for now)*

**Response:**
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Build the API",
      "note": "Use Express",
      "column": "doing",
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
Handles **create**, **update**, and **soft-delete** in one endpoint.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
  "id":         "550e8400-e29b-41d4-a716-446655440000",
  "title":      "Build the API",
  "note":       "Use Express + pg",
  "column":     "to-do",
  "priority":   "High",
  "task_order": 0,
  "deleted":    false,
  "updated_at": "2026-03-14T10:00:00.000Z"
}
```

To **soft-delete**, send the same body with `"deleted": true`.

**Conflict resolution:** Last-write-wins. The `ON CONFLICT` clause compares `updated_at`
timestamps — if the server already has a newer copy (another client synced first),
the server's version is returned unchanged so the caller can reconcile.

**Response:**
```json
{ "task": { ...saved task row... } }
```

---

## Notes for Teammates

### Person 1 (Auth)
Replace `src/middleware/auth-middleware.js` with real JWT verification.
It must attach `req.user = { userId, email }` and call `next()` on success, or return 401.
Also implement `src/routes/auth-routes.js` and add `src/utils/jwt-utils.js`.

### Person 3 (Offline Sync)
The `POST /tasks` endpoint is ready. You just need to call it from the frontend
for each unsynced task. The `updated_at` field is what drives conflict resolution.

### Person 4 (WebSockets)
Replace `src/services/ws-service.js`. Export:
- `initWebSocketServer(httpServer)` — called once in `server.js`
- `broadcastToUser(userId, payload)` — called in `task-routes.js` after each successful upsert

The task route already has the `broadcastToUser` call wired in — just uncomment it once
Person 4 delivers the real service.

### Person 5 (Cron + Postman)
Replace `src/services/cron-service.js`. Export:
- `initCronJobs()` — called once in `server.js`

