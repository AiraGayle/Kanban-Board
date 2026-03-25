// Cron Service — STUB
// TODO (Person 5): Implement scheduled background jobs using node-cron.
// Signature expected by server.js:  initCronJobs()
const cron = require('node-cron');
const pool = require('../db/pool');

function initCronJobs() {
    cron.schedule('0 0 * * *', async () => {
        console.log('[Cron] Running soft-delete cleanup...');
        try {
            const result = await pool.query(
                 `DELETE FROM tasks
                 WHERE deleted = TRUE
                   AND updated_at < NOW() - INTERVAL '30 days'`
            );
            console.log(`[Cron] Cleaned up ${result.rowCount} deleted tasks`);
        } catch (err) {
            console.error('[Cron] Cleanup failed:', err.message);
        }
    });
    console.log('Cron jobs initialized');
}

module.exports = { initCronJobs };
