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
            const allTaskElements = [...$taskContainer.querySelectorAll(".task")];
            const otherTaskElements = allTaskElements.filter(el => el.dataset.taskId !== String(draggedTaskId));
            const targetTask = e.target.closest(".task");

            let insertIndex;
            if (targetTask && targetTask.closest(".tasks") === $taskContainer) {
                if (targetTask.dataset.taskId === String(draggedTaskId)) {
                    insertIndex = allTaskElements.findIndex(el => el.dataset.taskId === String(draggedTaskId));
                } else {
                    const idx = otherTaskElements.indexOf(targetTask);
                    if (idx === -1) {
                        insertIndex = otherTaskElements.length;
                    } else {
                        const rect = targetTask.getBoundingClientRect();
                        const mid = rect.top + rect.height / 2;
                        insertIndex = e.clientY < mid ? idx : idx + 1;
                    }
                }
            } else {
                insertIndex = otherTaskElements.length;
            }

            handleDrop(draggedTaskId, columnName, insertIndex);
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
