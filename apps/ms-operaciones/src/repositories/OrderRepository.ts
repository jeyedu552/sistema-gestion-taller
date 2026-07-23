import { PrismaClient, Prisma, WorkOrder, ServiceItem } from '@prisma/client';

const prisma = new PrismaClient();

export class OrderRepository {
  async getAllOrders() {
    return prisma.workOrder.findMany({
      include: { vehicle: true, items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOrdersByClient(ownerId: string) {
    return prisma.workOrder.findMany({
      where: { vehicle: { ownerId } },
      include: { vehicle: true, items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOrdersByMechanic(mechanicId: string) {
    return prisma.workOrder.findMany({
      where: { mechanicId },
      include: { vehicle: true, items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createOrder(data: Prisma.WorkOrderUncheckedCreateInput) {
    return prisma.workOrder.create({ data, include: { vehicle: true } });
  }

  async updateOrderStatus(id: string, status: string) {
    return prisma.workOrder.update({
      where: { id },
      data: { status }
    });
  }

  async addItemToOrder(workOrderId: string, description: string, price: number) {
    return prisma.serviceItem.create({
      data: { workOrderId, description, price }
    });
  }

  async getOrderItems(workOrderId: string) {
    return prisma.serviceItem.findMany({ where: { workOrderId } });
  }
}

export const orderRepository = new OrderRepository();
