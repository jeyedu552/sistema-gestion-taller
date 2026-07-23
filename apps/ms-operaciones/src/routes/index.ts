import { Router } from 'express';
import { vehicleController } from '../controllers/VehicleController';
import { orderController } from '../controllers/OrderController';

const router = Router();

// =======================
// RUTAS DE VEHÍCULOS
// =======================
router.post('/vehicles', vehicleController.registerVehicle.bind(vehicleController));
router.get('/vehicles', vehicleController.getMyVehicles.bind(vehicleController));
router.patch('/vehicles/:id', vehicleController.update.bind(vehicleController));
router.delete('/vehicles/:id', vehicleController.deleteVehicle.bind(vehicleController));

// =======================
// RUTAS DE ÓRDENES Y REPUESTOS
// =======================
router.get('/orders', orderController.getAll);
router.post('/orders', orderController.create);
router.put('/orders/:id/status', orderController.updateStatus);
router.patch('/orders/:id/status', orderController.updateStatus);
router.get('/orders/:id/items', orderController.getItems);
router.post('/orders/:id/items', orderController.addItem);

export default router;
