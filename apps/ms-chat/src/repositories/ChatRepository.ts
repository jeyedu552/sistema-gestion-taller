import { PrismaClient, Prisma, ChatMessage } from '@prisma/client';

const prisma = new PrismaClient();

export class ChatRepository {
  
  async saveMessage(data: Prisma.ChatMessageCreateInput): Promise<ChatMessage> {
    return prisma.chatMessage.create({ data });
  }

  // Obtenemos los últimos 50 mensajes de una sala específica
  async getHistory(room: string = 'general'): Promise<ChatMessage[]> {
    return prisma.chatMessage.findMany({
      where: { room },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
}

export const chatRepository = new ChatRepository();
