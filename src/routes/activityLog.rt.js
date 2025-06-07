import express from 'express';
import { createActivityLog, getActivityLogs } from '../controllers/activityLog.ct.js';
const router = express.Router();

// POST create a new activity log
router.post('/', createActivityLog);

// GET all activity logs (latest 200)
router.get('/', getActivityLogs);

export default router; 