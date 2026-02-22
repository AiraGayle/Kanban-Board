// DOM Utilities — shared element creation helper

function makeElement(tag, className, text) {
    const $el = document.createElement(tag);
    if (className) $el.className = className;
    if (text) $el.textContent = text;
    return $el;
}