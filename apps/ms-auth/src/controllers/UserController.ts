import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/UserRepository';

export class UserController {
  async getAll(req: Request, res: Response) {
    try {
      // Idealmente aquí validarías que el usuario que pide esto es ADMIN, pero el API Gateway ya pasó la petición
      const users = await userRepository.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = await userRepository.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await userRepository.deleteUser(req.params.id);
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: 'No se pudo eliminar el usuario' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'El correo ya está registrado' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userRepository.create({
        email,
        password: hashedPassword,
        name,
        role: role || 'CLIENTE'
      });
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { isActive } = req.body;
      const updated = await userRepository.update(req.params.id, { isActive });
      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: 'No se pudo actualizar el estado' });
    }
  }

  async heartbeat(req: Request, res: Response) {
    try {
      const { offline } = req.body || {};
      const activeDate = offline ? new Date(Date.now() - 20000) : new Date();
      await userRepository.update(req.params.id, { lastActive: activeDate });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: 'Error actualizando conexión' });
    }
  }
}

export const userController = new UserController();
