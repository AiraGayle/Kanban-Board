// Storage Service - Handles localStorage operations
const STORAGE_KEY = "tasks";

function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
