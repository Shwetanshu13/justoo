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

export const requireSuperAdmin = requireRole(['superadmin']);
export const requireViewer = requireRole(['superadmin', 'viewer']);
export const requireAnyAdmin = requireRole(['superadmin', 'admin', 'inventory_admin', 'viewer']);

export const requireAdminAccess = (req, res, next) => {
    const userRole = req.user?.role;
    const adminRoles = ['superadmin', 'admin', 'inventory_admin', 'viewer'];
    if (!userRole || !adminRoles.includes(userRole)) {
        return unauthorizedResponse(res, 'Access denied. Admin access required.');
    }
    next();
};
