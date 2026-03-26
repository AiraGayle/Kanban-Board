// Task Routes — GET /tasks, POST /tasks (create / update / soft-delete)
const express        = require('express');
const pool           = require('../db/pool');
const authMiddleware = require('../middleware/auth-middleware');
const { broadcastToUser } = require('../services/ws-service');
const router = express.Router();

router.use(authMiddleware);

// ─── GET /tasks ─────────────────────────────────────────────────────────────
// Returns all non-deleted tasks belonging to the authenticated user,
// ordered by column_name then task_order so the frontend can render immediately.
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, note, column_name, priority, task_order,
                    deleted, updated_at, created_at
             FROM   tasks
             WHERE  user_id = $1
               AND  deleted = FALSE
             ORDER  BY column_name, task_order`,
            [req.user.userId]
        );

        res.json({ tasks: result.rows });
    } catch (err) {
        console.error('GET /tasks error:', err.message, err.stack);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// ─── POST /tasks ─────────────────────────────────────────────────────────────
// Handles create, update, AND soft-delete in one endpoint.
//
// Body shape:
//   { id, title, note, column_name, priority, task_order, deleted, updated_at }
//
// Soft delete: pass deleted: true — the row stays in the DB for cron cleanup.
router.post('/', async (req, res) => {
    const { id, title, note, column_name, priority, task_order, deleted, updated_at } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'Task id is required' });
    }

    const isDelete = deleted === true;

    if (!isDelete && !title?.trim()) {
        return res.status(400).json({ error: 'Task title is required' });
    }

    try {
        const upsertResult = await pool.query(
            `INSERT INTO tasks
               (id, user_id, title, note, column_name, priority, task_order, deleted, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE
               SET title      = EXCLUDED.title,
                   note       = EXCLUDED.note,
                   column_name     = EXCLUDED.column_name,
                   priority   = EXCLUDED.priority,
                   task_order = EXCLUDED.task_order,
                   deleted    = EXCLUDED.deleted,
                   updated_at = EXCLUDED.updated_at
               WHERE tasks.updated_at  <= EXCLUDED.updated_at
                 AND tasks.user_id      = $2
             RETURNING *`,
            [
                id,
                req.user.userId,
                title      ?? '',
                note       ?? '',
                column_name     ?? 'to-do',
                priority   ?? 'Low',
                task_order ?? 0,
                isDelete,
                updated_at ?? new Date().toISOString(),
            ]
        );

        // If ON CONFLICT guard blocked the update (server copy was newer),
        // RETURNING returns nothing — fetch the current server version instead.
        const task = upsertResult.rows[0] ?? await fetchTaskById(id, req.user.userId);

        if (task) {
            broadcastToUser(req.user.userId, {
                type:    isDelete ? 'TASK_DELETED' : 'TASK_UPDATED',
                payload: task,
            });
        }

        res.json({ task });
    } catch (err) {
        console.error('POST /tasks error:', err.message, err.stack);
        res.status(500).json({ error: 'Failed to save task' });
    }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchTaskById(id, userId) {
    const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
        [id, userId]
    );
    return result.rows[0] ?? null;
}

module.exports = router;
