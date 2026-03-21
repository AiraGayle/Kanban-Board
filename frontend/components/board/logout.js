export function Logout() {

    const btn = document.createElement('button');

    btn.textContent='Log Out';
    btn.classList.add('logout-btn');

    return btn;
}