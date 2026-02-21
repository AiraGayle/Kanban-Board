export default class Card {
    constructor({ id = Date.now(), title, note = "", column, priority = "Low", order = 0 }) {
        this.id = id;
        this.title = title.trim();
        this.note = note.trim();
        this.column = column;
        this.priority = priority;
        this.order = order;
    }

    update(title, note, priority) {
        this.title = title.trim();
        this.note = note.trim();
        this.priority = priority;
    }
}