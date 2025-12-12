import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
    (process.env.NEXT_PUBLIC_INVENTORY_API_URL || "http://localhost:3000") +
    "/api/inventory";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove("token");
            window.location.href = "/inventory/login";
        }
        return Promise.reject(error);
    }
);

// API methods for different endpoints
export const authAPI = {
    login: (credentials) => api.post("/auth/login", credentials),
    logout: () => api.post("/auth/logout"),
    getProfile: () => api.get("/auth/profile"),
    changePassword: (data) => api.put("/auth/change-password", data),
};

export const inventoryAPI = {
    getAllItems: (params) => api.get("/items", { params }),
    getItemById: (id) => api.get(`/items/${id}`),
    addItem: (data) => {
        // Check if data is FormData (for file uploads)
        if (data instanceof FormData) {
            return api.post("/items", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        }
        return api.post("/items", data);
    },
    updateItem: (id, data) => {
        // Check if data is FormData (for file uploads)
        if (data instanceof FormData) {
            return api.put(`/items/${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        }
        return api.put(`/items/${id}`, data);
    },
    deleteItem: (id) => api.delete(`/items/${id}`),
    getInStockItems: () => api.get("/stock/in-stock"),
    getOutOfStockItems: () => api.get("/stock/out-of-stock"),
    getLowStockItems: () => api.get("/stock/low-stock"),
    getDashboardStats: () => api.get("/dashboard/stats"),
    getUnits: () => api.get("/units"),
};

export const orderAPI = {
    getAllOrders: (params) => api.get("/orders", { params }),
    getOrderById: (id) => api.get(`/orders/${id}`),
    placeOrder: (data) => api.post("/orders/place-order", data),
    cancelOrder: (data) => api.post("/orders/cancel-order", data),
    bulkUpdateQuantities: (data) => api.post("/orders/bulk-update", data),
    checkAvailability: (data) => api.post("/orders/check-availability", data),
};

export default api;
