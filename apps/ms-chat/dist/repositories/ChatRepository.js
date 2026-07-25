"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRepository = exports.ChatRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ChatRepository {
    // Guarda un mensaje usando las relaciones del schema global
    async saveMessage(workOrderId, senderId) {
        return prisma.chatMessage.create({
            data: {
                workOrder: { connect: { id: workOrderId } },
                sender: { connect: { id: senderId } },
                text: '' // El texto del mensaje se inyecta por el llamador
            }
        });
    }
    // Guarda un mensaje completo con su texto
    async saveFullMessage(workOrderId, senderId, text) {
        return prisma.chatMessage.create({
            data: {
                workOrder: { connect: { id: workOrderId } },
                sender: { connect: { id: senderId } },
                text
            }
        });
    }
    // Obtiene los últimos 50 mensajes de una orden de trabajo
    async getHistory(workOrderId) {
        return prisma.chatMessage.findMany({
            where: { workOrderId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { sender: { select: { id: true, name: true, role: true } } }
        });
    }
}
exports.ChatRepository = ChatRepository;
exports.chatRepository = new ChatRepository();
