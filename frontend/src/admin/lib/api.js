import axios from "axios";

// Check the backend api route configuration for the correct base URL
const API_BASE_URL =
    (process.env.NEXT_PUBLIC_ADMIN_BACKEND_API_URL || "http://localhost:3000") +
    "/api/admin";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Keep interceptors minimal; let callers handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post("/auth/login", credentials),
    logout: () => api.post("/auth/logout"),
    getProfile: () => api.get("/auth/profile"),
    refreshToken: () => api.post("/auth/refresh"),
};

// Admin Management API
export const adminAPI = {
    getAllAdmins: (params) => api.get("/", { params }),
    addAdmin: (data) => api.post("/add", data),
    deleteAdmin: (id) => api.delete(`/${id}`),
    getAllUsers: (params) => api.get("/users", { params }),
    deleteUser: (id) => api.delete(`/users/${id}`),
    getDashboardAnalytics: () => api.get("/analytics/dashboard"),
    getUserAnalytics: (params) => api.get("/analytics/users", { params }),
    getOrderAnalytics: (params) => api.get("/analytics/orders", { params }),
    getInventoryAnalytics: (params) =>
        api.get("/analytics/inventory", { params }),
    getPaymentAnalytics: (params) => api.get("/analytics/payments", { params }),
};

// Inventory API
export const inventoryAPI = {
    getAllItems: (params) => api.get("/inventory", { params }),
    getItemAnalytics: (params) => api.get("/inventory/analytics", { params }),
    getLowStockItems: (params) => api.get("/inventory/low-stock", { params }),
};

// Inventory Admin Management API
export const inventoryAdminAPI = {
    getAllInventoryAdmins: (params) => api.get("/inventory-admins", { params }),
    getInventoryAdminById: (id) => api.get(`/inventory-admins/${id}`),
    createInventoryAdmin: (data) => api.post("/inventory-admins", data),
    updateInventoryAdmin: (id, data) =>
        api.put(`/inventory-admins/${id}`, data),
    deleteInventoryAdmin: (id) => api.delete(`/inventory-admins/${id}`),
    toggleInventoryAdminStatus: (id) =>
        api.patch(`/inventory-admins/${id}/toggle-status`),
};

// Rider API
export const riderAPI = {
    getAllRiders: (params) => api.get("/riders", { params }),
    addRider: (data) => api.post("/riders", data),
    getRiderById: (id) => api.get(`/riders/${id}`),
    updateRider: (id, data) => api.put(`/riders/${id}`, data),
    deleteRider: (id) => api.delete(`/riders/${id}`),
    changeRiderPassword: (id, data) => api.put(`/riders/${id}/password`, data),
    getRiderAnalytics: (params) => api.get("/riders/analytics", { params }),
};

// Orders API
export const ordersAPI = {
    getAllOrders: (params) => api.get("/orders", { params }),
    getOrderById: (id) => api.get(`/orders/${id}`),
    getOrderAnalytics: (params) => api.get("/orders/analytics", { params }),
};

// Address Zones API
export const addressZoneAPI = {
    getAll: () => api.get("/address-zones"),
    create: (data) => api.post("/address-zones", data),
    update: (id, data) => api.put(`/address-zones/${id}`, data),
    remove: (id) => api.delete(`/address-zones/${id}`),
};

export default api;
