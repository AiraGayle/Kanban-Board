// Main — initializes the Kanban app

document.addEventListener('DOMContentLoaded', () => {
    try {
        document.body.classList.add('dark-mode');

        const $boardColumns = document.getElementById('BOARD_COLUMNS');
        if (!$boardColumns) {
            throw new Error('Board columns container not found in DOM');
        }
        const board = new Board();
        board.init($boardColumns);
    } catch (error) {
        console.error('Application initialization failed:', error.message);
        alert('Failed to initialize the application. Please refresh the page.');
    }
});