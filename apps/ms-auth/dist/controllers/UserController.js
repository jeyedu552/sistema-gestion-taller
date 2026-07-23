"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserRepository_1 = require("../repositories/UserRepository");
class UserController {
    async getAll(req, res) {
        try {
            // Idealmente aquí validarías que el usuario que pide esto es ADMIN, pero el API Gateway ya pasó la petición
            const users = await UserRepository_1.userRepository.getAllUsers();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getById(req, res) {
        try {
            const user = await UserRepository_1.userRepository.findById(req.params.id);
            if (!user)
                return res.status(404).json({ error: 'Usuario no encontrado' });
            res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async delete(req, res) {
        try {
            await UserRepository_1.userRepository.deleteUser(req.params.id);
            res.json({ message: 'Usuario eliminado correctamente' });
        }
        catch (error) {
            res.status(400).json({ error: 'No se pudo eliminar el usuario' });
        }
    }
    async create(req, res) {
        try {
            const { email, password, name, role } = req.body;
            const existingUser = await UserRepository_1.userRepository.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'El correo ya está registrado' });
            }
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const newUser = await UserRepository_1.userRepository.create({
                email,
                password: hashedPassword,
                name,
                role: role || 'CLIENTE'
            });
            const { password: _, ...userWithoutPassword } = newUser;
            res.status(201).json(userWithoutPassword);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async updateStatus(req, res) {
        try {
            const { isActive } = req.body;
            const updated = await UserRepository_1.userRepository.update(req.params.id, { isActive });
            const { password: _, ...userWithoutPassword } = updated;
            res.json(userWithoutPassword);
        }
        catch (error) {
            res.status(400).json({ error: 'No se pudo actualizar el estado' });
        }
    }
    async heartbeat(req, res) {
        try {
            const { offline } = req.body || {};
            const activeDate = offline ? new Date(Date.now() - 20000) : new Date();
            await UserRepository_1.userRepository.update(req.params.id, { lastActive: activeDate });
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ error: 'Error actualizando conexión' });
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
