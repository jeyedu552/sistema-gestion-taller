"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const UserController_1 = require("../controllers/UserController");
const router = (0, express_1.Router)();
router.post('/login', AuthController_1.authController.login.bind(AuthController_1.authController));
router.post('/register', AuthController_1.authController.register.bind(AuthController_1.authController));
router.get('/verify', AuthController_1.authController.verify.bind(AuthController_1.authController));
// Rutas de Usuarios (CRUD Administrativo)
router.get('/users', UserController_1.userController.getAll);
router.post('/users', UserController_1.userController.create.bind(UserController_1.userController));
router.get('/users/:id', UserController_1.userController.getById);
router.patch('/users/:id', UserController_1.userController.updateStatus.bind(UserController_1.userController));
router.patch('/users/:id/heartbeat', UserController_1.userController.heartbeat.bind(UserController_1.userController));
router.delete('/users/:id', UserController_1.userController.delete);
exports.default = router;
