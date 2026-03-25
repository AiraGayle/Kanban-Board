// Login — entry point for the auth page
import { Auth } from './components/auth/Auth.js';
import * as AuthService from './services/AuthService.js';

document.addEventListener('DOMContentLoaded', () => {
    // Already logged in — skip straight to board
    if (AuthService.isLoggedIn()) {
        window.location.replace('board.html');
        return;
    }

    const $container = document.getElementById('AUTH_CONTAINER');
    const auth = new Auth(() => {
        window.location.replace('board.html');
    });
    auth.render($container);
});