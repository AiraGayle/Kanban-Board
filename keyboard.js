// keyboard.js
class KeyboardManager {
    constructor($columns, getSelectedTaskId, getSelectedColumn, callbacks) {
        this.$columns = $columns;
        this.getSelectedTaskId = getSelectedTaskId;
        this.getSelectedColumn = getSelectedColumn;
        this.callbacks = callbacks;

        this.keyDown = this.keyDown.bind(this);
        document.addEventListener("keydown", this.keyDown);
    }

    keyDown(event) {
        if (!event.altKey) return;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

        const selectedTaskId = this.getSelectedTaskId();
        const selectedColumn = this.getSelectedColumn();

        const trigger = (condition, action) => {
            if (condition) {
                event.preventDefault();
                action();
            }
        };
        // alt g -delete ; alt e - edit
        const taskKeyMap = {
            g: () => trigger(selectedTaskId && this.callbacks.onDelete, () => this.callbacks.onDelete(selectedTaskId)),
            e: () => trigger(selectedTaskId && selectedColumn && this.callbacks.onEdit, () => this.callbacks.onEdit(selectedTaskId, selectedColumn))
        };

        // Column shortcuts
        const columnKeyMap = {
            q: "to-do",
            t: "doing",
            y: "done"
        };

        // Arrow keys
        const arrowMap = {
            arrowleft: ["onMoveLeft", "onMoveColumnLeft"],
            arrowright: ["onMoveRight", "onMoveColumnRight"]
        };

        const key = event.key.toLowerCase();
        if (taskKeyMap[key]) {
            taskKeyMap[key]();
            return;
        }
        if (columnKeyMap[key]) {
            this.showAddTaskForm(columnKeyMap[key]);
            return;
        }
        if (arrowMap[key]) {
            this.handleArrowKey(event, arrowMap[key]);
        }
    }
    handleArrowKey(event, [taskCallback, columnCallback]) {
        const trigger = (condition, action) => {
            if (condition) {
                event.preventDefault();
                action();
            }
        };
        if (event.ctrlKey) {
            trigger(this.callbacks[columnCallback], () => this.callbacks[columnCallback]());
        } else {
            trigger(this.callbacks[taskCallback], () => this.callbacks[taskCallback]());
        }
    }

    showAddTaskForm(columnName) {
    const $targetColumn = Array.from(this.$columns).find($col => $col.dataset.column === columnName);
    if (!$targetColumn) return;

    // Remove existing visible forms
    $targetColumn.querySelectorAll(".add-task-section:not([hidden])").forEach($f => $f.remove());

    // Clone from template
    const $template = document.querySelector("#ADD_TASK_FORM_TEMPLATE");
    const $clone = $template.content.cloneNode(true);
    const $form = $clone.querySelector(".add-task-section");
    const $tasksContainer = $targetColumn.querySelector(".tasks");
    $targetColumn.insertBefore($form, $tasksContainer);

    // select elements inside the form
    const $ = (selector) => $form.querySelector(selector);
    const $titleInput = $(".task-name-form");
    const $noteInput = $(".task-note-form");
    const $priorityInput = $(".task-priority-input");
    const $cancelButton = $(".cancel-btn");
    const $confirmButton = $(".confirm-btn");

    // Show the form and focus the first input
    $form.hidden = false;
    $titleInput.focus();

    $cancelButton.addEventListener("click", () => 
        resetAddForm($form, $titleInput, $noteInput, $priorityInput)
    );

    $confirmButton.addEventListener("click", () => {
        if ($titleInput.value.trim() === "") return;

        tasks = createNewTask(
            tasks,
            $titleInput.value,
            $noteInput.value,
            $targetColumn.dataset.column,
            $priorityInput.value
        );

        saveTasks(tasks);
        resetAddForm($form, $titleInput, $noteInput, $priorityInput);
        refreshTaskDisplay();
        });
    }
    detach() {
        document.removeEventListener("keydown", this.keyDown);
    }
}

function initializeKeyboardShortcuts(params) {
    return new KeyboardManager(
        params.$columns,
        params.getSelectedTaskId,
        params.getSelectedColumn,
        params.callbacks
    );
}