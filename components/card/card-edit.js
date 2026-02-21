(function() {
    const PRIORITY_LEVELS = ['Low', 'Medium', 'High'];

    Card.prototype.createEditSection = function() {
        const $edit = makeElement('div', 'card__edit-form');

        this.$editTitleInput = makeElement('input', 'card__edit-title');
        this.$editTitleInput.type = 'text';
        this.$editTitleInput.placeholder = 'Enter Task';
        this.$editTitleInput.value = this.title;

        this.$editNoteInput = makeElement('textarea', 'card__edit-note');
        this.$editNoteInput.placeholder = 'Add a note';
        this.$editNoteInput.value = this.note ?? '';

        $edit.appendChild(this.$editTitleInput);
        $edit.appendChild(this.$editNoteInput);
        $edit.appendChild(this.createPriorityRow());
        $edit.appendChild(this.createEditActions());

        $edit.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideEditForm();
        });

        return $edit;
    };

    Card.prototype.createPriorityRow = function() {
        const $row = makeElement('div', 'card__priority-row');
        $row.appendChild(makeElement('label', 'card__priority-label', 'Priority:'));

        this.$editPrioritySelect = makeElement('select', 'card__edit-select');
        PRIORITY_LEVELS.forEach(level => {
            const $opt = makeElement('option', '', level);
            $opt.value = level;
            if (level === this.priority) $opt.selected = true;
            this.$editPrioritySelect.appendChild($opt);
        });

        $row.appendChild(this.$editPrioritySelect);
        return $row;
    };

    Card.prototype.createEditActions = function() {
        const $actions = makeElement('div', 'card__form-actions');

        const $cancelBtn = makeElement('button', 'btn card__cancel-button', 'Cancel');
        $cancelBtn.type = 'button';
        $cancelBtn.addEventListener('click', () => this.hideEditForm());

        const $saveBtn = makeElement('button', 'btn card__save-button', 'Update Task');
        $saveBtn.type = 'button';
        $saveBtn.addEventListener('click', () => this.handleSaveEdit());

        $actions.appendChild($cancelBtn);
        $actions.appendChild($saveBtn);
        return $actions;
    };

    Card.prototype.handleSaveEdit = function() {
        const title = this.$editTitleInput.value.trim();
        if (!title) return;

        this.callbacks.onEdit(this.id, {
            title,
            note: this.$editNoteInput.value,
            priority: this.$editPrioritySelect.value,
        });
        this.hideEditForm();
    };

    Card.prototype.showEditForm = function() {
        if (Card.currentEditing && Card.currentEditing !== this) {
            Card.currentEditing.hideEditForm();
        }
        Card.currentEditing = this;
        this.$viewSection.hidden = true;
        this.$editSection.hidden = false;
        this.$editTitleInput.focus();
    };

    Card.prototype.hideEditForm = function() {
        this.$viewSection.hidden = false;
        this.$editSection.hidden = true;
        this.$element?.focus();
        if (Card.currentEditing === this) {
            Card.currentEditing = null;
        }
    };
})();