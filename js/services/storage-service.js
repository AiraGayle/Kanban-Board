// Storage Service - Handles localStorage operations
const STORAGE_KEY = "tasks";

export function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function loadTasks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
