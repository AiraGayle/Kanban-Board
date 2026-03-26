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