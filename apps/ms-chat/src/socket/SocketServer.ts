import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { chatRepository } from '../repositories/ChatRepository';

export class SocketServer {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.io.on('connection', async (socket: Socket) => {
      console.log(`🔌 Cliente conectado: ${socket.id}`);

      // Solicitud de historial por orden de trabajo
      socket.on('requestHistory', async (workOrderId: string) => {
        try {
          const history = await chatRepository.getHistory(workOrderId);
          socket.emit('chatHistory', history.reverse());
        } catch (error) {
          console.error('Error obteniendo historial:', error);
        }
      });

      // Nuevo mensaje: el cliente envía { workOrderId, senderId, text }
      socket.on('sendMessage', async (data: { workOrderId: string; senderId: string; text: string }) => {
        try {
          const savedMessage = await chatRepository.saveFullMessage(
            data.workOrderId,
            data.senderId,
            data.text
          );

          // Emitir a todos los conectados
          this.io.emit('newMessage', savedMessage);
        } catch (error) {
          console.error('Error guardando mensaje:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
      });
    });
  }
}
