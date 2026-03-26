# Kanban Board — Lab Exercise 2

A full-stack, offline-first Kanban board with real-time sync, authentication, and background jobs.

---

## Repository Structure

```
Kanban-Board/
├── frontend/          # Vanilla JS + HTML/CSS client (no frameworks)
├── backend/           # Node.js + Express REST API + WebSocket server
└── README.md          # ← you are here
```

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 or higher |
| PostgreSQL | 14 or higher |
| npm | 9 or higher |

---

### 1 — Clone the repository

```bash
git clone https://github.com/AiraGayle/Kanban-Board.git
cd Kanban-Board
git checkout develop
```

---

### 2 — Set up the backend

```bash
cd backend
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Minimum required values in `.env`:

```
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/kanban_db
JWT_SECRET=replace_with_a_long_random_string
```

Generate a secure `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Create and seed the database:

```bash
psql -U postgres -c "CREATE DATABASE kanban_db;"
psql -U postgres -d kanban_db -f src/db/schema.sql
```

Start the backend:

```bash
npm run dev        # development (nodemon)
npm start          # production
```

The API will be available at `http://localhost:3000`.

---

### 3 — Set up the frontend

The frontend is plain HTML/CSS/JS — no build step required.

Open the `frontend/` folder with a local server. The easiest option is [VS Code Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), which serves the folder at `http://localhost:5500`.

> ⚠️ The frontend uses ES modules (`import`/`export`), so it **must** be opened via a local server — not a `file://` URL.

---

### 4 — Testing offline + online with two laptops

1. **Backend laptop** — run `npm run dev` in `backend/`. Optionally expose it with [ngrok](https://ngrok.com/):
   ```bash
   ngrok http 3000
   ```
   Copy the `https://xxxx.ngrok-free.app` URL.

2. **Frontend laptop** — update `API_BASE` in `frontend/services/AuthService.js` and `frontend/services/StorageService.js` to point to the ngrok URL (or `http://localhost:3000` for local testing).

3. Turn off Wi-Fi on the frontend laptop — the board continues working from `localStorage`.

4. Re-enable Wi-Fi — the offline queue automatically syncs unsynced changes to the backend.

---

## Feature Overview

| Feature | Description |
|---------|-------------|
| **Offline-first** | All task mutations are saved to `localStorage` first. When online, an `OfflineQueue` pushes unsynced changes to the API. Conflict resolution uses last-write-wins via `updated_at`. |
| **Authentication** | JWT-based register/login/logout. Passwords are bcrypt-hashed (12 rounds). All task routes are protected. |
| **REST API** | `POST /auth/register`, `POST /auth/login`, `GET /tasks`, `POST /tasks` (create / update / soft-delete). |
| **Real-time** | Native WebSocket server. Task create/update/delete broadcasts to all tabs/devices of the same user instantly. |
| **Database** | PostgreSQL with `users` and `tasks` tables. Soft-deletion keeps rows for cron cleanup. |
| **Cron job** | Daily cleanup of soft-deleted tasks older than 30 days (`0 0 * * *`). |
| **Rate limiting** | 100 req / 15 min per IP globally; 5 req / 15 min per email on `/auth` routes. |

---

## API Reference

See [`backend/README.md`](./backend/README.md) for full endpoint documentation, request/response examples, and WebSocket details.

---

## Postman Collection

A complete Postman collection is included in the repository:

```
backend/postman/
├── Kanban-Board.postman_collection.json   # All endpoints with example requests & test scripts
└── Kanban-Board.postman_environment.json  # Environment variables (base_url, token, task_id)
```

Import both files into Postman to get started. See [`backend/README.md`](./backend/README.md) for usage instructions.