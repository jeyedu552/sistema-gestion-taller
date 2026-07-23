import client from 'prom-client';

client.collectDefaultMetrics();

// Métrica específica para contar cuántos mensajes se envían
export const chatMessagesCounter = new client.Counter({
  name: 'ms_chat_messages_total',
  help: 'Total de mensajes enviados por el chat',
  labelNames: ['room'],
});

export const registry = client.register;
