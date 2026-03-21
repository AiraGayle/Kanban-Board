import Board from "./Board.js";
import { Logout } from '../auth/logout.js';

export default function BoardScreen({ onLogout }) {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Unauthorized. Please log in.");
        onLogout();
        return document.createElement("div"); 
    }
    
    const container = document.createElement("div");
    container.classList.add("board");

    container.innerHTML = `
        <h1 class="board__title">Kanban Board</h1>
        <p class="board__shortcuts">
            Alt+A: Add | Alt+E: Edit | Alt+D: Delete |
            Alt+←/→: Move card | ←/→: Switch column | ↑/↓: Navigate cards
        </p>
        <div class="board__columns" id="BOARD_COLUMNS"></div>
    `;

    try {
        const $boardColumns = container.querySelector('#BOARD_COLUMNS');

        if (!$boardColumns)
            throw new Error('Board columns container not found in DOM');

        const board = new Board();
        board.init($boardColumns);

        const logoutBtn = Logout(onLogout);
        container.appendChild(logoutBtn);

    } catch (error) {
        console.error('Application initialization failed:', error.message);
        alert('Failed to initialize the application.');
    }

    return container;
}