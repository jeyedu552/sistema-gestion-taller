import { Request, Response } from 'express';
import { vehicleRepository } from '../repositories/VehicleRepository';

export class VehicleController {
  
  async registerVehicle(req: Request, res: Response) {
    try {
      // Mapear plate a licensePlate para Prisma
      const { ownerId, brand, model, year, plate } = req.body;

      if (!ownerId) {
        return res.status(400).json({ error: 'ownerId es requerido en esta arquitectura aislada' });
      }

      const newVehicle = await vehicleRepository.create({
        ownerId,
        brand,
        model,
        year: Number(year),
        licensePlate: plate
      });

      res.status(201).json({ ...newVehicle, plate: newVehicle.licensePlate });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar vehículo' });
    }
  }

  async getMyVehicles(req: Request, res: Response) {
    try {
      const vehicles = await vehicleRepository.findAll(); // Administrador necesita ver todos
      // En un caso real, si es cliente, se filtraría por ownerId. Aquí devolvemos todos y mapeamos plate
      const mappedVehicles = vehicles.map(v => ({ ...v, plate: v.licensePlate }));
      res.json(mappedVehicles);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener vehículos' });
    }
  }

  async deleteVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Borrado físico directo en base de datos
      await vehicleRepository.hardDelete(id);
      
      res.json({ message: 'Vehículo eliminado permanentemente de db_operaciones' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar vehículo' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { brand, model, year, plate, isActive } = req.body;
      
      const updateData: any = {};
      if (brand !== undefined) updateData.brand = brand;
      if (model !== undefined) updateData.model = model;
      if (year !== undefined) updateData.year = Number(year);
      if (plate !== undefined) updateData.licensePlate = plate;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updated = await vehicleRepository.update(id, updateData);
      res.json({ ...updated, plate: updated.licensePlate });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar vehículo' });
    }
  }
}

export const vehicleController = new VehicleController();
