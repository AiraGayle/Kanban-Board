// DOM Utilities — shared element creation helper

export function makeElement(tag, className, text) {
    const $el = document.createElement(tag);
    if (className) $el.className = className;
    if (text !== undefined) $el.textContent = text;
    return $el;
}