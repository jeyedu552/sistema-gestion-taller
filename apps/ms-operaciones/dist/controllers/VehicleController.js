"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleController = exports.VehicleController = void 0;
const VehicleRepository_1 = require("../repositories/VehicleRepository");
class VehicleController {
    async registerVehicle(req, res) {
        try {
            // Mapear plate a licensePlate para Prisma
            const { ownerId, brand, model, year, plate } = req.body;
            if (!ownerId) {
                return res.status(400).json({ error: 'ownerId es requerido en esta arquitectura aislada' });
            }
            const newVehicle = await VehicleRepository_1.vehicleRepository.create({
                ownerId,
                brand,
                model,
                year: Number(year),
                licensePlate: plate
            });
            res.status(201).json({ ...newVehicle, plate: newVehicle.licensePlate });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al registrar vehículo' });
        }
    }
    async getMyVehicles(req, res) {
        try {
            const vehicles = await VehicleRepository_1.vehicleRepository.findAll(); // Administrador necesita ver todos
            // En un caso real, si es cliente, se filtraría por ownerId. Aquí devolvemos todos y mapeamos plate
            const mappedVehicles = vehicles.map(v => ({ ...v, plate: v.licensePlate }));
            res.json(mappedVehicles);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener vehículos' });
        }
    }
    async deleteVehicle(req, res) {
        try {
            const { id } = req.params;
            // Borrado físico directo en base de datos
            await VehicleRepository_1.vehicleRepository.hardDelete(id);
            res.json({ message: 'Vehículo eliminado permanentemente de db_operaciones' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al eliminar vehículo' });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const { brand, model, year, plate, isActive } = req.body;
            const updateData = {};
            if (brand !== undefined)
                updateData.brand = brand;
            if (model !== undefined)
                updateData.model = model;
            if (year !== undefined)
                updateData.year = Number(year);
            if (plate !== undefined)
                updateData.licensePlate = plate;
            if (isActive !== undefined)
                updateData.isActive = isActive;
            const updated = await VehicleRepository_1.vehicleRepository.update(id, updateData);
            res.json({ ...updated, plate: updated.licensePlate });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al actualizar vehículo' });
        }
    }
}
exports.VehicleController = VehicleController;
exports.vehicleController = new VehicleController();
