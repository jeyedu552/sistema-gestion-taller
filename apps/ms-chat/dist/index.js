"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./tracing");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const SocketServer_1 = require("./socket/SocketServer");
const metrics_1 = require("./lib/metrics");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Endpoint de métricas para Grafana
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', metrics_1.registry.contentType);
    res.end(await metrics_1.registry.metrics());
});
// Endpoint de salud del servicio
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ms-chat', timestamp: new Date() });
});
// Crear el servidor HTTP puro (requerido por Socket.io)
const httpServer = (0, http_1.createServer)(app);
// Inicializar el servidor de WebSockets inyectándole el servidor HTTP
const socketServer = new SocketServer_1.SocketServer(httpServer);
httpServer.listen(PORT, () => {
    console.log(`🚀 [ms-chat]: Servidor HTTP y WebSockets corriendo en http://localhost:${PORT}`);
});
