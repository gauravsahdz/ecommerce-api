import express from 'express';
import * as customerController from '../controllers/customer.ct.js';

const router = express.Router();

router.get('/', customerController.getCustomers);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router; 