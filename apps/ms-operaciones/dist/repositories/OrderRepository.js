"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRepository = exports.OrderRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class OrderRepository {
    async getAllOrders() {
        return prisma.workOrder.findMany({
            include: { vehicle: true, items: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getOrdersByClient(ownerId) {
        return prisma.workOrder.findMany({
            where: { vehicle: { ownerId } },
            include: { vehicle: true, items: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getOrdersByMechanic(mechanicId) {
        return prisma.workOrder.findMany({
            where: { mechanicId },
            include: { vehicle: true, items: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createOrder(data) {
        return prisma.workOrder.create({ data, include: { vehicle: true } });
    }
    async updateOrderStatus(id, status) {
        return prisma.workOrder.update({
            where: { id },
            data: { status }
        });
    }
    async addItemToOrder(workOrderId, description, price) {
        return prisma.serviceItem.create({
            data: { workOrderId, description, price }
        });
    }
    async getOrderItems(workOrderId) {
        return prisma.serviceItem.findMany({ where: { workOrderId } });
    }
}
exports.OrderRepository = OrderRepository;
exports.orderRepository = new OrderRepository();
