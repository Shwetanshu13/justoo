// Order Routes - Read Only for Admin Dashboard
import express from 'express';
import * as orderController from '../../controllers/admin/orderController.js';
import authMiddleware from '../../middlewares/adminAuth.js';
import { requireAnyAdmin } from '../../middlewares/roleMiddleware.js';

const router = express.Router();

// Apply auth guard to all routes
router.use(authMiddleware);
router.use(requireAnyAdmin);

// Order viewing routes (admin only)
router.get('/', orderController.getAllOrders);
router.get('/analytics', orderController.getOrderAnalytics);
router.get('/:id', orderController.getOrderById);

export default router;
