import { makeElement } from '../../utils/dom-utils.js';

const PRIORITY_LEVELS = ['Low', 'Medium', 'High'];

export function buildViewSection({ title, note, priority }) {
    const $view = makeElement('div', 'card__view');
    $view.appendChild(makeElement('div', 'card__title', title));
    if (note?.trim())
        $view.appendChild(makeElement('div', 'card__note', note));
    $view.appendChild(buildPriorityBadge(priority));
    $view.appendChild(buildViewActions());
    return $view;
}

export function buildEditSection({ title, note, priority }) {
    const $section  = makeElement('div', 'card__edit-form');
    const $titleInput = buildTitleInput(title);
    const $noteInput  = buildNoteInput(note);
    const $prioritySelect = buildPrioritySelect(priority);

    $section.appendChild($titleInput);
    $section.appendChild($noteInput);
    $section.appendChild(buildPriorityRow($prioritySelect));
    $section.appendChild(buildEditActions());

    return { $section, $titleInput, $noteInput, $prioritySelect };
}

function buildPriorityBadge(priority) {
    return makeElement(
        'div',
        `card__priority card__priority--${priority.toLowerCase()}`,
        `${priority} Priority`
    );
}

function buildViewActions() {
    const $actions  = makeElement('div', 'card__actions');
    const $editBtn  = makeElement('button', 'btn card__edit-button', 'Edit');
    const $deleteBtn = makeElement('button', 'btn card__delete-button', 'Delete');
    $editBtn.setAttribute('aria-label', 'Edit Task');
    $deleteBtn.setAttribute('aria-label', 'Delete Task');
    $actions.appendChild($editBtn);
    $actions.appendChild($deleteBtn);
    return $actions;
}

function buildTitleInput(title) {
    const $input = makeElement('input', 'card__edit-title');
    $input.type = 'text';
    $input.placeholder = 'Enter Task';
    $input.value = title;
    return $input;
}

function buildNoteInput(note) {
    const $textarea = makeElement('textarea', 'card__edit-note');
    $textarea.placeholder = 'Add a note';
    $textarea.value = note ?? '';
    return $textarea;
}

function buildPrioritySelect(selectedPriority) {
    const $select = makeElement('select', 'card__edit-select');
    PRIORITY_LEVELS.forEach(level => {
        const $opt = makeElement('option', '', level);
        $opt.value = level;
        if (level === selectedPriority) $opt.selected = true;
        $select.appendChild($opt);
    });
    return $select;
}

function buildPriorityRow($prioritySelect) {
    const $row = makeElement('div', 'card__priority-row');
    $row.appendChild(makeElement('label', 'card__priority-label', 'Priority:'));
    $row.appendChild($prioritySelect);
    return $row;
}

function buildEditActions() {
    const $actions   = makeElement('div', 'card__form-actions');
    const $cancelBtn = makeElement('button', 'btn card__cancel-button', 'Cancel');
    const $saveBtn   = makeElement('button', 'btn card__save-button', 'Update Task');
    $cancelBtn.type = 'button';
    $saveBtn.type   = 'button';
    $actions.appendChild($cancelBtn);
    $actions.appendChild($saveBtn);
    return $actions;
}