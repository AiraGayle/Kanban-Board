import { OfflineStorageService } from './OfflineStorageService.js';

const API_BASE = '/tasks';
const SYNC_RETRY_DELAY_MS = 3000;

export class SyncService {
    constructor(storageService = new OfflineStorageService()) {
        this.storageService = storageService;
        this.isProcessing = false;
    }

    getAuthToken() {
        return localStorage.getItem('token');
    }

    async start() {
        window.addEventListener('online', () => this.processQueue());
        window.addEventListener('offline', () => console.log('Offline mode active.')); 

        if (navigator.onLine) {
            await this.processQueue();
        }

        // this.openWebSocket(); // TODO: Implement WebSocket server in backend
    }

    // async openWebSocket() {
    //     if (!('WebSocket' in window) || !navigator.onLine) return;

    //     try {
    //         const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/tasks`);

    //         ws.addEventListener('open', () => console.log('WebSocket connected for real-time updates.'));
    //         ws.addEventListener('message', async (event) => {
    //             const data = JSON.parse(event.data);
    //             if (!data?.task) return;

    //             const serverTask = this.normalizeTaskFromServer(data.task);
    //             await this.storageService.saveTask(serverTask);
    //         });

    //         ws.addEventListener('error', (error) => console.warn('WebSocket error', error));
    //         ws.addEventListener('close', () => setTimeout(() => this.openWebSocket(), 5000));

    //         this.websocket = ws;
    //     } catch (error) {
    //         console.warn('WebSocket setup failed, falling back to polling.', error.message);
    //     }
    // }

    /*---------------------- queue operations --------------------*/
    async queueTaskUpsert(task) {
        await this.storageService.enqueueOperation({ type: 'upsert', task });
        await this.processQueue();
    }

    async queueTaskDelete(taskId, updatedAt) {
        const task = { id: taskId, deleted: true, updated_at: updatedAt ?? new Date().toISOString() };
        await this.storageService.enqueueOperation({ type: 'delete', task });
        await this.processQueue();
    }

    /*---------------------- queue processing  --------------------*/
    async processQueue() {
        if (!navigator.onLine || this.isProcessing) {
            return;
        }

        this.isProcessing = true;

        try {
            const operations = await this.storageService.getQueueOperations();

            if (!operations.length) {
                return;
            }

            for (const operation of operations) {
                try {
                    await this.syncOperation(operation);
                    await this.storageService.removeQueueOperation(operation.queueId);
                } catch (error) {
                    if (error.status >= 400 && error.status < 500) {
                        console.warn(`Skipping operation due to client error: ${error.message}`);
                        await this.storageService.removeQueueOperation(operation.queueId);
                        continue;
                    }
                    console.warn('Sync operation failed, stopping queue process:', error.message);
                    throw error;
                }
            }

            try {
                const remoteTasks = await this.fetchRemoteTasks();
                if (remoteTasks) {
                    await this.storageService.saveAllTasks(remoteTasks.map((task) => this.normalizeTaskFromServer(task)));
                }
            } catch (error) {
                if (error.status >= 400 && error.status < 500) {
                    console.warn(`Skipping remote fetch due to client error: ${error.message}`);
                } else {
                    throw error;
                }
            }
        } catch (error) {
            setTimeout(() => this.processQueue(), SYNC_RETRY_DELAY_MS);
        } finally {
            this.isProcessing = false;
        }
    }

    buildApiPayload(task) {
        const payload = {
            id: task.id,
            title: task.title ?? '',
            note: task.note ?? '',
            column_name: task.column ?? 'to-do',
            priority: task.priority ?? 'Low',
            task_order: task.order ?? 0,
            deleted: task.deleted ?? false,
            updated_at: task.updated_at ?? new Date().toISOString(),
        };

        return payload;
    }

    async syncOperation(operation) {
        if (!operation?.task) {
            throw new Error('Empty sync operation');
        }

        const taskPayload = this.buildApiPayload(operation.task);

        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`,
            },
            body: JSON.stringify(taskPayload),
        });

        if (!response.ok) {
            const text = await response.text();
            const error = new Error(`Backend error: ${response.status} ${text}`);
            error.status = response.status;
            throw error;
        }

        const { task: serverTask } = await response.json();

        if (!serverTask) {
            throw new Error('Server returned no task');
        }

        const normalized = this.normalizeTaskFromServer(serverTask);

        await this.resolveConflictAndStore(operation.task, normalized);
    }

    async resolveConflictAndStore(localTask, serverTask) {
        const localUpdatedAt = new Date(localTask.updated_at || 0).getTime();
        const serverUpdatedAt = new Date(serverTask.updated_at || 0).getTime();

        if (localUpdatedAt > serverUpdatedAt) {
            await this.storageService.enqueueOperation({ type: 'upsert', task: localTask });
            return;
        }

        await this.storageService.saveTask(serverTask);
    }

    // refresh from server 
    async fetchRemoteTasks() {
        const response = await fetch(API_BASE, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`,
            },
        });

        if (!response.ok) {
            const text = await response.text();
            const error = new Error(`Failed to fetch remote tasks: ${response.status} ${text}`);
            error.status = response.status;
            throw error;
        }

        const { tasks } = await response.json();
        if (!Array.isArray(tasks)) {
            throw new Error('Invalid task list from server');
        }

        return tasks;
    }

    normalizeTaskFromServer(task) {
        return {
            id: task.id,
            title: task.title,
            note: task.note,
            column: task.column_name || task.column || 'to-do',
            priority: task.priority || 'Low',
            order: task.task_order ?? task.order ?? 0,
            deleted: task.deleted || false,
            updated_at: task.updated_at || new Date().toISOString(),
            created_at: task.created_at,
        };
    }
}
