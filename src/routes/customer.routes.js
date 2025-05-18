import express from 'express';
const router = express.Router();
import {getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer} from '../controllers/customer.controller.js';

import { verifyToken } from '../middleware/auth.middleware.js';
// GET all customers
router.get('/', getAllCustomers);

// GET a single customer by ID
router.get('/:id', getCustomerById);

// CREATE a new customer
router.post('/', createCustomer);

// UPDATE a customer by ID
router.put('/:id', verifyToken, updateCustomer);

// DELETE a customer by ID
router.delete('/:id', verifyToken, deleteCustomer);

export default router;