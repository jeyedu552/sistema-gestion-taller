"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = void 0;
const socket_io_1 = require("socket.io");
const ChatRepository_1 = require("../repositories/ChatRepository");
class SocketServer {
    io;
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });
        this.setupListeners();
    }
    setupListeners() {
        this.io.on('connection', async (socket) => {
            console.log(`🔌 Cliente conectado: ${socket.id}`);
            // Solicitud de historial por orden de trabajo
            socket.on('requestHistory', async (workOrderId) => {
                try {
                    const history = await ChatRepository_1.chatRepository.getHistory(workOrderId);
                    socket.emit('chatHistory', history.reverse());
                }
                catch (error) {
                    console.error('Error obteniendo historial:', error);
                }
            });
            // Nuevo mensaje: el cliente envía { workOrderId, senderId, text }
            socket.on('sendMessage', async (data) => {
                try {
                    const savedMessage = await ChatRepository_1.chatRepository.saveFullMessage(data.workOrderId, data.senderId, data.text);
                    // Emitir a todos los conectados
                    this.io.emit('newMessage', savedMessage);
                }
                catch (error) {
                    console.error('Error guardando mensaje:', error);
                }
            });
            socket.on('disconnect', () => {
                console.log(`❌ Cliente desconectado: ${socket.id}`);
            });
        });
    }
}
exports.SocketServer = SocketServer;
