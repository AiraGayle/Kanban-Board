// Check the user's system preference
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Set initial theme based on preference
if (prefersDark) {
    document.body.classList.add('dark-mode');
} else {
    document.body.classList.add('light-mode');
}
