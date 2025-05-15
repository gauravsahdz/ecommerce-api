import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/signin
router.post('/signin', authController.signin);

export default router;