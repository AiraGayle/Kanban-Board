// Column — encapsulates a kanban column's DOM, add form, card rendering, drag-drop
import { makeElement } from '../../utils/dom-utils.js';
import { Card } from '../card/Card.js';
import { buildColumn } from './column-dom.js';

export class Column {
    constructor({ name, label, colorModifier }, callbacks) {
        this.name = name;
        this.label = label;
        this.colorModifier = colorModifier;
        this.callbacks = callbacks;
        this.$element = null;
        this.$tasks = null;
        this.$form = null;
        this.$titleInput = null;
        this.$noteInput = null;
        this.$prioritySelect = null;
    }

    render($container) {
        const refs = buildColumn({ name: this.name, label: this.label, colorModifier: this.colorModifier });
        this.$element = refs.$col;
        this.$tasks = refs.$tasks;
        this.$form = refs.$form;
        this.$titleInput = refs.$titleInput;
        this.$noteInput = refs.$noteInput;
        this.$prioritySelect = refs.$prioritySelect;
        $container.appendChild(this.$element);
        this.attachEventListeners();
    }

    displayCards(cards, cardCallbacks) {
        this.$tasks.innerHTML = '';
        if (cards.length === 0) {
            this.$tasks.appendChild(makeElement('p', 'column__empty-state', 'No tasks yet'));
            return;
        }
        cards.forEach(data => Card.createCard(data, cardCallbacks).render(this.$tasks));
    }

    showAddForm() {
        this.$form.hidden = false;
        this.$titleInput.focus();
    }

    hideAddForm() {
        this.$form.hidden = true;
    }

    attachEventListeners() {
        this.$element.querySelector('.column__add-button')
            .addEventListener('click', () => this.showAddForm());
        this.$element.querySelector('.column__confirm-button')
            .addEventListener('click', () => this.handleConfirmAdd());
        this.$element.querySelector('.column__cancel-button')
            .addEventListener('click', () => this.hideAddForm());
        this.$element.addEventListener('click', () => this.callbacks.onColumnClick(this.name));
        this.$form.addEventListener('keydown', (e) => this.handleFormKeyDown(e));
        this.$tasks.addEventListener('dragover', (e) => e.preventDefault());
        this.$tasks.addEventListener('drop', (e) => this.handleDrop(e));
        this.$element.addEventListener('cardTouchDrop', (e) => this.handleTouchDrop(e));
    }

    handleConfirmAdd() {
        const title = this.$titleInput.value.trim();
        if (!title) return;

        this.callbacks.onAdd({
            title,
            note: this.$noteInput.value,
            priority: this.$prioritySelect.value,
            column: this.name,
        });

        this.resetAddForm();
        this.hideAddForm();
    }

    handleFormKeyDown(e) {
        if (e.key === 'Escape') this.hideAddForm();
    }

    handleDrop(e) {
        e.preventDefault();
        const taskId = this.callbacks.getDraggedTaskId();
        if (!taskId) return;

        const insertIndex = this.calculateDropIndex(e, taskId);
        this.callbacks.onDrop(taskId, this.name, insertIndex);
        this.callbacks.clearDraggedTaskId();
    }

    handleTouchDrop(e) {
        const { taskId, clientY, element } = e.detail;
        const insertIndex = this.calculateDropIndex({ target: element, clientY }, taskId);
        this.callbacks.onDrop(taskId, this.name, insertIndex);
        this.callbacks.clearDraggedTaskId();
    }

    calculateDropIndex(e, taskId) {
        const $others = getOtherCards(this.$tasks, taskId);
        const $target = getValidDropTarget(e.target, this.$tasks, taskId);
        if (!$target) return $others.length;
        return getInsertIndex($others, $target, e.clientY);
    }

    resetAddForm() {
        this.$titleInput.value     = '';
        this.$noteInput.value      = '';
        this.$prioritySelect.value = 'Low';
    }
}

function getOtherCards($tasks, taskId) {
    return [...$tasks.querySelectorAll('.card')]
        .filter($el => $el.dataset.taskId !== String(taskId));
}

function getValidDropTarget($target, $tasks, taskId) {
    const $card = $target.closest?.('.card');
    const isValid = $card
        && $card.closest('.column__tasks') === $tasks
        && $card.dataset.taskId !== String(taskId);
    return isValid ? $card : null;
}

function getInsertIndex($others, $target, clientY) {
    const idx = $others.indexOf($target);
    if (idx === -1) return $others.length;
    const { top, height } = $target.getBoundingClientRect();
    return clientY < top + height / 2 ? idx : idx + 1;
}