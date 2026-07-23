"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = exports.OrderController = void 0;
const OrderRepository_1 = require("../repositories/OrderRepository");
class OrderController {
    async getAll(req, res) {
        const role = req.headers['x-user-role'];
        const userId = req.headers['x-user-id'];
        try {
            let orders;
            if (role === 'ADMIN') {
                orders = await OrderRepository_1.orderRepository.getAllOrders();
            }
            else if (role === 'MECANICO') {
                orders = await OrderRepository_1.orderRepository.getOrdersByMechanic(userId);
            }
            else {
                orders = await OrderRepository_1.orderRepository.getOrdersByClient(userId);
            }
            res.json(orders);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async create(req, res) {
        try {
            // Data expected: vehicleId, description, mechanicId
            const order = await OrderRepository_1.orderRepository.createOrder(req.body);
            res.status(201).json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await OrderRepository_1.orderRepository.updateOrderStatus(id, status);
            res.json(updated);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getItems(req, res) {
        try {
            const { id } = req.params;
            const items = await OrderRepository_1.orderRepository.getOrderItems(id);
            res.json(items);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async addItem(req, res) {
        try {
            const { id } = req.params; // order id
            const { description, price } = req.body;
            const item = await OrderRepository_1.orderRepository.addItemToOrder(id, description, Number(price));
            res.status(201).json(item);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.OrderController = OrderController;
exports.orderController = new OrderController();
