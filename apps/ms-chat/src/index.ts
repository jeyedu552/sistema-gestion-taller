import './tracing';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { SocketServer } from './socket/SocketServer';
import { registry } from './lib/metrics';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Endpoint de métricas para Grafana
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});

// Endpoint de salud del servicio
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ms-chat', timestamp: new Date() });
});

// Crear el servidor HTTP puro (requerido por Socket.io)
const httpServer = createServer(app);

// Inicializar el servidor de WebSockets inyectándole el servidor HTTP
const socketServer = new SocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 [ms-chat]: Servidor HTTP y WebSockets corriendo en http://localhost:${PORT}`);
});
