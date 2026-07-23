import client from 'prom-client';

client.collectDefaultMetrics();

export const httpRequestCounter = new client.Counter({
  name: 'ms_operaciones_http_requests_total',
  help: 'Total de peticiones HTTP en Operaciones',
  labelNames: ['method', 'route', 'status_code'],
});

export const registry = client.register;
