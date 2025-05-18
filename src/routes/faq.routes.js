import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.middleware.js';
import * as faqController from '../controllers/faq.controller.js';

// GET all FAQs
router.get('/', faqController.getAllFaqs);

// GET a single FAQ by ID
router.get('/:id', faqController.getFaqById);

// CREATE a new FAQ
router.post('/', faqController.createFaq);

// UPDATE an FAQ by ID
router.put('/:id', verifyToken, faqController.updateFaq);

// DELETE an FAQ by ID
router.delete('/:id', verifyToken, faqController.deleteFaq);

export default router;