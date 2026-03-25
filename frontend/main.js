// Main — initializes auth gate, then the Kanban app
import Board from './components/board/Board.js';
import { Auth } from './components/auth/Auth.js';
import * as AuthService from './services/AuthService.js';

const isMobile = window.matchMedia('(max-width: 768px)');

function updateShortcutsVisibilityMQ(e) {
    const $shortcuts = document.querySelector('.board__shortcuts');
    if (!$shortcuts) return;
    $shortcuts.style.display = e.matches ? 'none' : '';
}

function showBoard() {
    document.getElementById('AUTH_CONTAINER').hidden  = true;
    document.getElementById('BOARD_CONTAINER').hidden = false;
}

function showAuth() {
    document.getElementById('AUTH_CONTAINER').hidden  = false;
    document.getElementById('BOARD_CONTAINER').hidden = true;
}

function renderUserBadge(user) {
    const $badge = document.getElementById('USER_BADGE');
    if ($badge) $badge.textContent = user.email;
}

function initBoard(user) {
    const $boardColumns = document.getElementById('BOARD_COLUMNS');
    if (!$boardColumns) throw new Error('Board columns container not found in DOM');

    renderUserBadge(user);
    showBoard();

    const board = new Board();
    board.init($boardColumns);
}

function initAuth() {
    const $authContainer = document.getElementById('AUTH_CONTAINER');
    $authContainer.innerHTML = '';

    const auth = new Auth((user) => {
        initBoard(user);
    });

    auth.render($authContainer);
    showAuth();
}

function handleLogout() {
    AuthService.logout();
    initAuth();
}

isMobile.addEventListener('change', updateShortcutsVisibilityMQ);
updateShortcutsVisibilityMQ(isMobile);

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('LOGOUT_BTN').addEventListener('click', handleLogout);

    const user = AuthService.getUser();

    if (AuthService.isLoggedIn() && user) {
        try {
            initBoard(user);
        } catch (error) {
            // Token may be stale — clear it and fall back to login
            console.error('Board init failed:', error.message);
            AuthService.logout();
            initAuth();
        }
    } else {
        initAuth();
    }
});