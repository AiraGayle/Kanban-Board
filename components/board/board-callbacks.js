(function() {
    Board.prototype.buildColumnCallbacks = function() {
        return {
            onAdd:             (data)              => this.handleAddTask(data),
            onColumnClick:     (name)              => { this.selectedColumnName = name; },
            onDrop:            (id, col, idx)      => this.handleDrop(id, col, idx),
            getDraggedTaskId:  ()                  => this.draggedTaskId,
            clearDraggedTaskId: ()                 => { this.draggedTaskId = null; },
        };
    };

    Board.prototype.buildCardCallbacks = function() {
        return {
            onEdit:       (taskId, data)   => this.handleEditTask(taskId, data),
            onDelete:     (taskId)         => this.handleDeleteTask(taskId),
            onDragStart:  (taskId)         => { this.draggedTaskId = taskId; },
            onFocus:      (taskId, $col)   => this.handleCardFocus(taskId, $col),
        };
    };
})();