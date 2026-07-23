"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleRepository = exports.VehicleRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class VehicleRepository {
    async create(data) {
        return prisma.vehicle.create({ data });
    }
    async findAllByOwner(ownerId) {
        return prisma.vehicle.findMany({
            where: { ownerId }
        });
    }
    async findAll() {
        return prisma.vehicle.findMany();
    }
    async update(id, data) {
        return prisma.vehicle.update({ where: { id }, data });
    }
    async findById(id) {
        return prisma.vehicle.findUnique({ where: { id } });
    }
    // CUMPLIMIENTO DE RÚBRICA: Borrado físico (Hard Delete) en lugar de Soft Delete
    async hardDelete(id) {
        return prisma.vehicle.delete({
            where: { id }
        });
    }
}
exports.VehicleRepository = VehicleRepository;
exports.vehicleRepository = new VehicleRepository();
