export default function Register({ onSuccess, onBack }) {
    const container = document.createElement("div");
    container.classList.add("register");

    container.innerHTML = `
        <h2>Register</h2>
        <input type="text" id="username" placeholder="Username" />
        <input type="email" id="email" placeholder="Email" />
        <input type="password" id="password" placeholder="Password" />
        <button id="registerBtn">Register</button>
        <p id="msg" style="color:red;"></p>
        <button id="backLogin">Back to Login</button>
    `;

    const msg = container.querySelector("#msg");

    container.querySelector("#registerBtn").addEventListener("click", async () => {
        const username = container.querySelector("#username").value;
        const email = container.querySelector("#email").value;
        const password = container.querySelector("#password").value;

        try {
            const res = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });

            const text = await res.text();  
            console.log(res.status, text); 

             let data;
                try {
                    data = JSON.parse(text);     
                } catch {
                    data = { message: text };  
                }
          

            if (res.ok) {
                localStorage.setItem("token", data.token);
                onSuccess(); 
            } else {
                msg.textContent = data.message || "Registration failed";
            }

        } catch (err) {
            console.error("Registration error:", err);
            msg.textContent = "Registration failed oh no";
        }
    });

    container.querySelector("#backLogin")
        .addEventListener("click", onBack);

    return container;
}