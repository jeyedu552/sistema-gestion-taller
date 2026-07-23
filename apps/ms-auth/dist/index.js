"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./tracing");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const metrics_1 = require("./lib/metrics");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Middleware global para contar peticiones HTTP (Métricas Prometheus)
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
// Endpoint de métricas para Grafana
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', metrics_1.registry.contentType);
    res.end(await metrics_1.registry.metrics());
});
// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ms-auth', timestamp: new Date() });
});
// Rutas de negocio
app.use('/auth', auth_routes_1.default);
app.listen(PORT, () => {
    console.log(`🚀 [ms-auth]: Servidor corriendo en http://localhost:${PORT}`);
});
