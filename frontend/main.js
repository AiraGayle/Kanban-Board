    // Main — initializes the Kanban app

    import Login from "./components/auth/login.js";
    import Register from "./components/auth/register.js";
    import BoardScreen from "./components/board/boardScreen.js";

    let app;

    function render(view) {
        app.innerHTML = '';
        app.appendChild(view);
    }

    function showLogin() {
        render(Login({
            onSuccess: () => showBoard(),
            onRegister: () => showRegister()
        }));
    }

    function showRegister() {
        render(Register({
            onSuccess: () => showBoard(),
            onBack: () => showLogin()
        }));
    }

    function showBoard() {
        render(BoardScreen({
            onLogout: () => showLogin()
        }));
    }

    const isMobile = window.matchMedia("(max-width: 768px)");

    function updateShortcutsVisibilityMQ(e) {
        const shortcuts = document.querySelector('.board__shortcuts');
        if (!shortcuts) return;

        shortcuts.style.display = e.matches ? "none" : "";
    }

    isMobile.addEventListener("change", updateShortcutsVisibilityMQ);
    updateShortcutsVisibilityMQ(isMobile);

    document.addEventListener("DOMContentLoaded", () => {

        app = document.getElementById('app');

        const isLoggedIn = localStorage.getItem("token"); 

        if (isLoggedIn) {
            showBoard();
        } else {
            showLogin();
        }
    });