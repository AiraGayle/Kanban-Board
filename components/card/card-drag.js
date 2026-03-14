const SCROLL_ZONE  = 80;
const SCROLL_SPEED = 12;

let scrollRAF      = null;
let latestClientY  = null;
let activeCard     = null;

function handleResize() {
    if (!activeCard?.isDragging) return;

    const card = activeCard;
    const rect = card.$element.getBoundingClientRect();

    card._dragOffsetX   = rect.left;
    card._dragOffsetY   = rect.top;
    card._originalWidth = rect.width;

    card.$element.style.width = `${rect.width}px`;

    if (latestClientY !== null) {
        card.touchStartX  = card._lastTouchClientX ?? card.touchStartX;
        card.touchStartY  = latestClientY;
        card._dragOffsetX = rect.left;
        card._dragOffsetY = rect.top;
    }
}

window.addEventListener('resize', handleResize);

export function attachDragListeners(card) {
    const mq = window.matchMedia('(max-width: 768px)');

    function applyListeners(mobile) {
        // Always clean up all listeners first
        card.$element.removeEventListener('touchstart',  card._onTouchStart);
        card.$element.removeEventListener('touchmove',   card._onTouchMove);
        card.$element.removeEventListener('touchend',    card._onTouchEnd);
        card.$element.removeEventListener('touchcancel', card._onTouchCancel);
        card.$element.removeEventListener('dragstart',   card._onDragStart);
        card.$element.removeEventListener('dragend',     card._onDragEnd);

        if (mobile) {
            card._onTouchStart  = (e) => handleTouchStart(card, e);
            card._onTouchMove   = (e) => handleTouchMove(card, e);
            card._onTouchEnd    = (e) => handleTouchEnd(card, e);
            card._onTouchCancel = ()  => handleTouchCancel(card);

            card.$element.addEventListener('touchstart',  card._onTouchStart,  { passive: false });
            card.$element.addEventListener('touchmove',   card._onTouchMove,   { passive: false });
            card.$element.addEventListener('touchend',    card._onTouchEnd,    { passive: false });
            card.$element.addEventListener('touchcancel', card._onTouchCancel, { passive: false });

            // Desktop: make sure element is not draggable when in mobile mode
            card.$element.draggable = false;
        } else {
            // Desktop: use native drag API, no fixed positioning involved
            card.$element.draggable = true;

            card._onDragStart = (e) => {
                // Create a clean ghost image from the card itself
                const ghost = card.$element.cloneNode(true);
                ghost.style.position = 'fixed';
                ghost.style.top      = '-9999px';
                ghost.style.width    = `${card.$element.offsetWidth}px`;
                ghost.style.opacity  = '0.8';
                document.body.appendChild(ghost);

                e.dataTransfer.setDragImage(ghost, e.offsetX, e.offsetY);
                e.dataTransfer.effectAllowed = 'move';

                // Clean up ghost after drag starts (browser has captured it)
                requestAnimationFrame(() => document.body.removeChild(ghost));

                card.callbacks.onDragStart(card.id);
            };

            card._onDragEnd = () => {
                card.callbacks.clearDraggedTaskId?.();
            };

            card.$element.addEventListener('dragstart', card._onDragStart);
            card.$element.addEventListener('dragend',   card._onDragEnd);
        }
    }

    applyListeners(mq.matches);
    mq.addEventListener('change', (e) => applyListeners(e.matches));
}

function handleTouchStart(card, e) {
    card.touchStartX       = e.touches[0].clientX;
    card.touchStartY       = e.touches[0].clientY;
    card.touchStartTime    = Date.now();
    card.initialTransform  = card.$element.style.transform || '';
    card.dragDirection     = null;
    card._lastTouchClientX = e.touches[0].clientX;
}

function handleTouchMove(card, e) {
    const touch     = e.touches[0];
    const deltaX    = touch.clientX - card.touchStartX;
    const deltaY    = touch.clientY - card.touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    card._lastTouchClientX = touch.clientX;

    if (card.isDragging) {
        moveCardVisually(card, deltaX, deltaY);
        startAutoScroll(touch.clientY);
        e.preventDefault();
        return;
    }

    if (!card.dragDirection && (absDeltaX > 4 || absDeltaY > 4)) {
        card.dragDirection = absDeltaX >= absDeltaY ? 'horizontal' : 'vertical';
    }

    if (card.dragDirection === 'horizontal') e.preventDefault();

    if (isDragThresholdMet(absDeltaX, absDeltaY, card.dragThreshold))
        startCardDrag(card);
}

function handleTouchEnd(card, e) {
    stopAutoScroll();
    latestClientY = null;
    activeCard    = null;
    if (!card.isDragging) return;
    resetDragState(card);
    dispatchDropEvent(card, e.changedTouches[0]);
    card.callbacks.clearDraggedTaskId();
}

function handleTouchCancel(card) {
    stopAutoScroll();
    latestClientY = null;
    activeCard    = null;
    resetDragState(card);
    card.callbacks.clearDraggedTaskId();
}

function moveCardVisually(card, deltaX, deltaY) {
    if (card.isDragging) {
        card.$element.style.left = `${card._dragOffsetX + deltaX}px`;
        card.$element.style.top  = `${card._dragOffsetY + deltaY}px`;
    } else {
        card.$element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
}

function isDragThresholdMet(absDeltaX, absDeltaY, threshold) {
    return absDeltaX > threshold || absDeltaY > threshold;
}

function startCardDrag(card) {
    card.isDragging = true;
    activeCard      = card;
    card.callbacks.onDragStart(card.id);
    card.$element.classList.add('card--dragging');

    const rect = card.$element.getBoundingClientRect();
    card._originalParent      = card.$element.parentNode;
    card._originalNextSibling = card.$element.nextSibling;
    card._dragOffsetX         = rect.left;
    card._dragOffsetY         = rect.top;
    card._originalWidth       = rect.width;

    card.$element.style.position = 'fixed';
    card.$element.style.left     = `${rect.left}px`;
    card.$element.style.top      = `${rect.top}px`;
    card.$element.style.width    = `${rect.width}px`;
    card.$element.style.zIndex   = '9999';
    card.$element.style.margin   = '0';
    document.body.appendChild(card.$element);
}

function resetDragState(card) {
    card.isDragging = false;
    card.$element.classList.remove('card--dragging');

    if (card._originalParent) {
        card._originalParent.insertBefore(card.$element, card._originalNextSibling);
    }

    card.$element.style.position  = '';
    card.$element.style.left      = '';
    card.$element.style.top       = '';
    card.$element.style.width     = '';
    card.$element.style.zIndex    = '';
    card.$element.style.margin    = '';
    card.$element.style.transform = card.initialTransform;

    card._originalParent      = null;
    card._originalNextSibling = null;
    card._lastTouchClientX    = null;
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
    const speed          = calculateScrollSpeed(distFromTop, distFromBottom);
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