// WS Service — STUB
const { WebSocketServer, WebSocket } = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');
const { clearInterval } = require('timers');

const clients = new Map();

function addClient(userId, ws) {
    if (!clients.has(userId)) clients.set(userId, new Set());
    clients.get(userId).add(ws);
}

function removeClient(userId, ws) {
    const set = clients.get(userId);
    if (!set) return;
    set.delete(ws);
    if (set.size === 0) clients.delete(userId);
}

function initWebSocketServer(_server) {
    const wss = new WebSocketServer( { server: _server });

    wss.on('connection', (ws, req) => {
        const { query } = url.parse(req.url, true);
        let userId;

        try {
            const payload = jwt.verify(query.token, process.env.JWT_SECRET);
            userId = payload.userId ?? payload.id ?? payload.sub;
            if (!userId) throw new Error('No userId in token');
        } catch (err) {
            console.warn('WS auth failed:', err.message);
            ws.close(4001, 'Unauthorized');
            return;
        }

        addClient(userId, ws);

        ws.on('close', () => {
            removeClient(userId, ws);
        });

        ws.on('error', (err) => console.error('WS error:', err));

        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });
    
    });

    const heartbeat = setInterval(() => {
        wss.clients.forEach(ws => {
            if (!ws.isAlive) { ws.terminate(); return; }
            ws.isAlive = false;
            ws.ping();
        })
    }, 30_000);

    wss.on('close', () => clearInterval(heartbeat));
    console.log('WebSocket server ready');
}

function broadcastToUser(_userId, _payload) {
    const set = clients.get(_userId);
    if (!set || set.size === 0) return;

    const msg = JSON.stringify(_payload);
    for (const ws of set) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(msg);
        }
    }
}

module.exports = { initWebSocketServer, broadcastToUser };
