import express from 'express';
import {
    processOrderPlacement,
    processOrderCancellation,
    bulkUpdateQuantities,
    checkStockAvailability
} from '../controllers/orderController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Order processing routes - require authentication
router.post('/place-order', authenticateToken, processOrderPlacement);           // POST /api/orders/place-order
router.post('/cancel-order', authenticateToken, authorizeRoles('admin', 'manager'), processOrderCancellation);       // POST /api/orders/cancel-order

// Stock management routes - require manager or admin permissions
router.post('/bulk-update', authenticateToken, authorizeRoles('admin', 'manager'), bulkUpdateQuantities);            // POST /api/orders/bulk-update

// Stock availability check - all authenticated users can check
router.post('/check-availability', authenticateToken, checkStockAvailability);   // POST /api/orders/check-availability

export default router;
