"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserRepository_1 = require("../repositories/UserRepository");
const TokenService_1 = require("../services/TokenService");
class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await UserRepository_1.userRepository.findByEmail(email);
            if (!user || !user.isActive) {
                return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo' });
            }
            const isValid = await bcrypt_1.default.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            const token = TokenService_1.tokenService.sign({
                userId: user.id,
                email: user.email,
                role: user.role
            });
            // No devolvemos el password por seguridad
            const { password: _, ...userWithoutPassword } = user;
            res.json({ token, user: userWithoutPassword });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    async register(req, res) {
        try {
            const { email, password, name } = req.body;
            const existingUser = await UserRepository_1.userRepository.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'El correo ya está registrado' });
            }
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const newUser = await UserRepository_1.userRepository.create({
                email,
                password: hashedPassword,
                name,
                // Por defecto, registro público crea rol CLIENTE
                role: 'CLIENTE'
            });
            const { password: _, ...userWithoutPassword } = newUser;
            res.status(201).json(userWithoutPassword);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    verify(req, res) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }
        const token = authHeader.split(' ')[1];
        try {
            const payload = TokenService_1.tokenService.verify(token);
            res.json(payload);
        }
        catch (error) {
            res.status(401).json({ error: 'Token inválido' });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
