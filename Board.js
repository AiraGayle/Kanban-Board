import Column from "./Column.js";
import Card from "./Card.js";

export default class Board {
    constructor(columnNames) {
        this.columns = columnNames.map(name => new Column(name));
    }

    getColumn(name) {
        return this.columns.find(c => c.name === name);
    }

    getTask(taskId) {
        for (const column of this.columns) {
            const task = column.getTask(taskId);
            if (task) return task;
        }
        return null;
    }

    addTask(title, note, columnName, priority) {
        if (!title.trim()) return;

        const column = this.getColumn(columnName);
        const task = new Card({ title, note, column: columnName, priority });

        column.addTask(task);
        return task;
    }

    deleteTask(taskId) {
        this.columns.forEach(col => col.removeTask(taskId));
    }

    updateTask(taskId, title, note, priority) {
        const task = this.getTask(taskId);
        if (task) task.update(title, note, priority);
    }

    moveTask(taskId, newColumnName, insertIndex = null) {
        const task = this.getTask(taskId);
        if (!task) return;

        const oldColumn = this.getColumn(task.column);
        const newColumn = this.getColumn(newColumnName);

        oldColumn.removeTask(taskId);

        task.column = newColumnName;   // ⭐ THIS FIXES EVERYTHING

        if (insertIndex === null) {
            newColumn.addTask(task);
        } else {
            newColumn.insertTaskAt(task, insertIndex);
        }
    }

    setTasks(tasksArray) {
    // Clear existing tasks first
    this.columns.forEach(col => col.tasks = []);

    // Recreate each saved task
    tasksArray.forEach(taskData => {
        const column = this.getColumn(taskData.column);
        if (!column) return;

        const task = new Card(taskData);
        column.addTask(task);
    });
}

    getAllTasks() {
        return this.columns.flatMap(col => col.tasks);
    }
}