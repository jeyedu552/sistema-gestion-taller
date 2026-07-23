"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./tracing");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const auth_middleware_1 = require("./middlewares/auth.middleware");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const metrics_1 = require("./lib/metrics");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(rateLimit_middleware_1.globalLimiter);
// Endpoint de monitoreo
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', metrics_1.registry.contentType);
    res.end(await metrics_1.registry.metrics());
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date() });
});
// ==========================================
// CONFIGURACIÓN DE RUTAS PROXY
// ==========================================
// 1. Redirigir Autenticación (Puerto 3001) - Aplicamos limitador estricto
// Express hace app.use('/api/auth') y ya quita ese prefijo de req.url
// Por eso montamos el proxy con el path completo original usando router
app.use('/api/auth', rateLimit_middleware_1.authLimiter, (req, res, next) => {
    // Restauramos el path completo para que el proxy lo reescriba correctamente
    req.url = req.originalUrl;
    next();
}, (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.MS_AUTH_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    on: {
        proxyReq: (proxyReq, req) => {
            metrics_1.proxyRequestCounter.inc({ target_service: 'ms-auth', method: req.method });
        }
    }
}));
// 2. Redirigir Operaciones (Puerto 3002) - RUTA PROTEGIDA (Validamos JWT primero)
app.use('/api/operaciones', auth_middleware_1.requireAuth, // <--- Seguridad Centralizada
(req, res, next) => {
    req.url = req.originalUrl;
    next();
}, (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.MS_OPERACIONES_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/api/operaciones': '' },
    on: {
        proxyReq: (proxyReq, req) => {
            metrics_1.proxyRequestCounter.inc({ target_service: 'ms-operaciones', method: req.method });
            // Pasamos los headers inyectados por el middleware al microservicio
            if (req.headers['x-user-id'])
                proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
            if (req.headers['x-user-role'])
                proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
        }
    }
}));
// 3. Redirigir WebSockets Chat (Puerto 3003)
app.use('/socket.io', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.MS_CHAT_URL || 'http://localhost:3003',
    changeOrigin: true,
    ws: true, // Soporte explícito para WebSockets
    on: {
        proxyReq: (proxyReq, req) => {
            metrics_1.proxyRequestCounter.inc({ target_service: 'ms-chat', method: 'WS' });
        }
    }
}));
app.listen(PORT, () => {
    console.log(`🛡️ [api-gateway]: Recepcionista corriendo en http://localhost:${PORT}`);
});
