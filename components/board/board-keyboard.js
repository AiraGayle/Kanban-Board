(function() {
    Board.prototype.setupKeyboard = function() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    };

    Board.prototype.handleKeyDown = function(e) {
        const isInFormField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
        if (isInFormField) return;

        const { altKey, key } = e;

        if (altKey && key === 'a')           return this.handleAddShortcut(e);
        if (altKey && key === 'd')           return this.handleDeleteShortcut(e);
        if (altKey && key === 'e')           return this.handleEditShortcut(e);
        if (altKey && key === 'ArrowRight')  return this.handleMoveCardRight(e);
        if (altKey && key === 'ArrowLeft')   return this.handleMoveCardLeft(e);
        if (!altKey && key === 'ArrowDown')  return this.handleNavigateDown(e);
        if (!altKey && key === 'ArrowUp')    return this.handleNavigateUp(e);
        if (!altKey && key === 'ArrowRight') return this.handleNavigateColumnRight(e);
        if (!altKey && key === 'ArrowLeft')  return this.handleNavigateColumnLeft(e);
    };

    Board.prototype.handleAddShortcut = function(e) {
        e.preventDefault();
        this.getSelectedColumn()?.showAddForm();
    };

    Board.prototype.handleDeleteShortcut = function(e) {
        e.preventDefault();
        if (this.selectedCardId) this.handleDeleteTask(this.selectedCardId);
    };

    Board.prototype.handleEditShortcut = function(e) {
        e.preventDefault();
        if (!this.selectedCardId) return;
        document.querySelector(`.card[data-task-id="${this.selectedCardId}"] .card__edit-button`)?.click();
    };

    Board.prototype.handleMoveCardRight = function(e) {
        e.preventDefault();
        this.moveSelectedCard(1);
    };

    Board.prototype.handleMoveCardLeft = function(e) {
        e.preventDefault();
        this.moveSelectedCard(-1);
    };

    Board.prototype.moveSelectedCard = function(direction) {
        if (!this.selectedCardId) return;

        const currentIndex = this.getSelectedColumnIndex();
        const newIndex = currentIndex + direction;
        const isOutOfBounds = newIndex < 0 || newIndex >= this.columns.length;
        if (isOutOfBounds) return;

        const newColumnName = this.columns[newIndex].name;
        const taskId = this.selectedCardId;

        this.tasks = this.taskService.moveTask(this.tasks, taskId, newColumnName);
        this.selectedColumnName = newColumnName;
        this.saveAndRefresh();

        document.querySelector(`.card[data-task-id="${taskId}"]`)?.focus();
    };

    Board.prototype.handleNavigateDown = function(e) {
        const $active = document.activeElement;
        if (!$active?.classList.contains('card')) return;
        e.preventDefault();
        $active.nextElementSibling?.classList.contains('card')
            && $active.nextElementSibling.focus();
    };

    Board.prototype.handleNavigateUp = function(e) {
        const $active = document.activeElement;
        if (!$active?.classList.contains('card')) return;
        e.preventDefault();
        $active.previousElementSibling?.classList.contains('card')
            && $active.previousElementSibling.focus();
    };

    Board.prototype.handleNavigateColumnRight = function(e) {
        if (!document.activeElement?.classList.contains('card')) return;
        e.preventDefault();
        this.navigateToAdjacentColumn(1);
    };

    Board.prototype.handleNavigateColumnLeft = function(e) {
        if (!document.activeElement?.classList.contains('card')) return;
        e.preventDefault();
        this.navigateToAdjacentColumn(-1);
    };

    Board.prototype.navigateToAdjacentColumn = function(direction) {
        const newIndex = this.getSelectedColumnIndex() + direction;
        const isOutOfBounds = newIndex < 0 || newIndex >= this.columns.length;
        if (isOutOfBounds) return;

        const $firstCard = this.columns[newIndex].$element.querySelector('.card');
        if ($firstCard) $firstCard.focus();
        this.selectedColumnName = this.columns[newIndex].name;
    };
})();