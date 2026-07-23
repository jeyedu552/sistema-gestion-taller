import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { userController } from '../controllers/UserController';

const router = Router();

router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));
router.get('/verify', authController.verify.bind(authController));

// Rutas de Usuarios (CRUD Administrativo)
router.get('/users', userController.getAll);
router.post('/users', userController.create.bind(userController));
router.get('/users/:id', userController.getById);
router.patch('/users/:id', userController.updateStatus.bind(userController));
router.patch('/users/:id/heartbeat', userController.heartbeat.bind(userController));
router.delete('/users/:id', userController.delete);

export default router;
