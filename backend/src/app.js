// App — Express configuration, middleware, and route registration
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const authRoutes = require('./routes/auth-routes');
const taskRoutes = require('./routes/task-routes');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || '*',
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
