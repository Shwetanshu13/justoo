// Role-based authorization middleware - Admin Backend Only
import { unauthorizedResponse } from '../utils/response.js';

export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            return unauthorizedResponse(res, 'Insufficient permissions');
        }

        next();
    };
};

// Specific role middlewares for admin backend
export const requireSuperAdmin = requireRole(['superadmin']);
export const requireAnyAdmin = requireRole(['superadmin', 'admin', 'inventory_admin']);
export const requireInventoryAdmin = requireRole(['superadmin', 'admin', 'inventory_admin']);

// Admin login check - only admins can access this backend
export const requireAdminAccess = (req, res, next) => {
    const userRole = req.user?.role;
    const adminRoles = ['superadmin', 'admin', 'inventory_admin'];

    if (!userRole || !adminRoles.includes(userRole)) {
        return unauthorizedResponse(res, 'Access denied. Admin access required.');
    }

    next();
};
