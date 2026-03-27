export function attachDesktopListeners(card) {
    card.$element.draggable = true;

    card._onDragStart = (e) => handleDragStart(card, e);
    card._onDragEnd   = ()  => handleDragEnd(card);

    card.$element.addEventListener('dragstart', card._onDragStart);
    card.$element.addEventListener('dragend',   card._onDragEnd);
}

export function detachDesktopListeners(card) {
    card.$element.removeEventListener('dragstart', card._onDragStart);
    card.$element.removeEventListener('dragend',   card._onDragEnd);
    card.$element.draggable = false;
}

function handleDragStart(card, e) {
    const $ghost = buildDragGhost(card.$element, e.offsetX, e.offsetY);
    e.dataTransfer.setDragImage($ghost, e.offsetX, e.offsetY);
    e.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => document.body.removeChild($ghost));
    card.callbacks.onDragStart(card.id);
}

function handleDragEnd(card) {
    card.callbacks.clearDraggedTaskId?.();
}

function buildDragGhost($source, offsetX, offsetY) {
    const $ghost       = $source.cloneNode(true);
    $ghost.style.position = 'fixed';
    $ghost.style.top      = '-9999px';
    $ghost.style.width    = `${$source.offsetWidth}px`;
    $ghost.style.opacity  = '0.8';
    document.body.appendChild($ghost);
    return $ghost;
}