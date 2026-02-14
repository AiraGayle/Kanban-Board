// Drag and Drop Service - Handles drag and drop functionality

let draggedTaskId = null;

function initializeDragAndDrop($columns, handleDrop) {
    $columns.forEach($column => {
        const $taskContainer = $column.querySelector(".tasks");

        $taskContainer.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        $taskContainer.addEventListener("drop", (e) => {
            e.preventDefault();

            if (draggedTaskId === null) return;

            const columnName = $column.dataset.column;
            handleDrop(draggedTaskId, columnName);
            draggedTaskId = null;
        });
    });
}

function setDraggedTaskId(taskId) {
    draggedTaskId = taskId;
}

function getDraggedTaskId() {
    return draggedTaskId;
}

function clearDraggedTaskId() {
    draggedTaskId = null;
}
