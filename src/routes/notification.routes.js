const express = require('express');
const router = express.Router();
import { createNotification } from '../controllers/notification.controller.js';

// POST route for creating a new notification
router.post('/', createNotification);

// TODO: Add GET routes for fetching notifications for a user

module.exports = router;