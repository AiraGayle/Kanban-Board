// Main — initializes the Kanban app

document.addEventListener('DOMContentLoaded', () => {
    try {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches)
            document.body.classList.add('dark-mode');
        else document.body.classList.add('light-mode');

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