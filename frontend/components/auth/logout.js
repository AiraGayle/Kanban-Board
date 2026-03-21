export function Logout(onLogout) {
    const btn = document.createElement("button");
    btn.textContent = "Logout";
    btn.classList.add("logout-btn"); 

    btn.addEventListener("click", () => {
        localStorage.removeItem("token"); 
        onLogout();
    });

    return btn;
}