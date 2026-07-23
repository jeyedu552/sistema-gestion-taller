"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./tracing");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const metrics_1 = require("./lib/metrics");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.on('finish', () => {
        metrics_1.httpRequestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        });
    });
    next();
});
// Endpoint Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', metrics_1.registry.contentType);
    res.end(await metrics_1.registry.metrics());
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ms-operaciones', timestamp: new Date() });
});
const routes_1 = __importDefault(require("./routes"));
// Rutas de negocio centralizadas (incluye /vehicles y /orders)
app.use('/', routes_1.default);
app.listen(PORT, () => {
    console.log(`🚀 [ms-operaciones]: Servidor corriendo en http://localhost:${PORT}`);
});
