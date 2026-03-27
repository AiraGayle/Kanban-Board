export let activeCard = null;

export function setActiveCard(card) {
    activeCard = card;
}

export function moveCardVisually(card, deltaX, deltaY) {
    if (card.isDragging) {
        card.$element.style.left = `${card._dragOffsetX + deltaX}px`;
        card.$element.style.top  = `${card._dragOffsetY + deltaY}px`;
    } else {
        card.$element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
}

export function startCardDrag(card) {
    const rect = card.$element.getBoundingClientRect();

    card.isDragging           = true;
    card._originalParent      = card.$element.parentNode;
    card._originalNextSibling = card.$element.nextSibling;
    card._dragOffsetX         = rect.left;
    card._dragOffsetY         = rect.top;
    card._originalWidth       = rect.width;

    setActiveCard(card);
    card.callbacks.onDragStart(card.id);
    card.$element.classList.add('card--dragging');
    applyDragStyles(card.$element, rect);
    document.body.appendChild(card.$element);
}

export function resetDragState(card) {
    card.isDragging = false;
    card.$element.classList.remove('card--dragging');
    restoreCardPosition(card);
    clearDragStyles(card.$element, card.initialTransform);
    clearDragRefs(card);
}

export function dispatchDropEvent(card, touch) {
    const $target = document.elementFromPoint(touch.clientX, touch.clientY);
    const $column = $target?.closest('.column__tasks')?.closest('.column');
    if (!$column) return;
    $column.dispatchEvent(new CustomEvent('cardTouchDrop', {
        detail: {
            taskId:     card.id,
            columnName: $column.dataset.column,
            clientY:    touch.clientY,
            element:    $target,
        },
    }));
}

function applyDragStyles($el, rect) {
    $el.style.position = 'fixed';
    $el.style.left     = `${rect.left}px`;
    $el.style.top      = `${rect.top}px`;
    $el.style.width    = `${rect.width}px`;
    $el.style.zIndex   = '9999';
    $el.style.margin   = '0';
}

function restoreCardPosition(card) {
    if (card._originalParent) {
        card._originalParent.insertBefore(card.$element, card._originalNextSibling);
    }
}

function clearDragStyles($el, initialTransform) {
    $el.style.position  = '';
    $el.style.left      = '';
    $el.style.top       = '';
    $el.style.width     = '';
    $el.style.zIndex    = '';
    $el.style.margin    = '';
    $el.style.transform = initialTransform;
}

function clearDragRefs(card) {
    card._originalParent      = null;
    card._originalNextSibling = null;
    card._lastTouchClientX    = null;
}