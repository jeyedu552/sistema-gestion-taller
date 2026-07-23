"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VehicleController_1 = require("../controllers/VehicleController");
const OrderController_1 = require("../controllers/OrderController");
const router = (0, express_1.Router)();
// =======================
// RUTAS DE VEHÍCULOS
// =======================
router.post('/vehicles', VehicleController_1.vehicleController.registerVehicle.bind(VehicleController_1.vehicleController));
router.get('/vehicles', VehicleController_1.vehicleController.getMyVehicles.bind(VehicleController_1.vehicleController));
router.patch('/vehicles/:id', VehicleController_1.vehicleController.update.bind(VehicleController_1.vehicleController));
router.delete('/vehicles/:id', VehicleController_1.vehicleController.deleteVehicle.bind(VehicleController_1.vehicleController));
// =======================
// RUTAS DE ÓRDENES Y REPUESTOS
// =======================
router.get('/orders', OrderController_1.orderController.getAll);
router.post('/orders', OrderController_1.orderController.create);
router.put('/orders/:id/status', OrderController_1.orderController.updateStatus);
router.patch('/orders/:id/status', OrderController_1.orderController.updateStatus);
router.get('/orders/:id/items', OrderController_1.orderController.getItems);
router.post('/orders/:id/items', OrderController_1.orderController.addItem);
exports.default = router;
