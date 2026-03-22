// Board — coordinates columns, tasks state, keyboard shortcuts
import { Column } from '../column/Column.js';
import { TaskService } from '../../services/TaskService.js';
import { OfflineStorageService } from '../../services/OfflineStorageService.js';
import { SyncService } from '../../services/SyncService.js';
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
        this.storageService = new OfflineStorageService();
        this.syncService = new SyncService(this.storageService);
        this.tasks = [];
        this.columns = [];
        this.selectedColumnName = COLUMN_CONFIGS[0].name;
        this.selectedCardId = null;
        this.draggedTaskId = null;
    }

    async init($container) {
        setupKeyboard(this);
        this.setupColumns($container);

        await this.storageService.initialize();
        this.tasks = (await this.storageService.getAllTasks()).filter(task => !task.deleted);

        await this.syncService.start();
        await this.refresh();
    }

    setupColumns($container) {
        COLUMN_CONFIGS.forEach(config => {
            const col = new Column(config, buildColumnCallbacks(this));
            col.render($container);
            this.columns.push(col);
        });
    }

    async saveAndRefresh() {
        await this.storageService.saveAllTasks(this.tasks);
        await this.refresh();
    }

    async refresh() {
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
        const { tasks, task } = this.taskService.createTask(this.tasks, data);
        this.tasks = tasks;
        await this.saveAndRefresh();
        await this.syncService.queueTaskUpsert(task);
    }

    async handleEditTask(id, data) {
        const result = this.taskService.updateTask(this.tasks, id, data);
        this.tasks = result.tasks;
        const changedTask = result.updatedTask;

        if (changedTask) {
            await this.saveAndRefresh();
            await this.syncService.queueTaskUpsert(changedTask);
        }
    }

    async handleDeleteTask(id) {
        this.tasks = this.taskService.deleteTask(this.tasks, id);
        await this.saveAndRefresh();
        await this.syncService.queueTaskDelete(id);

        const adjacentId = this.findAdjacentCardId(id);
        if (this.selectedCardId === id) this.selectedCardId = null;
        if (adjacentId) this.focusCard(adjacentId);
    }

    async handleDrop(id, col, idx) {
        this.tasks = this.taskService.moveTaskToPosition(this.tasks, id, col, idx);
        await this.saveAndRefresh();
        const movedTask = this.taskService.findById(this.tasks, id);
        if (movedTask) {
            await this.syncService.queueTaskUpsert(movedTask);
        }
    }

    async handleCardFocus(id, $col) {
        this.selectedCardId = id;
        const col = this.columns.find(c => c.$element === $col);
        if (col) this.selectedColumnName = col.name;
    }

    findAdjacentCardId(taskId) {
        const $card = document.querySelector(`.card[data-task-id="${taskId}"]`);
        const $adj = $card?.nextElementSibling ?? $card?.previousElementSibling;
        return $adj?.classList.contains('card') ? $adj.dataset.taskId : null;
    }

    focusCard(taskId) {
        document.querySelector(`.card[data-task-id="${taskId}"]`)?.focus();
    }
}
