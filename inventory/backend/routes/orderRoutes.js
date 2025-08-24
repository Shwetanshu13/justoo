import express from 'express';
import {
    processOrderPlacement,
    processOrderCancellation,
    bulkUpdateQuantities,
    checkStockAvailability,
    getAllOrders,
    getOrderById
} from '../controllers/orderController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Order viewing routes - all authenticated users can view orders
router.get('/', authenticateToken, getAllOrders);                     // GET /api/orders - list orders
router.get('/:id', authenticateToken, getOrderById);                  // GET /api/orders/:id - get specific order

// Order processing routes
router.post('/place-order', authenticateToken, processOrderPlacement);           // POST /api/orders/place-order - all users can place orders
router.post('/cancel-order', authenticateToken, authorizeRoles('admin'), processOrderCancellation);       // POST /api/orders/cancel-order - admin only

// Stock management routes - admin only
router.post('/bulk-update', authenticateToken, authorizeRoles('admin'), bulkUpdateQuantities);            // POST /api/orders/bulk-update

// Stock availability check - all authenticated users can check
router.post('/check-availability', authenticateToken, checkStockAvailability);   // POST /api/orders/check-availability

export default router;
