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
        this.tasks = [];
        this.columns = [];
        this.selectedColumnName = COLUMN_CONFIGS[0].name;
        this.selectedCardId = null;
        this.draggedTaskId = null;
    }

    async init($container) {
        setupKeyboard(this);
        this.setupColumns($container);
        this.tasks = await this.storageService.load();
        this.refresh();
    }

    setupColumns($container) {
        COLUMN_CONFIGS.forEach(config => {
            const col = new Column(config, buildColumnCallbacks(this));
            col.render($container);
            this.columns.push(col);
        });
    }

    /**
     * Persist only the tasks that changed, then re-render.
     * @param {object[]} changedTasks - tasks to upsert
     * @param {object}   [deletedTask] - task to soft-delete, if any
     */
    async saveAndRefresh(changedTasks = [], deletedTask = null) {
        const saves = changedTasks.length > 0
            ? this.storageService.saveTasks(changedTasks)
            : Promise.resolve();
        const del = deletedTask
            ? this.storageService.deleteTask(deletedTask)
            : Promise.resolve();
        await Promise.all([saves, del]);
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

    async handleAddTask(data) { 
        await TaskHandlers.handleAddTask(this, data); 
    }

    async handleEditTask(id, data) { 
        await TaskHandlers.handleEditTask(this, id, data); 
    }

    async handleDeleteTask(id) { 
        await TaskHandlers.handleDeleteTask(this, id); 
    }

    async handleDrop(id, col, idx) { 
        await TaskHandlers.handleDrop(this, id, col, idx); 
    }

    handleCardFocus(id, $col) { 
        TaskHandlers.handleCardFocus(this, id, $col); 
    }
}