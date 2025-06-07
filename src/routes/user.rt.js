import express from 'express';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/user.ct.js';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All user routes are protected and admin-only
router.use(verifyToken, authorize('Admin'));

// User management routes
router.get('/', getUsers);
router.post('/', createUser);
router.put('/', updateUser);
router.delete('/', deleteUser);

export default router;