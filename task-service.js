// Task Service - Handles task business logic

function createNewTask(tasks, title, note, column, priority = "Low") {
    if (!title.trim()) {
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title.trim(),
        note: note.trim(),
        column,
        priority
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

function moveTask(tasks, taskId, newColumn) {
    const task = findTaskById(tasks, taskId);
    if (task) {
        task.column = newColumn;
    }
    return tasks;
}
