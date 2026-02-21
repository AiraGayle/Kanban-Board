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

        // alt + keys
        const keyMap = {
            "d": () => trigger(selectedTaskId && this.callbacks.onDelete, () => this.callbacks.onDelete(selectedTaskId)),
            "e": () => trigger(selectedTaskId && selectedColumn && this.callbacks.onEdit, () => this.callbacks.onEdit(selectedTaskId, selectedColumn)),
            "a": () => trigger(selectedColumn, () => {
                const $addForm = selectedColumn.querySelector(".add-task-section");
                if ($addForm) {
                    $addForm.hidden = false;
                    $addForm.querySelector(".task-name-form").focus();
                }
            })
        };

        if (keyMap[event.key.toLowerCase()]) {
            keyMap[event.key.toLowerCase()]();
            return;
        }

        // Arrow keys
        const arrowActions = {
            "arrowleft": ["onMoveLeft", "onMoveColumnLeft"],
            "arrowright": ["onMoveRight", "onMoveColumnRight"]
        };

        if (arrowActions[event.key.toLowerCase()]) {
            const [taskCallback, colCall] = arrowActions[event.key.toLowerCase()];
            if (event.ctrlKey) {
                trigger(this.callbacks[colCall], () => this.callbacks[colCall]());
            } else {
                trigger(this.callbacks[taskCallback], () => this.callbacks[taskCallback]());
            }
        }
    }

    detach() {
        document.removeEventListener("keydown", this.keyDown);
    }
}

export function initializeKeyboardShortcuts(params) {
    return new KeyboardManager(
        params.$columns,
        params.getSelectedTaskId,
        params.getSelectedColumn,
        params.callbacks
    );
}