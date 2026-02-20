export default class Column {
    constructor(name) {
        this.name = name;
        this.tasks = [];
    }

    addTask(task) {
        task.order = this.tasks.length;
        task.column = this.name;
        this.tasks.push(task);
    }

    removeTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.reorder();
    }

    getTask(taskId) {
        return this.tasks.find(t => t.id === taskId);
    }

    insertTaskAt(task, index) {
        index = Math.max(0, Math.min(index, this.tasks.length));
        this.tasks.splice(index, 0, task);
        this.reorder();
    }

    reorder() {
        this.tasks.forEach((t, i) => t.order = i);
    }
}