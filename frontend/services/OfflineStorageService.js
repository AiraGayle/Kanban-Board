const DB_NAME = 'KanbanBoardOfflineDB';
const DB_VERSION = 1;
const TASKS_STORE = 'tasks';
const QUEUE_STORE = 'syncQueue';
const LEGACY_STORAGE_KEY = 'tasks';

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            return reject(new Error('IndexedDB not supported')); 
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(TASKS_STORE)) {
                db.createObjectStore(TASKS_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(QUEUE_STORE)) {
                const queueStore = db.createObjectStore(QUEUE_STORE, { keyPath: 'queueId', autoIncrement: true });
                queueStore.createIndex('timestamp', 'timestamp');
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export class OfflineStorageService {
    constructor() {
        this.db = null;
        this.isFallback = false;
    }

    async initialize() {
        try {
            this.db = await openDatabase();
            const legacyTasks = this.loadLegacyTasks();
            const existing = await this.getAllTasks();
            if (legacyTasks.length > 0 && existing.length === 0) {
                await this.saveAllTasks(legacyTasks);
            }
        } catch (error) {
            console.warn('OfflineStorageService: IndexedDB initialization failed, falling back to localStorage:', error.message);
            this.isFallback = true;
        }
    }

    async #withStore(storeName, mode, operation) {
        if (this.isFallback || !this.db) {
            throw new Error('IndexedDB is not available');
        }

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, mode);
            const store = tx.objectStore(storeName);
            const request = operation(store);

            tx.oncomplete = () => resolve(request?.result);
            tx.onerror = () => reject(tx.error || request.error);
            tx.onabort = () => reject(tx.error || request.error);
        });
    }

    loadLegacyTasks() {
        try {
            const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            console.warn('Failed to load legacy tasks from localStorage:', error.message);
            return [];
        }
    }

    saveLegacyTasks(tasks) {
        try {
            localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.warn('Failed to save legacy tasks to localStorage:', error.message);
        }
    }

    async getAllTasks() {
        if (this.isFallback || !this.db) {
            return this.loadLegacyTasks();
        }

        try {
            const tasks = await this.#withStore(TASKS_STORE, 'readonly', store => store.getAll());
            return tasks ?? [];
        } catch (error) {
            console.warn('getAllTasks failed, reading from localStorage.', error.message);
            return this.loadLegacyTasks();
        }
    }

    async saveAllTasks(tasks) {
        if (this.isFallback || !this.db) {
            this.saveLegacyTasks(tasks);
            return;
        }

        try {
            await this.#withStore(TASKS_STORE, 'readwrite', store => {
                store.clear();
                tasks.forEach(task => store.put(task));
            });
            this.saveLegacyTasks(tasks); //saving to local as backup
        } catch (error) {
            console.warn('saveAllTasks failed, storing in localStorage.', error.message);
            this.saveLegacyTasks(tasks);
        }
    }

    async saveTask(task) {
        if (this.isFallback || !this.db) {
            const tasks = this.loadLegacyTasks();
            const index = tasks.findIndex((t) => t.id === task.id);
            if (index >= 0) tasks[index] = task;
            else tasks.push(task);
            this.saveLegacyTasks(tasks);
            return;
        }

        try {
            await this.#withStore(TASKS_STORE, 'readwrite', store => store.put(task));
            const all = await this.getAllTasks();
            this.saveLegacyTasks(all);
        } catch (error) {
            console.warn('saveTask failed, fallback to localStorage.', error.message);
            const tasks = this.loadLegacyTasks();
            const index = tasks.findIndex((t) => t.id === task.id);
            if (index >= 0) tasks[index] = task;
            else tasks.push(task);
            this.saveLegacyTasks(tasks);
        }
    }

    async deleteTask(taskId) {
        if (this.isFallback || !this.db) {
            const tasks = this.loadLegacyTasks().filter((task) => task.id !== taskId);
            this.saveLegacyTasks(tasks);
            return;
        }

        try {
            await this.#withStore(TASKS_STORE, 'readwrite', store => store.delete(taskId));
            const all = await this.getAllTasks();
            this.saveLegacyTasks(all);
        } catch (error) {
            console.warn('deleteTask failed, falling back to localStorage.', error.message);
            const tasks = this.loadLegacyTasks().filter((task) => task.id !== taskId);
            this.saveLegacyTasks(tasks);
        }
    }

    async enqueueOperation(operation) {
        const payload = {
            ...operation,
            timestamp: new Date().toISOString(), // just adding timestamp for the queue item
        };

        if (this.isFallback || !this.db) {
            const queue = this.loadQueueFromLegacy();
            queue.push(payload);
            this.saveQueueToLegacy(queue);
            return;
        }

        await this.#withStore(QUEUE_STORE, 'readwrite', store => store.add(payload));
    }

    async getQueueOperations() {
        if (this.isFallback || !this.db) {
            return this.loadQueueFromLegacy();
        }

        try {
            return await this.#withStore(QUEUE_STORE, 'readonly', store => store.getAll());
        } catch (error) {
            console.warn('getQueueOperations failed, using fallback queue.', error.message);
            return this.loadQueueFromLegacy();
        }
    }

    async removeQueueOperation(queueId) {
        if (this.isFallback || !this.db) {
            const queue = this.loadQueueFromLegacy().filter(item => item.queueId !== queueId); // keep all except the one we want to remove
            this.saveQueueToLegacy(queue);
            return;
        }

        await this.#withStore(QUEUE_STORE, 'readwrite', store => store.delete(queueId));
    }

    loadQueueFromLegacy() {
        try {
            const raw = localStorage.getItem(`${LEGACY_STORAGE_KEY}-queue`);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            console.warn('Failed to load queue from localStorage:', error.message);
            return [];
        }
    }

    saveQueueToLegacy(queue) {
        try {
            localStorage.setItem(`${LEGACY_STORAGE_KEY}-queue`, JSON.stringify(queue));
        } catch (error) {
            console.warn('Failed to save queue to localStorage:', error.message);
        }
    }
}
