import rateLimit from 'express-rate-limit';

// Limitador global: Máximo 100 peticiones por ventana de 15 minutos por IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10000, 
  message: {
    error: 'Demasiadas peticiones desde esta IP. Por favor, intenta de nuevo después de 15 minutos.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Limitador estricto para Login/Registro para evitar fuerza bruta
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 intentos por minuto (aumentado para pruebas locales)
  message: {
    error: 'Demasiados intentos de autenticación. Intenta de nuevo en 1 minuto.'
  }
});
