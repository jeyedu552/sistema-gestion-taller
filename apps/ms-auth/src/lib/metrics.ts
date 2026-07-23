import client from 'prom-client';

// Habilitar métricas por defecto (CPU, memoria, latencia de eventos, etc.)
client.collectDefaultMetrics();

// Contador personalizado para peticiones HTTP
export const httpRequestCounter = new client.Counter({
  name: 'ms_auth_http_requests_total',
  help: 'Total de peticiones HTTP recibidas en MS-Auth',
  labelNames: ['method', 'route', 'status_code'],
});

export const registry = client.register;
