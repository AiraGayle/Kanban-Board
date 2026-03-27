export function setupKeyboard(board) {
    document.addEventListener('keydown', (e) => handleKeyDown(board, e));
}

function handleKeyDown(board, e) {
    if (isInFormField()) return;

    const { altKey, key } = e;

    if (altKey && key === 'a')           return handleAddShortcut(board, e);
    if (altKey && key === 'd')           return handleDeleteShortcut(board, e);
    if (altKey && key === 'e')           return handleEditShortcut(board, e);
    if (altKey && key === 'ArrowRight')  return handleMoveCard(board, e, 1);
    if (altKey && key === 'ArrowLeft')   return handleMoveCard(board, e, -1);
    if (!altKey && key === 'ArrowDown')  return handleNavigateDown(e);
    if (!altKey && key === 'ArrowUp')    return handleNavigateUp(e);
    if (!altKey && key === 'ArrowRight') return handleNavigateColumn(board, e, 1);
    if (!altKey && key === 'ArrowLeft')  return handleNavigateColumn(board, e, -1);
}

function isInFormField() {
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
}

function handleAddShortcut(board, e) {
    e.preventDefault();
    board.getSelectedColumn()?.showAddForm();
}

function handleDeleteShortcut(board, e) {
    e.preventDefault();
    if (board.selectedCardId) board.handleDeleteTask(board.selectedCardId);
}

function handleEditShortcut(board, e) {
    e.preventDefault();
    if (!board.selectedCardId) return;
    document.querySelector(`.card[data-task-id="${board.selectedCardId}"] .card__edit-button`)?.click();
}

function handleMoveCard(board, e, direction) {
    e.preventDefault();
    if (!board.selectedCardId) return;

    const newIndex = board.getSelectedColumnIndex() + direction;
    if (newIndex < 0 || newIndex >= board.columns.length) return;

    const newColumnName = board.columns[newIndex].name;
    const taskId = board.selectedCardId;

    board.tasks = board.taskService.moveTask(board.tasks, taskId, newColumnName);
    board.selectedColumnName = newColumnName;
    board.saveAndRefresh();
    focusCard(taskId);
}

function handleNavigateDown(e) {
    const $active = document.activeElement;
    if (!$active?.classList.contains('card')) return;
    e.preventDefault();
    if ($active.nextElementSibling?.classList.contains('card'))
        $active.nextElementSibling.focus();
}

function handleNavigateUp(e) {
    const $active = document.activeElement;
    if (!$active?.classList.contains('card')) return;
    e.preventDefault();
    if ($active.previousElementSibling?.classList.contains('card'))
        $active.previousElementSibling.focus();
}

function handleNavigateColumn(board, e, direction) {
    if (!document.activeElement?.classList.contains('card')) return;
    e.preventDefault();

    const newIndex = board.getSelectedColumnIndex() + direction;
    if (newIndex < 0 || newIndex >= board.columns.length) return;

    const $firstCard = board.columns[newIndex].$element.querySelector('.card');
    if ($firstCard) $firstCard.focus();
    board.selectedColumnName = board.columns[newIndex].name;
}

function focusCard(taskId) {
    document.querySelector(`.card[data-task-id="${taskId}"]`)?.focus();
}