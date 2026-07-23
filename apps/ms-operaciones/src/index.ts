import './tracing';
import express from 'express';
import cors from 'cors';
import { registry, httpRequestCounter } from './lib/metrics';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode
    });
  });
  next();
});

// Endpoint Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ms-operaciones', timestamp: new Date() });
});

import routes from './routes';

// Rutas de negocio centralizadas (incluye /vehicles y /orders)
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`🚀 [ms-operaciones]: Servidor corriendo en http://localhost:${PORT}`);
});
