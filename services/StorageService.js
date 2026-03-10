// Storage Service — wraps localStorage for task persistence

export class StorageService {
    static #STORAGE_KEY = 'tasks';

    save(tasks) {
        try {
            localStorage.setItem(StorageService.#STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            throw new Error(`Failed to save tasks: ${error.message}`);
        }
    }

    load() {
        try {
            const data = localStorage.getItem(StorageService.#STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            throw new Error(`Failed to load tasks: ${error.message}`);
        }
    }
}