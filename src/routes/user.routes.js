import express from 'express';
const router = express.Router();
import * as userController from '../controllers/user.controller.js';

// GET all users
router.get('/', userController.getAllUsers);

// GET a single user by ID
router.get('/:id', userController.getUserById);

// CREATE a new user
router.post('/', userController.createUser);

// UPDATE a user by ID
router.put('/:id', userController.updateUser);

// DELETE a user by ID
router.delete('/:id', userController.deleteUser);

export default router;