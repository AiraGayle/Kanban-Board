// Column — encapsulates a kanban column's DOM, add form, card rendering, drag-drop

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

class Column {
    constructor({ name, label, colorModifier }, callbacks) {
        this.name = name;
        this.label = label;
        this.colorModifier = colorModifier;
        this.callbacks = callbacks;
        this.$element = null;
        this.$tasks = null;
        this.$addForm = null;
    }

    render($container) {
        this.$element = this.createElement();
        $container.appendChild(this.$element);
        this.attachEventListeners();
    }

    createElement() {
        const $col = makeElement('div', 'column');
        $col.dataset.column = this.name;

        this.$addForm = this.createAddForm();
        this.$tasks = makeElement('div', 'column__tasks');

        $col.appendChild(this.createHeader());
        $col.appendChild(this.$addForm);
        $col.appendChild(this.$tasks);

        return $col;
    }

    createHeader() {
        const $header = makeElement('div', `column__header column__header--${this.colorModifier}`);
        $header.appendChild(makeElement('h3', 'column__title', this.label));

        const $addBtn = makeElement('button', 'btn column__add-button', '+');
        $addBtn.setAttribute('aria-label', 'Add Task');
        $header.appendChild($addBtn);

        return $header;
    }

    createAddForm() {
        const $form = makeElement('div', 'column__add-form');
        $form.hidden = true;

        this.$titleInput = makeElement('input', 'column__form-input');
        this.$titleInput.type = 'text';
        this.$titleInput.placeholder = 'Enter Task';

        this.$noteInput = makeElement('textarea', 'column__form-textarea');
        this.$noteInput.placeholder = 'Add a note';

        this.$prioritySelect = makeElement('select', 'column__form-select');
        PRIORITY_OPTIONS.forEach(level => {
            const $opt = makeElement('option', '', level);
            $opt.value = level;
            this.$prioritySelect.appendChild($opt);
        });

        const $priorityRow = makeElement('div', 'column__priority-row');
        $priorityRow.appendChild(makeElement('label', 'column__priority-label', 'Priority:'));
        $priorityRow.appendChild(this.$prioritySelect);

        $form.appendChild(this.$titleInput);
        $form.appendChild(this.$noteInput);
        $form.appendChild($priorityRow);
        $form.appendChild(this.createAddFormActions());

        $form.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideAddForm();
        });

        return $form;
    }

    createAddFormActions() {
        const $actions = makeElement('div', 'column__form-actions');

        const $cancelBtn = makeElement('button', 'btn column__cancel-button', 'Cancel');
        $cancelBtn.type = 'button';
        $cancelBtn.addEventListener('click', () => this.hideAddForm());

        const $confirmBtn = makeElement('button', 'btn column__confirm-button', 'Add Task');
        $confirmBtn.type = 'button';
        $confirmBtn.addEventListener('click', () => this.handleConfirmAdd());

        $actions.appendChild($cancelBtn);
        $actions.appendChild($confirmBtn);
        return $actions;
    }

    handleConfirmAdd() {
        const title = this.$titleInput.value.trim();
        if (!title) return;

        this.callbacks.onAdd({
            title,
            note: this.$noteInput.value,
            priority: this.$prioritySelect.value,
            column: this.name,
        });

        this.resetAddForm();
        this.hideAddForm();
    }

    resetAddForm() {
        this.$titleInput.value = '';
        this.$noteInput.value = '';
        this.$prioritySelect.value = 'Low';
    }

    showAddForm() {
        this.$addForm.hidden = false;
        this.$titleInput.focus();
    }

    hideAddForm() {
        this.$addForm.hidden = true;
    }

    displayCards(cards, cardCallbacks) {
        this.$tasks.innerHTML = '';

        if (cards.length === 0) {
            this.$tasks.appendChild(makeElement('p', 'column__empty-state', 'No tasks yet'));
            return;
        }

        cards.forEach(cardData => Card.fromJSON(cardData, cardCallbacks).render(this.$tasks));
    }

    attachEventListeners() {
        this.$element.querySelector('.column__add-button')
            .addEventListener('click', () => this.showAddForm());

        this.$element.addEventListener('click', () => {
            this.callbacks.onColumnClick(this.name);
        });

        this.$tasks.addEventListener('dragover', (e) => e.preventDefault());
        this.$tasks.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Mobile touch drop support
        this.$element.addEventListener('cardTouchDrop', (e) => this.handleTouchDrop(e));
    }

    handleDrop(e) {
        e.preventDefault();
        const taskId = this.callbacks.getDraggedTaskId();
        if (!taskId) return;

        const insertIndex = this.calculateDropIndex(e, taskId);
        this.callbacks.onDrop(taskId, this.name, insertIndex);
        this.callbacks.clearDraggedTaskId();
    }

    handleTouchDrop(e) {
        const { taskId, clientY, element } = e.detail;
        
        // Create a fake event for calculateDropIndex
        const fakeEvent = {
            target: element,
            clientY: clientY
        };
        
        const insertIndex = this.calculateDropIndex(fakeEvent, taskId);
        this.callbacks.onDrop(taskId, this.name, insertIndex);
        this.callbacks.clearDraggedTaskId();
    }

    calculateDropIndex(e, taskId) {
        const $others = [...this.$tasks.querySelectorAll('.card')]
            .filter(el => el.dataset.taskId !== String(taskId));

        const $target = e.target.closest('.card');
        const isValidTarget = $target
            && $target.closest('.column__tasks') === this.$tasks
            && $target.dataset.taskId !== String(taskId);

        if (!isValidTarget) return $others.length;

        const idx = $others.indexOf($target);
        if (idx === -1) return $others.length;

        const { top, height } = $target.getBoundingClientRect();
        return e.clientY < top + height / 2 ? idx : idx + 1;
    }
}