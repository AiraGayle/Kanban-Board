// Auth — login and register form component
import * as AuthService from '../../services/AuthService.js';

function createField(labelText, inputId, type) {
    const $field = document.createElement('div');
    $field.className = 'auth__field';

    const $label = document.createElement('label');
    $label.className = 'auth__label';
    $label.htmlFor = inputId;
    $label.textContent = labelText;

    const $input = document.createElement('input');
    $input.className = 'auth__input';
    $input.type = type;
    $input.id = inputId;
    $input.required = true;

    $field.append($label, $input);
    return { $field, $input };
}

function createErrorParagraph() {
    const $error = document.createElement('p');
    $error.className = 'auth__error';
    $error.setAttribute('role', 'alert');
    return $error;
}

function setLoading($button, isLoading) {
    $button.disabled = isLoading;
    $button.textContent = isLoading ? 'Please wait…' : $button.dataset.label;
}

export class Auth {
    constructor(onAuthSuccess) {
        this.onAuthSuccess = onAuthSuccess;
        this.isLoginMode = true;
        this.$container = null;
    }

    render($container) {
        this.$container = $container;
        this.buildForm();
    }

    buildForm() {
        this.$container.innerHTML = '';

        const $card = document.createElement('div');
        $card.className = 'auth__card';

        const $title = document.createElement('h1');
        $title.className = 'auth__title';
        $title.textContent = 'Kanban Board';

        const $subtitle = document.createElement('p');
        $subtitle.className = 'auth__subtitle';
        $subtitle.textContent = this.isLoginMode ? 'Sign in to your account' : 'Create an account';

        const $form = document.createElement('form');
        $form.className = 'auth__form';
        $form.noValidate = true;

        const { $field: $emailField, $input: $emailInput } = createField('Email', 'AUTH_EMAIL', 'email');
        const { $field: $passField, $input: $passInput } = createField('Password', 'AUTH_PASSWORD', 'password');

        const $error = createErrorParagraph();

        const $submit = document.createElement('button');
        $submit.className = 'auth__submit';
        $submit.type = 'submit';
        $submit.dataset.label = this.isLoginMode ? 'Sign in' : 'Create account';
        $submit.textContent = $submit.dataset.label;

        $form.append($emailField, $passField, $error, $submit);

        const $toggle = document.createElement('p');
        $toggle.className = 'auth__toggle';
        $toggle.textContent = this.isLoginMode ? "Don't have an account? " : 'Already have an account? ';

        const $toggleBtn = document.createElement('button');
        $toggleBtn.className = 'auth__toggle-btn';
        $toggleBtn.type = 'button';
        $toggleBtn.textContent = this.isLoginMode ? 'Register' : 'Sign in';
        $toggleBtn.addEventListener('click', () => this.handleToggleMode());

        $toggle.appendChild($toggleBtn);
        $card.append($title, $subtitle, $form, $toggle);
        this.$container.appendChild($card);

        $form.addEventListener('submit', (e) => this.handleSubmit(e, $emailInput, $passInput, $error, $submit));
    }

    async handleSubmit($event, $emailInput, $passInput, $error, $submit) {
        $event.preventDefault();
        $error.textContent = '';
        setLoading($submit, true);

        const email    = $emailInput.value.trim();
        const password = $passInput.value;

        // Only auth API errors are caught here — board init errors must not be swallowed
        let authenticatedUser = null;
        try {
            authenticatedUser = this.isLoginMode
                ? await AuthService.login(email, password)
                : await AuthService.register(email, password);
        } catch (err) {
            $error.textContent = err.message;
            $emailInput.classList.add('auth__input--error');
            $passInput.classList.add('auth__input--error');
        } finally {
            setLoading($submit, false);
        }

        if (authenticatedUser) this.onAuthSuccess(authenticatedUser);
    }

    handleToggleMode() {
        this.isLoginMode = !this.isLoginMode;
        this.buildForm();
    }
}