import { createElement } from '../../utils/dom-utils.js';

export class TaskForm {
  constructor(onSubmit) {
    this.onSubmit = onSubmit;
    this.$element = null;
    this.$input = null;
  }

  render($container) {
    this.$element = createElement('form', 'task-form');
    this.$input = createElement('input', 'task-form__input', { 
      type: 'text', placeholder: 'Enter new task...', required: true 
    });
    
    const $submitBtn = createElement('button', 'task-form__button', { type: 'submit' }, 'Add Task');
    
    this.$element.append(this.$input, $submitBtn);
    this.attachEvents();
    $container.appendChild(this.$element);
  }

  attachEvents() {
    this.$element.addEventListener('submit', this.handleSubmit.bind(this));
  }

  handleSubmit(event) {
    event.preventDefault();
    if (!this.$input) {
      throw new Error('Input element not found in task form');
    }
    const title = this.$input.value.trim();
    
    if (title) {
      this.onSubmit(title);
      this.$input.value = '';
    }
  }
}