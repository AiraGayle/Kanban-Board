// Task Service - Handles task business logic

function getMaxOrderInColumn(tasks, column) {
    const inColumn = tasks.filter(t => t.column === column);
    if (inColumn.length === 0) return -1;
    return Math.max(...inColumn.map(t => t.order ?? 0));
}

function createNewTask(tasks, title, note, column, priority = "Low") {
    if (!title.trim()) {
        return;
    }

    const order = getMaxOrderInColumn(tasks, column) + 1;
    const newTask = {
        id: Date.now(),
        title: title.trim(),
        note: note.trim(),
        column,
        priority,
        order
    };
    tasks.push(newTask);
    return tasks;
}

function deleteTask(tasks, taskId) {
    return tasks.filter(task => task.id !== taskId);
}

function updateTask(tasks, taskId, title, note, priority) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.title = title.trim();
        task.note = note.trim();
        task.priority = priority;
    }
    return tasks;
}

function findTaskById(tasks, taskId) {
    return tasks.find(t => t.id === taskId);
}

function getTasksInColumn(tasks, column) {
    return tasks
        .filter(t => t.column === column)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function moveTask(tasks, taskId, newColumn) {
    const task = findTaskById(tasks, taskId);
    if (task) {
        task.column = newColumn;
        const othersInColumn = tasks.filter(t => t.column === newColumn && t.id !== taskId);
        const maxOrder = othersInColumn.length === 0 ? -1 : Math.max(...othersInColumn.map(t => t.order ?? 0));
        task.order = maxOrder + 1;
    }
    return tasks;
}

function moveTaskToPosition(tasks, taskId, newColumn, insertIndex) {
    const task = findTaskById(tasks, taskId);
    if (!task) return tasks;

    const inColumn = getTasksInColumn(tasks.filter(t => t.id !== taskId), newColumn);
    insertIndex = Math.max(0, Math.min(insertIndex, inColumn.length));

    task.column = newColumn;
    const reordered = [...inColumn];
    reordered.splice(insertIndex, 0, task);
    reordered.forEach((t, i) => { t.order = i; });
    return tasks;
}
