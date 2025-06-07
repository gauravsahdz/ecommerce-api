import express from 'express';
import { 
  getAppSettings, 
  createAppSetting, 
  updateAppSetting, 
  deleteAppSetting,
  generateApiKey
} from '../controllers/appSettings.ct.js';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (only for public settings)
router.get('/', getAppSettings);

// Protected routes (admin only)
router.post('/', verifyToken, authorize('Admin'), createAppSetting);
router.put('/:id', verifyToken, authorize('Admin'), updateAppSetting);
router.delete('/:id', verifyToken, authorize('Admin'), deleteAppSetting);
router.post('/generate-api-key', verifyToken, authorize('Admin'), generateApiKey);

export default router; 