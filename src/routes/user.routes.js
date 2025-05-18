import express from 'express';
const router = express.Router();
import * as userController from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

// GET all users
router.get('/', verifyToken, userController.getAllUsers);

// GET a single user by ID
router.get('/:id', verifyToken, userController.getUserById);

// CREATE a new user
router.post('/', userController.createUser);

// UPDATE a user by ID
router.put('/:id', verifyToken, userController.updateUser);

// DELETE a user by ID
router.delete('/:id', verifyToken, userController.deleteUser);

export default router;