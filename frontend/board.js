// Board — entry point for the board page
import Board from './components/board/Board.js';
import * as AuthService from './services/AuthService.js';
import { connectWs, disconnectWs } from './services/ws-client.js';

const isMobile = window.matchMedia('(max-width: 768px)');

function updateShortcutsVisibilityMQ(e) {
    const $shortcuts = document.querySelector('.board__shortcuts');
    if (!$shortcuts) return;
    $shortcuts.style.display = e.matches ? 'none' : '';
}

function handleLogout() {
    disconnectWs();
    AuthService.logout();
    window.location.replace('index.html');
}

isMobile.addEventListener('change', updateShortcutsVisibilityMQ);
updateShortcutsVisibilityMQ(isMobile);

document.addEventListener('DOMContentLoaded', () => {
    // Not logged in — send back to login
    if (!AuthService.isLoggedIn()) {
        window.location.replace('index.html');
        return;
    }

    const user = AuthService.getUser();
    document.getElementById('USER_BADGE').textContent = user?.email ?? '';
    document.getElementById('LOGOUT_BTN').addEventListener('click', handleLogout);

    const $boardColumns = document.getElementById('BOARD_COLUMNS');
    const board = new Board();
    connectWs();
    board.init($boardColumns);
});