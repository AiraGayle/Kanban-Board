(function() {
    Board.prototype.handleAddTask = function(taskData) {
        this.tasks = this.taskService.createTask(this.tasks, taskData);
        this.saveAndRefresh();
    };

    Board.prototype.handleEditTask = function(taskId, data) {
        this.tasks = this.taskService.updateTask(this.tasks, taskId, data);
        this.saveAndRefresh();
    };

    Board.prototype.handleDeleteTask = function(taskId) {
        const adjacentId = this.findAdjacentCardId(taskId);
        this.tasks = this.taskService.deleteTask(this.tasks, taskId);
        if (this.selectedCardId === taskId) this.selectedCardId = null;
        this.saveAndRefresh();
        if (adjacentId) document.querySelector(`.card[data-task-id="${adjacentId}"]`)?.focus();
    };

    Board.prototype.handleDrop = function(taskId, column, index) {
        this.tasks = this.taskService.moveTaskToPosition(this.tasks, taskId, column, index);
        this.saveAndRefresh();
    };

    Board.prototype.handleCardFocus = function(taskId, $colEl) {
        this.selectedCardId = taskId;
        const col = this.columns.find(c => c.$element === $colEl);
        if (col) this.selectedColumnName = col.name;
    };

    Board.prototype.findAdjacentCardId = function(taskId) {
        const $card = document.querySelector(`.card[data-task-id="${taskId}"]`);
        const $adj = $card?.nextElementSibling ?? $card?.previousElementSibling;
        return $adj?.classList.contains('card') ? $adj.dataset.taskId : null;
    };
})();