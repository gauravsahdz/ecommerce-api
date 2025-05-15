import express from 'express';
const router = express.Router();
import {getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer} from '../controllers/customer.controller.js';

// GET all customers
router.get('/', getAllCustomers);

// GET a single customer by ID
router.get('/:id', getCustomerById);

// CREATE a new customer
router.post('/', createCustomer);

// UPDATE a customer by ID
router.put('/:id', updateCustomer);

// DELETE a customer by ID
router.delete('/:id', deleteCustomer);

export default router;