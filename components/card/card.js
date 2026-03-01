import { makeElement } from '../../utils/dom-utils.js';
import { buildViewSection, buildEditSection } from './card-dom.js';
import { attachDragListeners } from './card-drag.js';

export class Card {
    static currentEditing = null;
    constructor({ id, title, note, column, priority, order }, callbacks) {
        this.id = id;
        this.title = title;
        this.note = note;
        this.column = column;
        this.priority = priority;
        this.order = order;
        this.callbacks = callbacks;
        this.$element = null;
        this.$viewSection = null;
        this.$editSection = null;
        this.isDragging = false;
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.touchStartTime = 0;
        this.initialTransform = '';
        this.dragThreshold = 20; 
        this.dragTimeThreshold = 300; 
    }

    render($container) {
        this.$element = this.createElement();
        $container.appendChild(this.$element);
        this.attachEventListeners();
    }

    createElement() {
        const $card = makeElement('div', 'card');
        $card.dataset.taskId = this.id;
        $card.tabIndex = 0;
        if (!('ontouchstart' in window)) $card.draggable = true;

        this.$viewSection = buildViewSection(this);

        const editRefs = buildEditSection(this);
        this.$editSection = editRefs.$section;
        this.$editTitleInput = editRefs.$titleInput;
        this.$editNoteInput = editRefs.$noteInput;
        this.$editPrioritySelect = editRefs.$prioritySelect;
        this.$editSection.hidden = true;

        $card.appendChild(this.$viewSection);
        $card.appendChild(this.$editSection);

        return $card;
    }

    attachEventListeners() {
        this.$viewSection.querySelector('.card__edit-button')
            .addEventListener('click', (e) => this.handleEditClick(e));
        this.$viewSection.querySelector('.card__delete-button')
            .addEventListener('click', (e) => this.handleDeleteClick(e));
        this.$editSection.querySelector('.card__save-button')
            .addEventListener('click', () => this.handleSaveEdit());
        this.$editSection.querySelector('.card__cancel-button')
            .addEventListener('click', () => this.hideEditForm());
        this.$editSection.addEventListener('keydown', (e) => this.handleEditKeyDown(e));
        this.$element.addEventListener('focus', () => this.handleFocus());
        attachDragListeners(this);
    }

    handleEditClick(e) {
        e.stopPropagation();
        this.showEditForm();
    }

    handleDeleteClick(e) {
        e.stopPropagation();
        this.callbacks.onDelete(this.id);
    }

    handleEditKeyDown(e) {
        if (e.key === 'Escape') this.hideEditForm();
    }

    handleFocus() {
        const $column = this.$element.closest('.column');
        this.callbacks.onFocus(this.id, $column);
    }

    handleSaveEdit() {
        const title = this.$editTitleInput.value.trim();
        if (!title) return;
        this.callbacks.onEdit(this.id, {
            title,
            note: this.$editNoteInput.value,
            priority: this.$editPrioritySelect.value,
        });
        this.hideEditForm();
    }

    showEditForm() {
        if (Card.currentEditing && Card.currentEditing !== this)
            Card.currentEditing.hideEditForm();
        Card.currentEditing = this;
        this.$viewSection.hidden = true;
        this.$editSection.hidden = false;
        this.$editTitleInput.focus();
    }

    hideEditForm() {
        this.$viewSection.hidden = false;
        this.$editSection.hidden = true;
        this.$element?.focus();
        if (Card.currentEditing === this) Card.currentEditing = null;
    }

    static fromJSON(data, callbacks) {
        return new Card(data, callbacks);
    }
}