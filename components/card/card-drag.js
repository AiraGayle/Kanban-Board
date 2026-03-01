const SCROLL_ZONE  = 80;
const SCROLL_SPEED = 12;

let scrollRAF     = null;
let latestClientY = null;

export function attachDragListeners(card) {
    const isMobile = 'ontouchstart' in window;
    if (isMobile) {
        card.$element.addEventListener('touchstart',  (e) => handleTouchStart(card, e),  { passive: false });
        card.$element.addEventListener('touchmove',   (e) => handleTouchMove(card, e),   { passive: false });
        card.$element.addEventListener('touchend',    (e) => handleTouchEnd(card, e),    { passive: false });
        card.$element.addEventListener('touchcancel', ()  => handleTouchCancel(card),    { passive: false });
    } else {
        card.$element.addEventListener('dragstart', () => card.callbacks.onDragStart(card.id));
    }
}

function handleTouchStart(card, e) {
    card.touchStartX      = e.touches[0].clientX;
    card.touchStartY      = e.touches[0].clientY;
    card.touchStartTime   = Date.now();
    card.initialTransform = card.$element.style.transform || '';
    card.dragDirection    = null;
}

function handleTouchMove(card, e) {
    const touch     = e.touches[0];
    const deltaX    = touch.clientX - card.touchStartX;
    const deltaY    = touch.clientY - card.touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (card.isDragging) {
        moveCardVisually(card, deltaX, deltaY);
        startAutoScroll(touch.clientY);
        e.preventDefault();
        return;
    }

    // Lock movement direction once intent is clear (4px dead zone)
    if (!card.dragDirection && (absDeltaX > 4 || absDeltaY > 4)) {
        card.dragDirection = absDeltaX >= absDeltaY ? 'horizontal' : 'vertical';
    }

    // Block the board's horizontal scroll immediately when the intent is horizontal,
    // so the finger movement is captured as a card drag instead of a page scroll
    if (card.dragDirection === 'horizontal') e.preventDefault();

    if (isDragThresholdMet(absDeltaX, absDeltaY, card.dragThreshold))
        startCardDrag(card);
}

function handleTouchEnd(card, e) {
    stopAutoScroll();
    latestClientY = null;
    if (!card.isDragging) return;
    resetDragState(card);
    dispatchDropEvent(card, e.changedTouches[0]);
    card.callbacks.clearDraggedTaskId();
}

function handleTouchCancel(card) {
    stopAutoScroll();
    latestClientY = null;
    resetDragState(card);
    card.callbacks.clearDraggedTaskId();
}

function moveCardVisually(card, deltaX, deltaY) {
    card.$element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
}

function isDragThresholdMet(absDeltaX, absDeltaY, threshold) {
    return absDeltaX > threshold || absDeltaY > threshold;
}

function startCardDrag(card) {
    card.isDragging = true;
    card.callbacks.onDragStart(card.id);
    card.$element.classList.add('card--dragging');
}

function resetDragState(card) {
    card.isDragging = false;
    card.$element.classList.remove('card--dragging');
    card.$element.style.transform = card.initialTransform;
}

function dispatchDropEvent(card, touch) {
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

function startAutoScroll(clientY) {
    latestClientY = clientY;
    if (!scrollRAF) scrollRAF = requestAnimationFrame(autoScrollTick);
}

function stopAutoScroll() {
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    scrollRAF = null;
}

function autoScrollTick() {
    if (latestClientY == null) return;
    const distFromTop    = latestClientY;
    const distFromBottom = window.innerHeight - latestClientY;
    const speed = calculateScrollSpeed(distFromTop, distFromBottom);
    if (speed !== 0) {
        window.scrollBy(0, speed);
        scrollRAF = requestAnimationFrame(autoScrollTick);
    } else {
        stopAutoScroll();
    }
}

function calculateScrollSpeed(distFromTop, distFromBottom) {
    if (distFromTop < SCROLL_ZONE)    return -SCROLL_SPEED * (1 - distFromTop / SCROLL_ZONE);
    if (distFromBottom < SCROLL_ZONE) return  SCROLL_SPEED * (1 - distFromBottom / SCROLL_ZONE);
    return 0;
}