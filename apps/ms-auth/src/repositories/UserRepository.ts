import { PrismaClient, Prisma, User } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * UserRepository: Implementación del Patrón Repository.
 * Encapsula todo el acceso a la base de datos aislando esta lógica de los controladores.
 */
export class UserRepository {
  
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async getAllUsers() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true }
    });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async findAll(): Promise<User[]> {
    // No devolvemos las contraseñas
    return prisma.user.findMany();
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  async softDelete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  }
}

export const userRepository = new UserRepository();
