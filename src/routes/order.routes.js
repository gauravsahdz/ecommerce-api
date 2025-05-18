import express from 'express';
const router = express.Router();
import * as orderController from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

// GET all ordersgit 
router.get('/', orderController.getAllOrders);

// GET a single order by ID
router.get('/:id', orderController.getOrderById);

// CREATE a new order
router.post('/', orderController.createOrder);

// UPDATE an order by ID
router.put('/:id', verifyToken, orderController.updateOrder);

// DELETE an order by ID
router.delete('/:id', verifyToken, orderController.deleteOrder);

export default router;