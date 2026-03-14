// Board — coordinates columns, tasks state, keyboard shortcuts
import { Column } from '../column/Column.js';
import { TaskService } from '../../services/TaskService.js';
import { StorageService } from '../../services/StorageService.js';
import { buildColumnCallbacks, buildCardCallbacks } from './board-callbacks.js';
import { setupKeyboard } from './board-keyboard.js';
import * as TaskHandlers from './board-tasks.js';

const COLUMN_CONFIGS = [
    { name: 'to-do',  label: 'To do', colorModifier: 'todo'  },
    { name: 'doing',  label: 'Doing', colorModifier: 'doing' },
    { name: 'done',   label: 'Done',  colorModifier: 'done'  },
];

export default class Board {
    constructor() {
        this.taskService = new TaskService();
        this.storageService = new StorageService();
        this.tasks = this.storageService.load();
        this.columns = [];
        this.selectedColumnName = COLUMN_CONFIGS[0].name;
        this.selectedCardId = null;
        this.draggedTaskId = null;
    }

    init($container) {
        setupKeyboard(this);
        this.setupColumns($container);
        this.refresh();
    }

    setupColumns($container) {
        COLUMN_CONFIGS.forEach(config => {
            const col = new Column(config, buildColumnCallbacks(this));
            col.render($container);
            this.columns.push(col);
        });
    }

    saveAndRefresh() {
        this.storageService.save(this.tasks);
        this.refresh();
    }

    refresh() {
        const cardCallbacks = buildCardCallbacks(this);
        this.columns.forEach(col => {
            const cards = this.taskService.getByColumn(this.tasks, col.name);
            col.displayCards(cards, cardCallbacks);
        });
    }

    getSelectedColumn() {
        return this.columns.find(c => c.name === this.selectedColumnName);
    }

    getSelectedColumnIndex() {
        return this.columns.findIndex(c => c.name === this.selectedColumnName);
    }

    handleAddTask(data) { 
        TaskHandlers.handleAddTask(this, data); 
    }

    handleEditTask(id, data) { 
        TaskHandlers.handleEditTask(this, id, data); 
    }

    handleDeleteTask(id) { 
        TaskHandlers.handleDeleteTask(this, id); 
    }

    handleDrop(id, col, idx) { 
        TaskHandlers.handleDrop(this, id, col, idx); 
    }

    handleCardFocus(id, $col) { 
        TaskHandlers.handleCardFocus(this, id, $col); 
    }
}