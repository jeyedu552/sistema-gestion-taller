"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Limitador global: Máximo 100 peticiones por ventana de 15 minutos por IP
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: {
        error: 'Demasiadas peticiones desde esta IP. Por favor, intenta de nuevo después de 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Limitador estricto para Login/Registro para evitar fuerza bruta
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minuto
    max: 100, // 100 intentos por minuto (aumentado para pruebas locales)
    message: {
        error: 'Demasiados intentos de autenticación. Intenta de nuevo en 1 minuto.'
    }
});
