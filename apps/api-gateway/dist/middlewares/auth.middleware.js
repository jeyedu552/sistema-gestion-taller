"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado en el API Gateway' });
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Inyectamos el ID y el Rol del usuario en los headers para que los microservicios sepan quién es
        req.headers['x-user-id'] = decoded.userId;
        req.headers['x-user-role'] = decoded.role;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Acceso denegado: Token inválido o expirado' });
    }
};
exports.requireAuth = requireAuth;
