const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Configuración de Socket.io sobre el mismo servidor HTTP
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('⚡ Nuevo cliente conectado:', socket.id);

    // Unirse a una sala específica de la orden (HU-07)
    socket.on('join_order_chat', (orderId) => {
      socket.join(orderId);
      console.log(`👤 Usuario unido al chat de la orden: ${orderId}`);
    });

    // Enviar mensaje
    socket.on('send_message', (data) => {
      // Re-emitir el mensaje a todos en la sala de la orden
      io.to(data.orderId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
      console.log('🔥 Cliente desconectado');
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Servidor listo en http://localhost:${PORT}`);
  });
});
