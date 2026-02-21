import { DomUtils } from '../../utils/dom-utils.js';

export class Task {
    static currentEditing = null;

    constructor(data, onUpdate, onDelete, onFocus) {
        this.data = data;
        this.onUpdate = onUpdate;
        this.onDelete = onDelete;
        this.onFocus = onFocus;
        this.$element = null;
        this.isEditing = false;
    }

    render() {
        const { id, title, note, priority } = this.data;
        const $card = DomUtils.createElement('div', 'task', { 
            'draggable': 'true', 
            'tabindex': '0',
            'data-id': id 
        });

        $card.innerHTML = this.isEditing ? this.getEditHtml() : this.getViewHtml();
        this.attachEvents($card);
        this.$element = $card;
        return $card;
    }

    getViewHtml() {
        const { title, note, priority } = this.data;
        return `
            <div class="task__title">${title}</div>
            ${note ? `<div class="task__note">${note}</div>` : ''}
            <div class="task__priority task__priority--${priority.toLowerCase()}">${priority}</div>
            <div class="task__actions">
                <button class="btn-edit">Edit</button>
                <button class="btn-delete">Delete</button>
            </div>
        `;
    }

    getEditHtml() {
        return `
            <input type="text" class="task__edit-input" value="${this.data.title}" />
            <div class="task__edit-actions">
                <button class="btn-save">Save</button>
                <button class="btn-cancel">Cancel</button>
            </div>
        `;
    }

    attachEvents($card) {
        if (this.isEditing) {
            const $saveBtn = $card.querySelector('.btn-save');
            const $cancelBtn = $card.querySelector('.btn-cancel');
            if (!$saveBtn || !$cancelBtn) {
                throw new Error('Save or cancel button not found in editing task');
            }
            $saveBtn.addEventListener('click', () => this.handleSave());
            $cancelBtn.addEventListener('click', () => this.handleCancel());
        } else {
            const $editBtn = $card.querySelector('.btn-edit');
            const $deleteBtn = $card.querySelector('.btn-delete');
            if (!$editBtn || !$deleteBtn) {
                throw new Error('Edit or delete button not found in task');
            }
            $editBtn.addEventListener('click', () => this.handleEdit());
            $deleteBtn.addEventListener('click', () => this.onDelete(this.data.id));
        }
        $card.addEventListener('focus', () => this.onFocus(this.data.id));
        $card.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', this.data.id));
    }

    handleEdit() {
        if (Task.currentEditing && Task.currentEditing !== this) {
            Task.currentEditing.cancelEdit();
        }
        Task.currentEditing = this;
        this.isEditing = true;
        this.$element.innerHTML = this.getEditHtml();
        this.attachEvents(this.$element);
        const $input = this.$element.querySelector('.task__edit-input');
        if (!$input) {
            throw new Error('Edit input not found after rendering edit HTML');
        }
        $input.focus();
    }

    cancelEdit() {
        this.isEditing = false;
        this.updateView();
    }

    handleSave() {
        const $input = this.$element.querySelector('.task__edit-input');
        if (!$input) {
            throw new Error('Edit input not found during save');
        }
        const newTitle = $input.value.trim();
        if (newTitle) {
            this.data.title = newTitle;
            this.onUpdate(this.data);
        }
        this.isEditing = false;
        this.updateView();
        Task.currentEditing = null;
    }

    handleCancel() {
        this.isEditing = false;
        this.updateView();
        Task.currentEditing = null;
    }

    updateView() {
        this.$element.innerHTML = this.getViewHtml();
        this.attachEvents(this.$element);
    }
}   