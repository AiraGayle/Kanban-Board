-- ============================================================
-- Kanban Board — Database Schema
-- Run once: psql -d kanban_db -f src/db/schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id          UUID PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    note        TEXT DEFAULT '',
    column_name      VARCHAR(50) NOT NULL,
    priority    VARCHAR(20) DEFAULT 'Low',
    task_order  INTEGER DEFAULT 0,
    deleted     BOOLEAN DEFAULT FALSE,
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id    ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted    ON tasks(deleted);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);
