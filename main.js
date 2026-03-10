// Main — initializes the Kanban app
import Board from "./components/board/Board.js";

const isMobile = 'ontouchstart' in window;

if (isMobile) {
  const shortcuts = document.querySelector('.board__shortcuts');
  if (shortcuts) {
    shortcuts.style.display = "none";
  }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const $boardColumns = document.getElementById('BOARD_COLUMNS');

        if (!$boardColumns)
            throw new Error('Board columns container not found in DOM');

        const board = new Board();
        board.init($boardColumns);
    } catch (error) {
        console.error('Application initialization failed:', error.message);
        alert('Failed to initialize the application. Please refresh the page.');
    }
});