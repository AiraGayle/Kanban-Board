// Storage Service — persists tasks via the backend API with offline-first support
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
function fromApi(task) {
    return {
        id:       task.id,
        title:    task.title,
        note:     task.note,
        column:   task.column_name,
        priority: task.priority,
        order:    task.task_order,
    };
}

/** IndexedDB wrapper for local storage */
class IndexedDBStorage {
    constructor(dbName = 'KanbanDB', storeName = 'tasks', queueStore = 'syncQueue') {
        this.dbName = dbName;
        this.storeName = storeName;
        this.queueStore = queueStore;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('column_order', ['column', 'order']);
                }
                if (!db.objectStoreNames.contains(this.queueStore)) {
                    db.createObjectStore(this.queueStore, { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getAll() {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async put(task) {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(task);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async delete(id) {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clear() {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async addToQueue(operation) {
        const transaction = this.db.transaction([this.queueStore], 'readwrite');
        const store = transaction.objectStore(this.queueStore);
        return new Promise((resolve, reject) => {
            const request = store.add(operation);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getQueue() {
        const transaction = this.db.transaction([this.queueStore], 'readonly');
        const store = transaction.objectStore(this.queueStore);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async removeFromQueue(id) {
        const transaction = this.db.transaction([this.queueStore], 'readwrite');
        const store = transaction.objectStore(this.queueStore);
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

export class StorageService {
    constructor() {
        this.local = new IndexedDBStorage();
        this.initPromise = this.local.init();
        this.isOnline = () => navigator.onLine;
        window.addEventListener('online', () => this.sync());
    }

    /** Fetch all tasks for the authenticated user from the DB, with offline support */
    async load() {
        await this.initPromise;
        if (this.isOnline()) {
            try {
                const res = await fetch(`${API_BASE}/tasks`, { headers: getHeaders() });
                if (res.ok) {
                    const { tasks } = await res.json();
                    const localTasks = tasks.map(fromApi);
                    await this.local.clear();
                    for (const task of localTasks) {
                        await this.local.put(task);
                    }
                    return localTasks;
                }
            } catch (e) {
                // Fall back to local
            }
        }
        const allTasks = await this.local.getAll();
        return allTasks.filter(task => !task.deleted);
    }

    /** Upsert a single task to the DB, with offline queuing */
    async saveTask(task) {
        await this.initPromise;
        await this.local.put(task);
        if (this.isOnline()) {
            try {
                const res = await fetch(`${API_BASE}/tasks`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(toApi(task)),
                });
                if (res.ok) {
                    const { task: saved } = await res.json();
                    const serverTask = fromApi(saved);
                    await this.local.put(serverTask);
                    return serverTask;
                } else {
                    await this.local.addToQueue({ type: 'save', task });
                }
            } catch (e) {
                await this.local.addToQueue({ type: 'save', task });
            }
        } else {
            await this.local.addToQueue({ type: 'save', task });
        }
        return task;
    }

    /** Upsert multiple tasks concurrently (e.g. after a reorder), with offline support */
    async saveTasks(tasks) {
        await Promise.all(tasks.map(t => this.saveTask(t)));
    }

    /** Soft-delete a task in the DB, with offline queuing */
    async deleteTask(task) {
        await this.initPromise;
        task.deleted = true;
        await this.local.put(task);
        if (this.isOnline()) {
            try {
                const res = await fetch(`${API_BASE}/tasks`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(toApi(task, { deleted: true })),
                });
                if (res.ok) {
                    const { task: saved } = await res.json();
                    const serverTask = fromApi(saved);
                    await this.local.put(serverTask);
                } else {
                    await this.local.addToQueue({ type: 'delete', task });
                }
            } catch (e) {
                await this.local.addToQueue({ type: 'delete', task });
            }
        } else {
            await this.local.addToQueue({ type: 'delete', task });
        }
    }

    /** Sync queued operations when back online */
    async sync() {
        if (!this.isOnline()) return;
        await this.initPromise;
        const queue = await this.local.getQueue();
        for (const op of queue) {
            try {
                let res;
                if (op.type === 'save') {
                    res = await fetch(`${API_BASE}/tasks`, {
                        method: 'POST',
                        headers: getHeaders(),
                        body: JSON.stringify(toApi(op.task)),
                    });
                } else if (op.type === 'delete') {
                    res = await fetch(`${API_BASE}/tasks`, {
                        method: 'POST',
                        headers: getHeaders(),
                        body: JSON.stringify(toApi(op.task, { deleted: true })),
                    });
                }
                if (res.ok) {
                    const { task: saved } = await res.json();
                    const serverTask = fromApi(saved);
                    await this.local.put(serverTask);
                    await this.local.removeFromQueue(op.id);
                }
            } catch (e) {
                // Keep in queue for next sync
            }
        }
    }
}