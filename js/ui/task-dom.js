// Task DOM - Handles task DOM creation and display

const COLUMN_SELECTOR = ".column";
const TASK_SELECTOR = ".task";
const COLUMN_NAMES = ['to-do', 'doing', 'done'];

/**
 * Add mobile move buttons (← →) to a task element
 */
function addMobileMoveButtons($taskDiv, task) {
    const $actionsDiv = $taskDiv.querySelector(".task__actions");
    if (!$actionsDiv) return;

    // Remove existing mobile move buttons
    $actionsDiv.querySelectorAll(".mobile-move-btn").forEach(btn => btn.remove());

    // Only for mobile view
    if (!(window.matchMedia && window.matchMedia("(max-width: 700px)").matches)) return;

    const currentIndex = COLUMN_NAMES.indexOf(task.column);

    const createBtn = (direction) => {
        const btn = document.createElement("button");
        btn.className = `task__move-${direction} mobile-move-btn`;
        btn.textContent = direction === "left" ? "←" : "→";
        btn.title = `Move ${direction}`;
        btn.onclick = (e) => {
            e.stopPropagation();
            const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
            if (targetIndex >= 0 && targetIndex < COLUMN_NAMES.length) {
                window.moveTaskButton(task.id, COLUMN_NAMES[targetIndex]);
            }
        };
        return btn;
    };

    if (currentIndex > 0) $actionsDiv.appendChild(createBtn("left"));
    if (currentIndex < COLUMN_NAMES.length - 1) $actionsDiv.appendChild(createBtn("right"));
}

/**
 * Apply mobile move buttons to all tasks
 */
function addMobileMoveButtonsToAllTasks() {
    const $tasks = document.querySelectorAll(".task");
    const isMobile = window.matchMedia("(max-width: 700px)").matches;

    $tasks.forEach($taskDiv => {
        const taskId = $taskDiv.dataset.taskId;
        const task = window.board?.getTask(taskId); // safely check board exists
        if (isMobile && task) addMobileMoveButtons($taskDiv, task);
    });
}
window.addMobileMoveButtonsToAllTasks = addMobileMoveButtonsToAllTasks;

/**
 * Create a task element DOM
 */
export function createTaskElement(task, handleEdit, handleDelete, handleDragStart, handleFocus) {
    const $taskDiv = document.createElement("div");
    $taskDiv.className = "task";
    $taskDiv.dataset.taskId = task.id;
    $taskDiv.draggable = true;
    $taskDiv.tabIndex = 0;

    // Title
    const $titleDiv = document.createElement("div");
    $titleDiv.className = "task__title";
    $titleDiv.textContent = task.title;
    $taskDiv.appendChild($titleDiv);

    // Note
    if (task.note.trim()) {
        const $noteDiv = document.createElement("div");
        $noteDiv.className = "task__note";
        $noteDiv.textContent = task.note;
        $taskDiv.appendChild($noteDiv);
    }

    // Priority
    const $priorityDiv = document.createElement("div");
    $priorityDiv.className = `task__priority task__priority--${task.priority.toLowerCase()}`;
    $priorityDiv.textContent = `${task.priority} Priority`;
    $taskDiv.appendChild($priorityDiv);

    // Actions
    const $actionsDiv = document.createElement("div");
    $actionsDiv.className = "task__actions";

    const $editBtn = document.createElement("button");
    $editBtn.className = "task__edit-button default-action"; // default button
    $editBtn.textContent = "Edit";
    $editBtn.setAttribute("aria-label", "Edit Task");

    const $deleteBtn = document.createElement("button");
    $deleteBtn.className = "task__delete-button";
    $deleteBtn.textContent = "Delete";
    $deleteBtn.setAttribute("aria-label", "Delete Task");

    $actionsDiv.appendChild($editBtn);
    $actionsDiv.appendChild($deleteBtn);
    $taskDiv.appendChild($actionsDiv);

    // Add mobile move buttons initially
    addMobileMoveButtons($taskDiv, task);

    // Event Listeners
    $editBtn.addEventListener("click", () => {
        const $parentColumn = $taskDiv.closest(COLUMN_SELECTOR);
        handleEdit(task, $parentColumn);
    });

    $deleteBtn.addEventListener("click", () => handleDelete(task.id));

    $taskDiv.addEventListener("dragstart", () => handleDragStart(task.id));

    if (typeof attachTouchDragHandler === 'function') {
        attachTouchDragHandler($taskDiv);
    }

    $taskDiv.addEventListener("focus", () => handleFocus(task.id, $taskDiv.closest(COLUMN_SELECTOR)));

    // Keyboard: Enter triggers the default action
    $taskDiv.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const defaultButton = $actionsDiv.querySelector(".default-action");
            if (defaultButton) defaultButton.click();
        }
    });

    return $taskDiv;
}

/**
 * Display tasks in columns
 */
export function displayTasks($columns, tasks, createTaskElementFn) {
    $columns.forEach($column => {
        const $taskContainer = $column.querySelector(".tasks");
        $taskContainer.innerHTML = "";
        const columnName = $column.dataset.column;

        tasks
            .filter(task => task.column === columnName)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .forEach(task => $taskContainer.appendChild(createTaskElementFn(task)));
    });

    // Update mobile move buttons after render
    addMobileMoveButtonsToAllTasks();
}

/**
 * Get all column DOM elements
 */
export function getColumns() {
    return document.querySelectorAll(COLUMN_SELECTOR);
}

