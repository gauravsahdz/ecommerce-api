import express from 'express';
const router = express.Router();
import * as orderController from '../controllers/order.controller.js';

// GET all ordersgit 
router.get('/', orderController.getAllOrders);

// GET a single order by ID
router.get('/:id', orderController.getOrderById);

// CREATE a new order
router.post('/', orderController.createOrder);

// UPDATE an order by ID
router.put('/:id', orderController.updateOrder);

// DELETE an order by ID
router.delete('/:id', orderController.deleteOrder);

export default router;