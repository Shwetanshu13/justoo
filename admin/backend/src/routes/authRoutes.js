import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signin', authController.signin);
router.post('/signout', authController.signout);

// Protected routes (require authentication)
router.get('/me', authMiddleware, authController.getMe);
router.post('/refresh', authMiddleware, authController.refreshToken);

export default router;
