import express from 'express';
const router = express.Router();
import { createNotification } from '../controllers/notification.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

// POST route for creating a new notification
router.post('/', createNotification);

// TODO: Add GET routes for fetching notifications for a user

export default router;