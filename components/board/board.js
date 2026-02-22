// Board — coordinates columns, tasks state, keyboard shortcuts

const COLUMN_CONFIGS = [
    { name: 'to-do',  label: 'To do', colorModifier: 'todo'  },
    { name: 'doing',  label: 'Doing', colorModifier: 'doing' },
    { name: 'done',   label: 'Done',  colorModifier: 'done'  },
];

class Board {
    constructor() {
        this.taskService = new TaskService();
        this.storageService = new StorageService();
        try {
            this.tasks = this.storageService.load();
        } catch (error) {
            console.error('Error loading tasks:', error.message);
            this.tasks = [];
        }
        this.columns = [];
        this.selectedColumnName = COLUMN_CONFIGS[0].name;
        this.selectedCardId = null;
        this.draggedTaskId = null;
    }

    init($container) {
        this.setupColumns($container);
        this.setupKeyboard();
        this.refresh();
    }

    setupColumns($container) {
        COLUMN_CONFIGS.forEach(config => {
            const col = new Column(config, this.buildColumnCallbacks());
            col.render($container);
            this.columns.push(col);
        });
    }

    saveAndRefresh() {
        try {
            this.storageService.save(this.tasks);
        } catch (error) {
            console.error('Error saving tasks:', error.message);
            alert('Failed to save tasks. Please check your browser storage settings.');
        }
        this.refresh();
    }

    refresh() {
        const cardCallbacks = this.buildCardCallbacks();
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
}