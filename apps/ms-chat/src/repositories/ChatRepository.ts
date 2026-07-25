import { PrismaClient, ChatMessage } from '@prisma/client';

const prisma = new PrismaClient();

export class ChatRepository {

  // Guarda un mensaje usando las relaciones del schema global
  async saveMessage(workOrderId: string, senderId: string): Promise<ChatMessage> {
    return prisma.chatMessage.create({
      data: {
        workOrder: { connect: { id: workOrderId } },
        sender:    { connect: { id: senderId } },
        text: ''   // El texto del mensaje se inyecta por el llamador
      }
    });
  }

  // Guarda un mensaje completo con su texto
  async saveFullMessage(workOrderId: string, senderId: string, text: string): Promise<ChatMessage> {
    return prisma.chatMessage.create({
      data: {
        workOrder: { connect: { id: workOrderId } },
        sender:    { connect: { id: senderId } },
        text
      }
    });
  }

  // Obtiene los últimos 50 mensajes de una orden de trabajo
  async getHistory(workOrderId: string): Promise<ChatMessage[]> {
    return prisma.chatMessage.findMany({
      where: { workOrderId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { sender: { select: { id: true, name: true, role: true } } }
    });
  }
}

export const chatRepository = new ChatRepository();
