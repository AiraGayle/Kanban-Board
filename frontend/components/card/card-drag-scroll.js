const SCROLL_ZONE  = 80;
const SCROLL_SPEED = 12;

let scrollRAF     = null;
let latestClientY = null;

export function setLatestClientY(value) {
    latestClientY = value;
}

export function startAutoScroll(clientY) {
    latestClientY = clientY;
    if (!scrollRAF) scrollRAF = requestAnimationFrame(autoScrollTick);
}

export function stopAutoScroll() {
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