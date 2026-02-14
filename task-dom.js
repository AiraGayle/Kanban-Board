// Task DOM - Handles task DOM creation and display

const COLUMN_SELECTOR = ".column";
const TASK_SELECTOR = ".task";

function createTaskElement(task, handleEdit, handleDelete, handleDragStart, handleFocus) {
    const $taskDiv = document.createElement("div");
    $taskDiv.className = "task";
    $taskDiv.dataset.taskId = task.id;
    $taskDiv.draggable = true;
    $taskDiv.tabIndex = 0;

    const $titleDiv = document.createElement("div");
    $titleDiv.className = "task__title";
    $titleDiv.textContent = task.title;
    $taskDiv.appendChild($titleDiv);

    if (task.note.trim()) {
        const $noteDiv = document.createElement("div");
        $noteDiv.className = "task__note";
        $noteDiv.textContent = task.note;
        $taskDiv.appendChild($noteDiv);
    }

    const $priorityDiv = document.createElement("div");
    $priorityDiv.className = `task__priority task__priority--${task.priority.toLowerCase()}`;
    $priorityDiv.textContent = `${task.priority} Priority`;
    $taskDiv.appendChild($priorityDiv);

    const $actionsDiv = document.createElement("div");
    $actionsDiv.className = "task__actions";

    const $editBtn = document.createElement("button");
    $editBtn.className = "task__edit-button";
    $editBtn.textContent = "Edit";
    $editBtn.setAttribute("aria-label", "Edit Task");

    const $deleteBtn = document.createElement("button");
    $deleteBtn.className = "task__delete-button";
    $deleteBtn.textContent = "Delete";
    $deleteBtn.setAttribute("aria-label", "Delete Task");

    $actionsDiv.appendChild($editBtn);
    $actionsDiv.appendChild($deleteBtn);
    $taskDiv.appendChild($actionsDiv);

    $editBtn.addEventListener("click", () => {
        const $parentColumn = $taskDiv.closest(COLUMN_SELECTOR);
        handleEdit(task, $parentColumn);
    });

    $deleteBtn.addEventListener("click", () => {
        handleDelete(task.id);
    });

    $taskDiv.addEventListener("dragstart", () => {
        handleDragStart(task.id);
    });

    $taskDiv.addEventListener("focus", () => {
        handleFocus(task.id, $taskDiv.closest(COLUMN_SELECTOR));
    });

    return $taskDiv;
}

function displayTasks($columns, tasks, createTaskElementFn) {
    $columns.forEach($column => {
        const $taskContainer = $column.querySelector(".tasks");
        $taskContainer.innerHTML = "";
        const columnName = $column.dataset.column;

        tasks
            .filter(task => task.column === columnName)
            .forEach(task => $taskContainer.appendChild(createTaskElementFn(task)));
    });
}

function getColumns() {
    return document.querySelectorAll(COLUMN_SELECTOR);
}
