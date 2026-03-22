
//login.js
export default function Login({ onSuccess, onRegister }) {
    const container = document.createElement("div");
    
    container.classList.add("login");

    container.innerHTML = `
        <h2>Login</h2>
        <input type="email" id="email" placeholder="Email" />
        <input type="password" id="password" placeholder="Password" />
        <button id="loginBtn">Login</button>
        <p id="errorMsg" style="color:red;"></p>
        <p>No account?</p>
        <button id="goRegister">Register</button>
    `;

    const errorMsg = container.querySelector("#errorMsg");
    

    container.querySelector("#loginBtn").addEventListener("click", async () => {
        const email = container.querySelector("#email").value;
        const password = container.querySelector("#password").value;

        try {
            const res = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.token);
                onSuccess(); // go to board
            } else {
                errorMsg.textContent = data.message;
            }

        } catch (err) {
            errorMsg.textContent = "Log In Failed";
        }
    });

    container.querySelector("#goRegister")
        .addEventListener("click", onRegister);

    return container;
}