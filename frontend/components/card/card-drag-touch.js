import { startAutoScroll, stopAutoScroll, setLatestClientY } from './card-drag-scroll.js';
import { setActiveCard, moveCardVisually, startCardDrag, resetDragState, dispatchDropEvent } from './card-drag-visual.js';

export function handleTouchStart(card, e) {
    const touch            = e.touches[0];
    card.touchStartX       = touch.clientX;
    card.touchStartY       = touch.clientY;
    card.touchStartTime    = Date.now();
    card.initialTransform  = card.$element.style.transform || '';
    card.dragDirection     = null;
    card._lastTouchClientX = touch.clientX;
}

export function handleTouchMove(card, e) {
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

    updateDragDirection(card, absDeltaX, absDeltaY);
    if (card.dragDirection === 'horizontal') e.preventDefault();
    if (isDragThresholdMet(absDeltaX, absDeltaY, card.dragThreshold)) startCardDrag(card);
}

export function handleTouchEnd(card, e) {
    stopAutoScroll();
    setLatestClientY(null);
    setActiveCard(null);
    if (!card.isDragging) return;
    resetDragState(card);
    dispatchDropEvent(card, e.changedTouches[0]);
    card.callbacks.clearDraggedTaskId();
}

export function handleTouchCancel(card) {
    stopAutoScroll();
    setLatestClientY(null);
    setActiveCard(null);
    resetDragState(card);
    card.callbacks.clearDraggedTaskId();
}

function updateDragDirection(card, absDeltaX, absDeltaY) {
    if (card.dragDirection || (absDeltaX <= 4 && absDeltaY <= 4)) return;
    card.dragDirection = absDeltaX >= absDeltaY ? 'horizontal' : 'vertical';
}

function isDragThresholdMet(absDeltaX, absDeltaY, threshold) {
    return absDeltaX > threshold || absDeltaY > threshold;
}