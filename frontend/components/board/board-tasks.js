export async function handleAddTask(board, taskData) {
    const before = board.tasks;
    board.tasks = board.taskService.createTask(board.tasks, taskData);
    const added = board.tasks.filter(t => !before.find(b => b.id === t.id));
    await board.saveAndRefresh(added);
}

export async function handleEditTask(board, taskId, data) {
    board.tasks = board.taskService.updateTask(board.tasks, taskId, data);
    const updated = board.tasks.find(t => t.id === taskId);
    await board.saveAndRefresh(updated ? [updated] : []);
}

export async function handleDeleteTask(board, taskId) {
    const adjacentId = findAdjacentCardId(taskId);
    const taskToDelete = board.taskService.findById(board.tasks, taskId);
    board.tasks = board.taskService.deleteTask(board.tasks, taskId);
    if (board.selectedCardId === taskId) board.selectedCardId = null;
    await board.saveAndRefresh([], taskToDelete);
    if (adjacentId) focusCard(adjacentId);
}

export async function handleDrop(board, taskId, column, index) {
    const before = board.tasks;
    board.tasks = board.taskService.moveTaskToPosition(board.tasks, taskId, column, index);
    // Save all tasks whose column or order changed (reorder affects multiple cards)
    const changed = board.tasks.filter(t => {
        const old = before.find(b => b.id === t.id);
        return !old || old.column !== t.column || old.order !== t.order;
    });
    await board.saveAndRefresh(changed);
}

export function handleCardFocus(board, taskId, $colEl) {
    board.selectedCardId = taskId;
    const col = board.columns.find(c => c.$element === $colEl);
    if (col) board.selectedColumnName = col.name;
}

function findAdjacentCardId(taskId) {
    const $card = document.querySelector(`.card[data-task-id="${taskId}"]`);
    const $adj = $card?.nextElementSibling ?? $card?.previousElementSibling;
    return $adj?.classList.contains('card') ? $adj.dataset.taskId : null;
}

function focusCard(taskId) {
    document.querySelector(`.card[data-task-id="${taskId}"]`)?.focus();
}