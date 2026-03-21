// Server — creates HTTP server and attaches WebSocket + cron stubs
require('dotenv').config();
const http = require('http');
const app  = require('./app');
const { initWebSocketServer } = require('./services/ws-service');
const { initCronJobs }        = require('./services/cron-service');

const PORT   = process.env.PORT || 3000;
const server = http.createServer(app);

initWebSocketServer(server);
initCronJobs();

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});