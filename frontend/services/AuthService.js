// Auth Service — register/login API calls and JWT token management
const API_BASE    = (typeof window !== 'undefined' && window.ENV_API_BASE) || 'http://localhost:3000';
const TOKEN_KEY   = 'auth_token';
const USER_KEY    = 'auth_user';

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        'ngrok-skip-browser-warning': 'true'
    };
}

async function postToAuth(endpoint, body) {
    const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Request failed');

    return data;
}

export function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn() {
    return Boolean(getToken());
}

export async function register(email, password) {
    const data = await postToAuth('register', { email, password });
    saveSession(data.token, data.user);
    return data.user;
}

export async function login(email, password) {
    const data = await postToAuth('login', { email, password });
    saveSession(data.token, data.user);
    return data.user;
}

export function logout() {
    clearSession();
}

export { getHeaders };