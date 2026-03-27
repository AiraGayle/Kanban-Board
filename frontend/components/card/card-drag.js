import { setLatestClientY }                               from './card-drag-scroll.js';
import { activeCard }                                      from './card-drag-visual.js';
import { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel } from './card-drag-touch.js';
import { attachDesktopListeners, detachDesktopListeners }  from './card-drag-desktop.js';

window.addEventListener('resize', handleResize);

export function attachDragListeners(card) {
    const $mq = window.matchMedia('(max-width: 768px)');
    applyListeners(card, $mq.matches);
    $mq.addEventListener('change', (e) => applyListeners(card, e.matches));
}

function applyListeners(card, isMobile) {
    detachAllListeners(card);
    if (isMobile) attachTouchListeners(card);
    else          attachDesktopListeners(card);
}

function attachTouchListeners(card) {
    card._onTouchStart  = (e) => handleTouchStart(card, e);
    card._onTouchMove   = (e) => handleTouchMove(card, e);
    card._onTouchEnd    = (e) => handleTouchEnd(card, e);
    card._onTouchCancel = ()  => handleTouchCancel(card);

    card.$element.addEventListener('touchstart',  card._onTouchStart,  { passive: false });
    card.$element.addEventListener('touchmove',   card._onTouchMove,   { passive: false });
    card.$element.addEventListener('touchend',    card._onTouchEnd,    { passive: false });
    card.$element.addEventListener('touchcancel', card._onTouchCancel, { passive: false });
}

function detachAllListeners(card) {
    card.$element.removeEventListener('touchstart',  card._onTouchStart);
    card.$element.removeEventListener('touchmove',   card._onTouchMove);
    card.$element.removeEventListener('touchend',    card._onTouchEnd);
    card.$element.removeEventListener('touchcancel', card._onTouchCancel);
    detachDesktopListeners(card);
}

function handleResize() {
    if (!activeCard?.isDragging) return;
    syncDragPositionOnResize(activeCard);
}

function syncDragPositionOnResize(card) {
    const rect = card.$element.getBoundingClientRect();

    card._dragOffsetX   = rect.left;
    card._dragOffsetY   = rect.top;
    card._originalWidth = rect.width;
    card.$element.style.width = `${rect.width}px`;

    if (card._lastTouchClientX != null) {
        setLatestClientY(card._dragOffsetY);
        card.touchStartX  = card._lastTouchClientX;
        card.touchStartY  = card._dragOffsetY;
    }
}