// Storage Service — persists tasks via the backend API (replaces localStorage)
import { getHeaders } from './AuthService.js';

const API_BASE = (typeof window !== 'undefined' && window.ENV_API_BASE) || 'http://localhost:3000';

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

    /** Upsert a single task to the DB */
    async saveTask(task) {
        const res = await fetch(`${API_BASE}/tasks`, {
            method:  'POST',
            headers: getHeaders(),
            body:    JSON.stringify(toApi(task)),
        });
        if (!res.ok) throw new Error('Failed to save task');
        const { task: saved } = await res.json();
        return fromApi(saved);
    }

    /** Upsert multiple tasks concurrently (e.g. after a reorder) */
    async saveTasks(tasks) {
        await Promise.all(tasks.map(t => this.saveTask(t)));
    }

    /** Soft-delete a task in the DB */
    async deleteTask(task) {
        const res = await fetch(`${API_BASE}/tasks`, {
            method:  'POST',
            headers: getHeaders(),
            body:    JSON.stringify(toApi(task, { deleted: true })),
        });
        if (!res.ok) throw new Error('Failed to delete task');
    }
}