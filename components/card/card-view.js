(function() {
    Card.prototype.createViewSection = function() {
        const $view = makeElement('div', 'card__view');

        $view.appendChild(makeElement('div', 'card__title', this.title));

        if (this.note?.trim()) {
            $view.appendChild(makeElement('div', 'card__note', this.note));
        }

        $view.appendChild(makeElement(
            'div',
            `card__priority card__priority--${this.priority.toLowerCase()}`,
            `${this.priority} Priority`
        ));

        $view.appendChild(this.createActions());
        return $view;
    };

    Card.prototype.createActions = function() {
        const $actions = makeElement('div', 'card__actions');

        const $editBtn = makeElement('button', 'btn card__edit-button', 'Edit');
        $editBtn.setAttribute('aria-label', 'Edit Task');
        $editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showEditForm();
        });

        const $deleteBtn = makeElement('button', 'btn card__delete-button', 'Delete');
        $deleteBtn.setAttribute('aria-label', 'Delete Task');
        $deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.callbacks.onDelete(this.id);
        });

        $actions.appendChild($editBtn);
        $actions.appendChild($deleteBtn);
        return $actions;
    };
})();