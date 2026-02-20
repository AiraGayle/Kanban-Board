// Main - Initialize and coordinate the Kanban Board
import Board from "./Board.js";
import Column from "./Column.js";

// State
const board = new Board(["to-do", "doing", "done"]);
let selectedColumn = null;
let selectedTaskId = null;

const $columns = getColumns();
const $addTaskFormTemplate = document.querySelector("#ADD_TASK_FORM_TEMPLATE");
const $editTaskFormTemplate = document.querySelector("#EDIT_TASK_FORM_TEMPLATE");

// Initialize the application
function initializeApp() {
    const savedTasks = loadTasks();
    if (savedTasks.length > 0) {
        board.setTasks(savedTasks);
    }
    setupAddTaskForms();
    setupEditTaskForms();
    setupColumnListeners();
    setupDragAndDrop();
    setupKeyboardShortcuts();
    refreshTaskDisplay();
}

function setupColumnListeners() {
    $columns.forEach($column => {
        $column.addEventListener("click", () => {
            selectedColumn = $column;
        });
    });
}

function setupAddTaskForms() {
    $columns.forEach($column => {
        const $addButton = $column.querySelector(".column__add-button");
        const $template = document.querySelector("#ADD_TASK_FORM_TEMPLATE");
        const $clone = $template.content.cloneNode(true);
        const $form = $clone.querySelector(".add-task-section");
        const $tasksContainer = $column.querySelector(".tasks");
        $column.insertBefore($form, $tasksContainer);

        const $titleInput = $form.querySelector(".task-name-form");
        const $noteInput = $form.querySelector(".task-note-form");
        const $cancelButton = $form.querySelector(".cancel-btn");
        const $confirmButton = $form.querySelector(".confirm-btn");
        const $priorityInput = $form.querySelector(".task-priority-input");

        $addButton.addEventListener("click", () => {
            $form.hidden = false;
            $titleInput.focus();
            console.log("click")
        });

        $cancelButton.addEventListener("click", () => {
            resetAddForm($form, $titleInput, $noteInput, $priorityInput);
        });

        $confirmButton.addEventListener("click", () => {
            if ($titleInput.value.trim() === "") return;

            board.addTask(
                $titleInput.value,
                $noteInput.value,
                $column.dataset.column,
                $priorityInput.value
            );

            saveTasks(board.getAllTasks());
            resetAddForm($form, $titleInput, $noteInput, $priorityInput);
            refreshTaskDisplay();
        });
    });
}

function resetAddForm($form, $titleInput, $noteInput, $priorityInput) {
    $form.hidden = true;
    $titleInput.value = "";
    $noteInput.value = "";
    $priorityInput.value = "Low";
}

function setupEditTaskForms() {
    $columns.forEach($column => {
        const $editTemplate = document.querySelector("#EDIT_TASK_FORM_TEMPLATE");
        const $editClone = $editTemplate.content.cloneNode(true);
        const $editForm = $editClone.querySelector(".edit-task-section");
        const $tasksContainer = $column.querySelector(".tasks");
        $column.insertBefore($editForm, $tasksContainer);
    });
}

function showEditForm(taskId, $column) {
    const task = board.getTask(taskId)
    if (!task) return;

    document.querySelectorAll(".edit-task-section:not([hidden])").forEach($form => {
        $form.hidden = true;
    });

    const $editForm = $column.querySelector(".edit-task-section");
    const $editTitleInput = $editForm.querySelector(".edit-task-name-form");
    const $editNoteInput = $editForm.querySelector(".edit-task-note-form");
    const $editPriorityInput = $editForm.querySelector(".edit-task-priority-input");
    const $editConfirmButton = $editForm.querySelector(".edit-confirm-btn");
    const $editCancelButton = $editForm.querySelector(".edit-cancel-btn");

    $editTitleInput.value = task.title;
    $editNoteInput.value = task.note;
    $editPriorityInput.value = task.priority;

    $editForm.hidden = false;
    $editTitleInput.focus();

    const $newConfirmButton = $editConfirmButton.cloneNode(true);
    $editConfirmButton.parentNode.replaceChild($newConfirmButton, $editConfirmButton);

    const $newCancelButton = $editCancelButton.cloneNode(true);
    $editCancelButton.parentNode.replaceChild($newCancelButton, $editCancelButton);

    $newConfirmButton.addEventListener("click", () => {
        if ($editTitleInput.value.trim() === "") return;

        board.updateTask(
            taskId,
            $editTitleInput.value,
            $editNoteInput.value,
            $editPriorityInput.value
        );

        saveTasks(board.getAllTasks());
        $editForm.hidden = true;
        refreshTaskDisplay();
    });

    $newCancelButton.addEventListener("click", () => {
        $editForm.hidden = true;
    });
}

function setupDragAndDrop() {
    initializeDragAndDrop($columns, (taskId, columnName, insertIndex) => {
        board.moveTask(taskId, columnName, insertIndex)
        saveTasks(board.getAllTasks());
        refreshTaskDisplay();
    });
}

function setupKeyboardShortcuts() {
    initializeKeyboardShortcuts((event) => {
        const callbacks = {
            onDelete: (taskId) => {
                tasks = Board.deleteTask(taskId);
                saveTasks(board.getAllTasks());
                refreshTaskDisplay();
            },
            onEdit: (taskId, $column) => {
                showEditForm(taskId, $column);
            },
            onMoveRight: () => {
                if (selectedTaskId) {
                    const columnArray = Array.from($columns);
                    const currentIndex = columnArray.indexOf(selectedColumn);
                    const newIndex = currentIndex + 1;

                    if (newIndex < columnArray.length) {
                        const newColumnName = columnArray[newIndex].dataset.column;
                       board.moveTask(selectedTaskId, newColumnName);
                        saveTasks(board.getAllTasks());
                        refreshTaskDisplay();
                    }
                }
            },
            onMoveLeft: () => {
                if (selectedTaskId) {
                    const columnArray = Array.from($columns);
                    const currentIndex = columnArray.indexOf(selectedColumn);
                    const newIndex = currentIndex - 1;

                    if (newIndex >= 0) {
                        const newColumnName = columnArray[newIndex].dataset.column;
                        board.moveTask(selectedTaskId, newColumnName);
                        saveTasks(board.getAllTasks());
                        refreshTaskDisplay();
                    }
                }
            },
            onMoveColumnRight: () => {
                selectedColumn = moveFocusBetweenColumns($columns, selectedColumn, 1) || selectedColumn;
            },
            onMoveColumnLeft: () => {
                selectedColumn = moveFocusBetweenColumns($columns, selectedColumn, -1) || selectedColumn;
            }
        };

        handleKeyboardInput(event, $columns, selectedColumn, selectedTaskId, callbacks);
    });
}

function refreshTaskDisplay() {
    const createTaskElementFn = (task) => {
        return createTaskElement(
            task,
            (taskObj, $col) => showEditForm(taskObj.id, $col),
            (taskId) => {
                board.deleteTask(taskId);
                saveTasks(board.getAllTasks());
                refreshTaskDisplay();
            },
            (taskId) => setDraggedTaskId(taskId),
            (taskId, $col) => {
                selectedTaskId = taskId;
                selectedColumn = $col;
            }
        );
    };

    displayTasks($columns, board.getAllTasks(), createTaskElementFn);
}

// Expose a global function for move buttons
window.moveTaskButton = function(taskId, newColumn) {
    board.moveTask(taskId, newColumn);
    saveTasks(board.getAllTasks());
    refreshTaskDisplay();
};

// Start the app when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);
