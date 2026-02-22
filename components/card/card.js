// Card — encapsulates a single task card's DOM, view/edit toggle, and events

class Card {
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
        
        // Only enable HTML5 drag and drop on desktop
        const isMobile = 'ontouchstart' in window;
        if (!isMobile) {
            $card.draggable = true;
        }
        
        $card.tabIndex = 0;

        this.$viewSection = this.createViewSection();
        this.$editSection = this.createEditSection();
        this.$editSection.hidden = true;

        $card.appendChild(this.$viewSection);
        $card.appendChild(this.$editSection);

        return $card;
    }

    attachEventListeners() {
        const isMobile = 'ontouchstart' in window;
        
        if (isMobile) {
            // Mobile touch drag and drop
            this.$element.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            this.$element.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            this.$element.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
            this.$element.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), { passive: false });
        } else {
            // Desktop HTML5 drag and drop
            this.$element.addEventListener('dragstart', () => this.callbacks.onDragStart(this.id));
        }
        
        this.$element.addEventListener('focus', () => this.handleFocus());
    }

    handleFocus() {
        const $column = this.$element.closest('.column');
        this.callbacks.onFocus(this.id, $column);
    }

    static fromJSON(data, callbacks) {
        return new Card(data, callbacks);
    }
}