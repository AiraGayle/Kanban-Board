import { getToken } from './AuthService.js';

const API_BASE = (typeof window !== 'undefined' && window.ENV_API_BASE) || 'http://localhost:3000';
const WS_BASE  = API_BASE.replace(/^http/, 'ws');

let socket = null;

export function connectWs() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

    const token = getToken();
    if (!token) return;

    socket = new WebSocket(`${WS_BASE}?token=${encodeURIComponent(token)}`);

    socket.addEventListener('open', () => console.log('WS connected'));

    socket.addEventListener('message', ({ data }) => {
        let msg;
        try { msg = JSON.parse(data); } catch { return; }

        if (msg.type === 'TASK_UPDATED') {
            window.dispatchEvent(new CustomEvent('ws:task-updated', { detail: msg.payload }));
        } else if (msg.type === 'TASK_DELETED') {
            window.dispatchEvent(new CustomEvent('ws:task-deleted', { detail: msg.payload }));
        }
    });

    socket.addEventListener('close', (e) => {
        console.log('WS closed, reconnecting in 3s...', e.code);
        socket = null;
        if (e.code !== 4001) setTimeout(connectWs, 3_000);
    });

    socket.addEventListener('error', () => socket?.close());
}

export function disconnectWs() {
    socket?.close();
    socket = null;
}