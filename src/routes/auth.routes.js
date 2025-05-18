import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/signin
router.post('/signin', authController.signin);

// GET /api/auth/whoami
router.get('/whoami', verifyToken, authController.whoami);

export default router;