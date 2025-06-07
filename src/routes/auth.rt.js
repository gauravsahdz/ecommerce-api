import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/auth.ct.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getCurrentUser);
router.post('/logout', verifyToken, logout);

export default router; 