export function buildColumnCallbacks(board) {
    return {
        onAdd: (data) => board.handleAddTask(data).catch(console.error),
        onColumnClick: (name) => { board.selectedColumnName = name; },
        onDrop: (id, col, idx) => board.handleDrop(id, col, idx).catch(console.error),
        getDraggedTaskId: () => board.draggedTaskId,
        clearDraggedTaskId: () => { board.draggedTaskId = null; },
    };
}

export function buildCardCallbacks(board) {
    return {
        onEdit: (taskId, data) => board.handleEditTask(taskId, data).catch(console.error),
        onDelete: (taskId) => board.handleDeleteTask(taskId).catch(console.error),
        onDragStart: (taskId) => { board.draggedTaskId = taskId; },
        onFocus: (taskId, $col) => board.handleCardFocus(taskId, $col),
    };
}