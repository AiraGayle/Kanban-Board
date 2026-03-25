// App — Express configuration, middleware, and route registration
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const authRoutes = require('./routes/auth-routes');
const taskRoutes = require('./routes/task-routes');

const app = express();

const ALLOWED_ORIGINS = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

function isOriginAllowed(origin) {
    if (ALLOWED_ORIGINS.length === 0) return true;
    return ALLOWED_ORIGINS.includes(origin);
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || isOriginAllowed(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Health check — useful for ngrok and integration testing
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth',  authRoutes);
app.use('/tasks', taskRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

module.exports = app;