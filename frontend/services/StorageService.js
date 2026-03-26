// Storage Service — persists tasks via the backend API (replaces localStorage)
import { getHeaders } from './AuthService.js';
import { OfflineQueue } from './OfflineQueue.js';

const API_BASE = 'http://localhost:3000';

let _syncing = false;

/** Map frontend task shape → API body shape */
function toApi(task, { deleted = false } = {}) {
    return {
        id:          task.id,
        title:       task.title,
        note:        task.note ?? '',
        column_name: task.column,
        priority:    task.priority ?? 'Low',
        task_order:  task.order ?? 0,
        deleted,
        updated_at:  new Date().toISOString(),
    };
}

/** Map API response shape → frontend task shape */
export function fromApi(task) {
    return {
        id:       task.id,
        title:    task.title,
        note:     task.note,
        column:   task.column_name,
        priority: task.priority,
        order:    task.task_order,
    };
}

export class StorageService {
    /** Fetch all tasks for the authenticated user from the DB */
    async load() {
        const res = await fetch(`${API_BASE}/tasks`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const { tasks } = await res.json();
        return tasks.map(fromApi);
    }

    async _post(body) {
        const res = await fetch(`${API_BASE}/tasks`, {
            method:  'POST',
            headers: getHeaders(),
            body:    JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to save task');
        return res;
    }

    /** Upsert a single task to the DB */
    async saveTask(task) {
        const body = toApi(task);
        
        if (!navigator.onLine) {
            OfflineQueue.add(body);
            console.log('[Offline] Delete queued:', task.id);
            return;
        }
        try {
            const res = await this._post(body);
            const { task: saved } = await res.json();
            return fromApi(saved);
        } catch (err) {
            OfflineQueue.add(body);
            console.log('[Offline] Saved to queue:', task.id);
            return task;
        }
    }

    /** Upsert multiple tasks concurrently (e.g. after a reorder) */
    async saveTasks(tasks) {
        await Promise.all(tasks.map(t => this.saveTask(t)));
    }

    /** Soft-delete a task in the DB */
    async deleteTask(task) {
        const body = toApi(task, { deleted: true }); 
        if (!navigator.onLine) {
            OfflineQueue.add(body);
            console.log('[Offline] Delete queued:', task.id);
            return;
        }
        try {
            await this._post(body);
        } catch (err) {
            OfflineQueue.add(body);
            console.log('[Offline] Network error, delete queued:', task.id);
        }
    }

    async syncQueue() {
        if (_syncing) return;
        _syncing = true;

        const queue = OfflineQueue.getAll();
        if (queue.length === 0) { _syncing = false; return; }

        console.log(`[Sync] Syncing ${queue.length} queued tasks...`);

        for (const task of queue) {
            try {
                await this._post(task);
                OfflineQueue.remove(task.id);
                console.log('[Sync] Synced:', task.id);
            } catch (err) {
                if (err.message.startsWith('Server error')) {
                    console.warn('[Sync] Server rejected, skipping:', task.id);
                } else {
                    console.warn('[Sync] Still offline, stopping sync');
                    break;
                }
            }
        }
        _syncing = false;
    }
}