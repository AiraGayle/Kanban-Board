export function handleAddTask(board, taskData) {
    board.tasks = board.taskService.createTask(board.tasks, taskData);
    board.saveAndRefresh();
}

export function handleEditTask(board, taskId, data) {
    board.tasks = board.taskService.updateTask(board.tasks, taskId, data);
    board.saveAndRefresh();
}

export function handleDeleteTask(board, taskId) {
    const adjacentId = findAdjacentCardId(taskId);
    board.tasks = board.taskService.deleteTask(board.tasks, taskId);
    if (board.selectedCardId === taskId) board.selectedCardId = null;
    board.saveAndRefresh();
    if (adjacentId) focusCard(adjacentId);
}

export function handleDrop(board, taskId, column, index) {
    board.tasks = board.taskService.moveTaskToPosition(board.tasks, taskId, column, index);
    board.saveAndRefresh();
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