import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { chatRepository } from '../repositories/ChatRepository';

export class SocketServer {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // En producción debería restringirse al dominio del frontend
        methods: ['GET', 'POST']
      }
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.io.on('connection', async (socket: Socket) => {
      console.log(`🔌 Cliente conectado: ${socket.id}`);

      // Cuando un usuario pide el historial al entrar
      socket.on('requestHistory', async (room: string = 'general') => {
        try {
          const history = await chatRepository.getHistory(room);
          // Emitimos solo a quien lo pidió
          socket.emit('chatHistory', history.reverse()); 
        } catch (error) {
          console.error('Error obteniendo historial:', error);
        }
      });

      // Cuando llega un mensaje nuevo
      socket.on('sendMessage', async (data: { senderId: string, senderName: string, content: string, room?: string }) => {
        try {
          const room = data.room || 'general';
          
          // 1. Guardar en Base de Datos (Persistencia)
          const savedMessage = await chatRepository.saveMessage({
            senderId: data.senderId,
            senderName: data.senderName,
            content: data.content,
            room
          });

          // 2. Emitir a todos los conectados (Tiempo Real)
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
