import express from 'express';
import { 
  getFAQs, 
  createFAQ, 
  updateFAQ, 
  deleteFAQ 
} from '../controllers/faq.ct.js';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getFAQs);

// Protected routes (admin only)
router.post('/', verifyToken, authorize('Admin'), createFAQ);
router.put('/:id', verifyToken, authorize('Admin'), updateFAQ);
router.delete('/:id', verifyToken, authorize('Admin'), deleteFAQ);

export default router; 