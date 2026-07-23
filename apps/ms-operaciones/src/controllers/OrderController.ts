import { Request, Response } from 'express';
import { orderRepository } from '../repositories/OrderRepository';

export class OrderController {
  
  async getAll(req: Request, res: Response) {
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'] as string;

    try {
      let orders;
      if (role === 'ADMIN') {
        orders = await orderRepository.getAllOrders();
      } else if (role === 'MECANICO') {
        orders = await orderRepository.getOrdersByMechanic(userId);
      } else {
        orders = await orderRepository.getOrdersByClient(userId);
      }
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      // Data expected: vehicleId, description, mechanicId
      const order = await orderRepository.createOrder(req.body);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await orderRepository.updateOrderStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getItems(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const items = await orderRepository.getOrderItems(id);
      res.json(items);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addItem(req: Request, res: Response) {
    try {
      const { id } = req.params; // order id
      const { description, price } = req.body;
      const item = await orderRepository.addItemToOrder(id, description, Number(price));
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const orderController = new OrderController();
