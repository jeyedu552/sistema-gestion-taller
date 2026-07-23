"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * UserRepository: Implementación del Patrón Repository.
 * Encapsula todo el acceso a la base de datos aislando esta lógica de los controladores.
 */
class UserRepository {
    async findByEmail(email) {
        return prisma.user.findUnique({ where: { email } });
    }
    async findById(id) {
        return prisma.user.findUnique({ where: { id } });
    }
    async getAllUsers() {
        return prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, isActive: true, lastActive: true, createdAt: true }
        });
    }
    async deleteUser(id) {
        return prisma.user.delete({ where: { id } });
    }
    async create(data) {
        return prisma.user.create({ data });
    }
    async findAll() {
        // No devolvemos las contraseñas
        return prisma.user.findMany();
    }
    async update(id, data) {
        return prisma.user.update({
            where: { id },
            data
        });
    }
    async softDelete(id) {
        return prisma.user.update({
            where: { id },
            data: { isActive: false }
        });
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
