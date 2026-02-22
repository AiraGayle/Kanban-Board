// Storage Service — wraps localStorage for task persistence

class StorageService {
    constructor() {
        this.STORAGE_KEY = 'tasks';
    }

    save(tasks) {
        try {
            const serializedTasks = JSON.stringify(tasks);
            localStorage.setItem(this.STORAGE_KEY, serializedTasks);
        } catch (error) {
            throw new Error(`Failed to save tasks to localStorage: ${error.message}`);
        }
    }

    load() {
        try {
            const storedData = localStorage.getItem(this.STORAGE_KEY);
            if (!storedData) return [];
            return JSON.parse(storedData);
        } catch (error) {
            throw new Error(`Failed to load tasks from localStorage: ${error.message}`);
        }
    }
}