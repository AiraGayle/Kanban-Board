import { makeElement } from '../../utils/dom-utils.js';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

export function buildColumn({ name, label, colorModifier }) {
    const $col   = makeElement('div', 'column');
    $col.dataset.column = name;

    const addFormRefs = buildAddForm();
    const $tasks = makeElement('div', 'column__tasks');

    $col.appendChild(buildHeader(label, colorModifier));
    $col.appendChild(addFormRefs.$form);
    $col.appendChild($tasks);

    return { $col, $tasks, ...addFormRefs };
}

function buildHeader(label, colorModifier) {
    const $header = makeElement('div', `column__header column__header--${colorModifier}`);
    const $addBtn = makeElement('button', 'btn column__add-button', '+');
    $addBtn.setAttribute('aria-label', 'Add Task');
    $header.appendChild(makeElement('h3', 'column__title', label));
    $header.appendChild($addBtn);
    return $header;
}

function buildAddForm() {
    const $form           = makeElement('div', 'column__add-form');
    const $titleInput     = buildTextInput('Enter Task');
    const $noteInput      = buildTextarea('Add a note');
    const $prioritySelect = buildPrioritySelect();
    $form.hidden = true;

    $form.appendChild($titleInput);
    $form.appendChild($noteInput);
    $form.appendChild(buildPriorityRow($prioritySelect));
    $form.appendChild(buildAddFormActions());

    return { $form, $titleInput, $noteInput, $prioritySelect };
}

function buildTextInput(placeholder) {
    const $input = makeElement('input', 'column__form-input');
    $input.type = 'text';
    $input.placeholder = placeholder;
    return $input;
}

function buildTextarea(placeholder) {
    const $textarea = makeElement('textarea', 'column__form-textarea');
    $textarea.placeholder = placeholder;
    return $textarea;
}

function buildPrioritySelect() {
    const $select = makeElement('select', 'column__form-select');
    PRIORITY_OPTIONS.forEach(level => {
        const $opt = makeElement('option', '', level);
        $opt.value = level;
        $select.appendChild($opt);
    });
    return $select;
}

function buildPriorityRow($prioritySelect) {
    const $row = makeElement('div', 'column__priority-row');
    $row.appendChild(makeElement('label', 'column__priority-label', 'Priority:'));
    $row.appendChild($prioritySelect);
    return $row;
}

function buildAddFormActions() {
    const $actions    = makeElement('div', 'column__form-actions');
    const $cancelBtn  = makeElement('button', 'btn column__cancel-button', 'Cancel');
    const $confirmBtn = makeElement('button', 'btn column__confirm-button', 'Add Task');
    $cancelBtn.type  = 'button';
    $confirmBtn.type = 'button';
    $actions.appendChild($cancelBtn);
    $actions.appendChild($confirmBtn);
    return $actions;
}