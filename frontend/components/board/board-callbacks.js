export function buildColumnCallbacks(board) {
    return {
        onAdd: (data) => board.handleAddTask(data),
        onColumnClick: (name) => { board.selectedColumnName = name; },
        onDrop: (id, col, idx) => board.handleDrop(id, col, idx),
        getDraggedTaskId: () => board.draggedTaskId,
        clearDraggedTaskId: () => { board.draggedTaskId = null; },
    };
}

export function buildCardCallbacks(board) {
    return {
        onEdit: (taskId, data) => board.handleEditTask(taskId, data),
        onDelete: (taskId) => board.handleDeleteTask(taskId),
        onDragStart: (taskId) => { board.draggedTaskId = taskId; },
        onFocus: (taskId, $col) => board.handleCardFocus(taskId, $col),
    };
}