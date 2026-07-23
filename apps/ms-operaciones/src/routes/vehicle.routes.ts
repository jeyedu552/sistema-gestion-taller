import { Router } from 'express';
import { vehicleController } from '../controllers/VehicleController';

const router = Router();

router.post('/', vehicleController.registerVehicle.bind(vehicleController));
router.get('/', vehicleController.getMyVehicles.bind(vehicleController));
router.patch('/:id', vehicleController.update.bind(vehicleController));
router.delete('/:id', vehicleController.deleteVehicle.bind(vehicleController));

export default router;
