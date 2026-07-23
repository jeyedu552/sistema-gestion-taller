import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/UserRepository';
import { tokenService } from '../services/TokenService';
import { Role } from '@taller/shared-types';

export class AuthController {
  
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      const user = await userRepository.findByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = tokenService.sign({
        userId: user.id,
        email: user.email,
        role: user.role as Role
      });

      // No devolvemos el password por seguridad
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'El correo ya está registrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userRepository.create({
        email,
        password: hashedPassword,
        name,
        // Por defecto, registro público crea rol CLIENTE
        role: 'CLIENTE'
      });

      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  verify(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = tokenService.verify(token);
      res.json(payload);
    } catch (error) {
      res.status(401).json({ error: 'Token inválido' });
    }
  }
}

export const authController = new AuthController();
