// Task Service — all business logic for task CRUD and ordering

class TaskService {
    getMaxOrder(tasks, column) {
        const inColumn = tasks.filter(t => t.column === column);
        if (inColumn.length === 0) return -1;
        return Math.max(...inColumn.map(t => t.order ?? 0));
    }

    createTask(tasks, { title, note, column, priority = 'Low' }) {
        if (!title.trim()) return tasks;

        const newTask = {
            id: Date.now(),
            title: title.trim(),
            note: (note ?? '').trim(),
            column,
            priority,
            order: this.getMaxOrder(tasks, column) + 1,
        };

        return [...tasks, newTask];
    }

    deleteTask(tasks, taskId) {
        return tasks.filter(t => t.id !== taskId);
    }

    updateTask(tasks, taskId, { title, note, priority }) {
        return tasks.map(t =>
            t.id === taskId
                ? { ...t, title: title.trim(), note: (note ?? '').trim(), priority }
                : t
        );
    }

    findById(tasks, taskId) {
        return tasks.find(t => t.id === taskId);
    }

    getByColumn(tasks, column) {
        return tasks
            .filter(t => t.column === column)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    moveTask(tasks, taskId, newColumn) {
        const maxOrder = this.getMaxOrder(
            tasks.filter(t => t.id !== taskId),
            newColumn
        );

        return tasks.map(t =>
            t.id === taskId ? { ...t, column: newColumn, order: maxOrder + 1 } : t
        );
    }

    moveTaskToPosition(tasks, taskId, newColumn, insertIndex) {
        const task = this.findById(tasks, taskId);
        if (!task) return tasks;

        const withoutTask = tasks.filter(t => t.id !== taskId);
        const inColumn = this.getByColumn(withoutTask, newColumn);
        const safeIndex = Math.max(0, Math.min(insertIndex, inColumn.length));

        const updatedTask = { ...task, column: newColumn };
        inColumn.splice(safeIndex, 0, updatedTask);
        inColumn.forEach((t, i) => { t.order = i; });

        const otherColumns = withoutTask.filter(t => t.column !== newColumn);
        return [...otherColumns, ...inColumn];
    }
}