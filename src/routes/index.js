import express from 'express';
const router = express.Router();

import activityLogRoutes from './activityLog.rt.js';
import appSettingsRoutes from './appSettings.rt.js';
import blogPostRoutes from './blogPost.rt.js';
import discountCodeRoutes from './discountCode.rt.js';

// Define your routes here
router.use('/activity-logs', activityLogRoutes);
router.use('/settings', appSettingsRoutes);
router.use('/blog-posts', blogPostRoutes);
router.use('/discount-codes', discountCodeRoutes);
// Example:
// router.get('/', (req, res) => {
//   res.send('API root');
// });

export default router;