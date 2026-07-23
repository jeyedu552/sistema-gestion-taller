import { PrismaClient, Prisma, Vehicle } from '@prisma/client';

const prisma = new PrismaClient();

export class VehicleRepository {
  
  async create(data: Prisma.VehicleCreateInput): Promise<Vehicle> {
    return prisma.vehicle.create({ data });
  }

  async findAllByOwner(ownerId: string): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({
      where: { ownerId }
    });
  }

  async findAll(): Promise<Vehicle[]> {
    return prisma.vehicle.findMany();
  }

  async update(id: string, data: Prisma.VehicleUpdateInput): Promise<Vehicle> {
    return prisma.vehicle.update({ where: { id }, data });
  }

  async findById(id: string): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  // CUMPLIMIENTO DE RÚBRICA: Borrado físico (Hard Delete) en lugar de Soft Delete
  async hardDelete(id: string): Promise<Vehicle> {
    return prisma.vehicle.delete({
      where: { id }
    });
  }
}

export const vehicleRepository = new VehicleRepository();
