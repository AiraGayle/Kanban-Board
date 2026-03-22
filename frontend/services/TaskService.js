// Task Service — all business logic for task CRUD and ordering

export class TaskService {
    getMaxOrder(tasks, column) {
        const inColumn = tasks.filter(t => t.column === column);
        if (inColumn.length === 0) return -1;
        return Math.max(...inColumn.map(t => t.order ?? 0));
    }

    createTaskObject(taskData, existingTasks) {
        const title = (taskData.title ?? '').trim();
        if (!title) {
            throw new Error('Task title is required');
        }

        const now = new Date().toISOString();
        return {
            id: taskData.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            title,
            note: (taskData.note ?? '').trim(),
            column: taskData.column ?? 'to-do',
            priority: taskData.priority ?? 'Low',
            order: this.getMaxOrder(existingTasks, taskData.column ?? 'to-do') + 1,
            deleted: false,
            updated_at: now,
            created_at: taskData.created_at ?? now,
        };
    }

    createTask(tasks, taskData) {
        const task = this.createTaskObject(taskData, tasks);
        return { tasks: [...tasks, task], task };
    }

    deleteTask(tasks, taskId) {
        return tasks.filter(t => t.id !== taskId);
    }

    updateTask(tasks, taskId, changes) {
        const now = new Date().toISOString();

        const nextTasks = tasks.map(t =>
            t.id === taskId
                ? {
                      ...t,
                      title: (changes.title ?? t.title).trim(),
                      note: (changes.note ?? t.note).trim(),
                      priority: changes.priority ?? t.priority,
                      updated_at: now,
                  }
                : t
        );

        const updatedTask = nextTasks.find(t => t.id === taskId);
        return { tasks: nextTasks, updatedTask };
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
        const maxOrder = this.getMaxOrder(tasks.filter(t => t.id !== taskId), newColumn);
        return tasks.map(t =>
            t.id === taskId ? { ...t, column: newColumn, order: maxOrder + 1, updated_at: new Date().toISOString() } : t
        );
    }

    moveTaskToPosition(tasks, taskId, newColumn, insertIndex) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return tasks;

        const withoutTask = tasks.filter(t => t.id !== taskId);
        const inColumn = this.getByColumn(withoutTask, newColumn);
        const safeIndex = Math.max(0, Math.min(insertIndex, inColumn.length));

        const updatedTask = {
            ...task,
            column: newColumn,
            updated_at: new Date().toISOString(),
        };

        inColumn.splice(safeIndex, 0, updatedTask);
        inColumn.forEach((t, i) => {
            t.order = i;
        });

        return [...withoutTask.filter(t => t.column !== newColumn), ...inColumn];
    }
}