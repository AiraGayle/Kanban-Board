const QUEUE_KEY = 'kanban_offline_queue';

export const OfflineQueue = {
    getAll() {
        try {
            return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        } catch { return []; }
    },

    add(task) {
        const queue = this.getAll();

        const filtered = queue.filter(t => t.id !== task.id);
        filtered.push({ ...task, queuedAt: new Date().toISOString() });
        localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
        console.log('[Offline] Queued task:', task.id);
    },

    remove(taskId) {
        const queue = this.getAll().filter(t => t.id !== taskId);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    },

    clear() {
        localStorage.removeItem(QUEUE_KEY);
    },

    isEmpty() {
        return this.getAll().length === 0;
    }
};

