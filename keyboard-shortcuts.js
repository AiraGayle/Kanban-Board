// Keyboard Shortcuts - Handles keyboard navigation and commands

function initializeKeyboardShortcuts(handleKeyboardShortcut) {
    document.addEventListener("keydown", handleKeyboardShortcut);
}

function handleKeyboardInput(event, $columns, selectedColumn, selectedTaskId, callbacks) {
    // Prevent shortcuts inside form inputs
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        return;
    }

    if (!selectedColumn) return;

    const key = event.key.toLowerCase();

    // ADD TASK → alt + a
    if (event.altKey && key === "a") {
        event.preventDefault();
        selectedColumn.querySelector(".column__add-button")?.click();
    }

    // DELETE → alt + d
    if (event.altKey && key === "d" && selectedTaskId) {
        event.preventDefault();
        callbacks.onDelete(selectedTaskId);
    }

    // EDIT → alt + e
    if (event.altKey && key === "e" && selectedTaskId) {
        event.preventDefault();
        callbacks.onEdit(selectedTaskId, selectedColumn);
    }

    // MOVE RIGHT → alt + →
    if (event.altKey && event.key === "ArrowRight") {
        event.preventDefault();
        callbacks.onMoveRight();
    }

    // MOVE LEFT → alt + ←
    if (event.altKey && event.key === "ArrowLeft") {
        event.preventDefault();
        callbacks.onMoveLeft();
    }

    // NAVIGATE DOWN → ↓
    if (event.key === "ArrowDown") {
        event.preventDefault();
        const $current = document.activeElement;
        const $next = $current.nextElementSibling;

        if ($next && $next.classList.contains("task")) {
            $next.focus();
        }
    }

    // NAVIGATE UP → ↑
    if (event.key === "ArrowUp") {
        event.preventDefault();
        const $current = document.activeElement;
        const $prev = $current.previousElementSibling;

        if ($prev && $prev.classList.contains("task")) {
            $prev.focus();
        }
    }

    // CHANGE COLUMN RIGHT → →
    if (event.key === "ArrowRight" && !event.altKey) {
        event.preventDefault();
        callbacks.onMoveColumnRight();
    }

    // CHANGE COLUMN LEFT → ←
    if (event.key === "ArrowLeft" && !event.altKey) {
        event.preventDefault();
        callbacks.onMoveColumnLeft();
    }
}

function moveFocusBetweenColumns($columns, selectedColumn, direction) {
    const $columnArray = Array.from($columns);
    const currentIndex = $columnArray.indexOf(selectedColumn);
    const newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= $columnArray.length) return;

    const $newColumn = $columnArray[newIndex];
    const $firstTask = $newColumn.querySelector(".task");

    if ($firstTask) {
        $firstTask.focus();
    }

    return $newColumn;
}
