import './tracing';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { registry, httpRequestCounter } from './lib/metrics';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware global para contar peticiones HTTP (Métricas Prometheus)
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

// Endpoint de métricas para Grafana
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ms-auth', timestamp: new Date() });
});

// Rutas de negocio
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 [ms-auth]: Servidor corriendo en http://localhost:${PORT}`);
});
