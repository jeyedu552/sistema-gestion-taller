import './tracing';
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { requireAuth } from './middlewares/auth.middleware';
import { globalLimiter, authLimiter } from './middlewares/rateLimit.middleware';
import { registry, proxyRequestCounter } from './lib/metrics';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(globalLimiter);

// Endpoint de monitoreo
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
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
app.use(
  '/api/auth',
  authLimiter,
  (req: any, res: any, next: any) => {
    // Restauramos el path completo para que el proxy lo reescriba correctamente
    req.url = req.originalUrl;
    next();
  },
  createProxyMiddleware({
    target: process.env.MS_AUTH_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    on: {
      proxyReq: (proxyReq: any, req: any) => {
        proxyRequestCounter.inc({ target_service: 'ms-auth', method: req.method });
      }
    }
  })
);

// 2. Redirigir Operaciones (Puerto 3002) - RUTA PROTEGIDA (Validamos JWT primero)
app.use(
  '/api/operaciones',
  requireAuth, // <--- Seguridad Centralizada
  (req: any, res: any, next: any) => {
    req.url = req.originalUrl;
    next();
  },
  createProxyMiddleware({
    target: process.env.MS_OPERACIONES_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/api/operaciones': '' },
    on: {
      proxyReq: (proxyReq: any, req: any) => {
        proxyRequestCounter.inc({ target_service: 'ms-operaciones', method: req.method });
        // Pasamos los headers inyectados por el middleware al microservicio
        if (req.headers['x-user-id']) proxyReq.setHeader('x-user-id', req.headers['x-user-id'] as string);
        if (req.headers['x-user-role']) proxyReq.setHeader('x-user-role', req.headers['x-user-role'] as string);
      }
    }
  })
);

// 3. Redirigir WebSockets Chat (Puerto 3003)
app.use(
  '/socket.io',
  createProxyMiddleware({
    target: process.env.MS_CHAT_URL || 'http://localhost:3003',
    changeOrigin: true,
    ws: true, // Soporte explícito para WebSockets
    on: {
      proxyReq: (proxyReq: any, req: any) => {
        proxyRequestCounter.inc({ target_service: 'ms-chat', method: 'WS' });
      }
    }
  })
);

app.listen(PORT, () => {
  console.log(`🛡️ [api-gateway]: Recepcionista corriendo en http://localhost:${PORT}`);
});
