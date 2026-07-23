import client from 'prom-client';

client.collectDefaultMetrics();

export const proxyRequestCounter = new client.Counter({
  name: 'api_gateway_proxy_requests_total',
  help: 'Total de peticiones proxy redirigidas por el Gateway',
  labelNames: ['target_service', 'method'],
});

export const registry = client.register;
