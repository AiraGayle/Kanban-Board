// Drag and Drop Service - Handles drag and drop functionality

let draggedTaskId = null;
let draggedElement = null;
let touchStartY = 0;
let touchStartX = 0;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let placeholder = null;

function initializeDragAndDrop($columns, handleDrop) {
    $columns.forEach($column => {
        const $taskContainer = $column.querySelector(".tasks");

        // Mouse drag events (desktop)
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

        // Touch drag events (mobile)
        $taskContainer.addEventListener("touchmove", handleTouchMove, { passive: false });
        $taskContainer.addEventListener("touchend", handleTouchEnd);
    });

    document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
}

function handleTouchStart(e, taskElement) {
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
    
    draggedTaskId = parseInt(taskElement.dataset.taskId);
    draggedElement = taskElement;
    isDragging = false;
    
    const rect = taskElement.getBoundingClientRect();
    dragOffset.x = touch.clientX - rect.left;
    dragOffset.y = touch.clientY - rect.top;
}

function handleTouchMove(e) {
    if (!draggedElement || draggedTaskId === null) return;
    
    const touch = e.touches[0];
    const deltaY = Math.abs(touch.clientY - touchStartY);
    const deltaX = Math.abs(touch.clientX - touchStartX);
    
    if (!isDragging && deltaY > 15 && deltaY > deltaX * 1.5) {
        isDragging = true;
        draggedElement.style.opacity = "0.5";
        draggedElement.style.transform = "scale(0.95)";
        draggedElement.style.transition = "none";
        
        createPlaceholder(draggedElement);
        
        document.body.style.overflow = "hidden";
    }
    
    if (isDragging) {
        e.preventDefault();
        
        draggedElement.style.position = "fixed";
        draggedElement.style.left = (touch.clientX - dragOffset.x) + "px";
        draggedElement.style.top = (touch.clientY - dragOffset.y) + "px";
        draggedElement.style.zIndex = "1000";
        draggedElement.style.pointerEvents = "none";
        
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropTarget = elementBelow?.closest(".tasks");
        const targetTask = elementBelow?.closest(".task");
        
        if (dropTarget) {
            updatePlaceholderPosition(dropTarget, targetTask, touch.clientY);
        }
    }
}

function handleGlobalTouchMove(e) {
    if (isDragging && draggedElement) {
        e.preventDefault();
    }
}

function handleTouchEnd(e) {
    if (!isDragging || !draggedElement || draggedTaskId === null) {
        resetDragState();
        return;
    }
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropTarget = elementBelow?.closest(".tasks");
    
    if (dropTarget) {
        const column = dropTarget.closest(".column");
        const columnName = column?.dataset.column;
        
        if (columnName) {
            const allTaskElements = [...dropTarget.querySelectorAll(".task")];
            const otherTaskElements = allTaskElements.filter(el => el.dataset.taskId !== String(draggedTaskId));
            const targetTask = elementBelow?.closest(".task");
            
            let insertIndex;
            if (targetTask && targetTask.closest(".tasks") === dropTarget) {
                if (targetTask.dataset.taskId === String(draggedTaskId)) {
                    insertIndex = allTaskElements.findIndex(el => el.dataset.taskId === String(draggedTaskId));
                } else {
                    const idx = otherTaskElements.indexOf(targetTask);
                    if (idx === -1) {
                        insertIndex = otherTaskElements.length;
                    } else {
                        const rect = targetTask.getBoundingClientRect();
                        const mid = rect.top + rect.height / 2;
                        insertIndex = touch.clientY < mid ? idx : idx + 1;
                    }
                }
            } else {
                insertIndex = otherTaskElements.length;
            }
            const dropEvent = new CustomEvent("taskDrop", {
                detail: { taskId: draggedTaskId, columnName, insertIndex }
            });
            document.dispatchEvent(dropEvent);
        }
    }
    
    resetDragState();
}

// put this sa html cause its not clean code
function createPlaceholder(element) {
    placeholder = document.createElement("div");
    placeholder.className = "task-placeholder";
    placeholder.style.height = element.offsetHeight + "px";
    placeholder.style.width = element.offsetWidth + "px"
    placeholder.style.boxSizing = "border-box"
    placeholder.style.margin = window.getComputedStyle(element).margin;
    placeholder.style.border = "2px dashed #ccc";
    placeholder.style.borderRadius = "8px";
    placeholder.style.backgroundColor = "transparent";
    placeholder.style.marginBottom = "8px";
    
    const parent = element.parentNode;
    parent.insertBefore(placeholder, element);
}

function updatePlaceholderPosition(dropTarget, targetTask, clientY) {
    if (!placeholder || !dropTarget) return;
    
    const allTasks = [...dropTarget.querySelectorAll(".task:not(.task-placeholder)")];
    const placeholderIndex = Array.from(dropTarget.children).indexOf(placeholder);
    
    if (targetTask && targetTask.closest(".tasks") === dropTarget && targetTask !== draggedElement) {
        const targetIndex = Array.from(dropTarget.children).indexOf(targetTask);
        if (targetIndex !== -1 && targetIndex !== placeholderIndex) {
            const rect = targetTask.getBoundingClientRect();
            const mid = rect.top + rect.height / 2;
            const newIndex = clientY < mid ? targetIndex : targetIndex + 1;
            
            if (newIndex !== placeholderIndex) {
                dropTarget.insertBefore(placeholder, dropTarget.children[newIndex] || null);
            }
        }
    } else if (allTasks.length === 0 || placeholderIndex === -1) {
        dropTarget.appendChild(placeholder);
    }
}

function resetDragState() {
    if (draggedElement) {
        draggedElement.style.opacity = "";
        draggedElement.style.transform = "";
        draggedElement.style.position = "";
        draggedElement.style.left = "";
        draggedElement.style.top = "";
        draggedElement.style.zIndex = "";
        draggedElement.style.pointerEvents = "";
        draggedElement.style.transition = "";
    }
    
    if (placeholder) {
        placeholder.remove();
        placeholder = null;
    }
    
    document.body.style.overflow = "";
    draggedElement = null;
    draggedTaskId = null;
    isDragging = false;
    touchStartY = 0;
    touchStartX = 0;
}

function attachTouchDragHandler(taskElement) {
    taskElement.addEventListener("touchstart", (e) => handleTouchStart(e, taskElement), { passive: false });
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
