import express from 'express';
const router = express.Router();
import { createNotification, getNotifications, getNotificationsForUser } from '../controllers/notification.ct.js';
import { verifyToken } from '../middleware/auth.middleware.js';

// POST route for creating a new notification
router.post('/', createNotification);

// GET all notifications
router.get('/', getNotifications);

// GET notifications for a user (requires authentication)
router.get('/me', verifyToken, getNotificationsForUser);

// Remove this redundant TODO comment

export default router;