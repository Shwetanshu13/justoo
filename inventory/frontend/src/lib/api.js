import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
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
            Cookies.remove('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API methods for different endpoints
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/profile'),
    changePassword: (data) => api.put('/auth/change-password', data),
};

export const inventoryAPI = {
    getAllItems: (params) => api.get('/inventory', { params }),
    getItemById: (id) => api.get(`/inventory/${id}`),
    addItem: (data) => api.post('/inventory', data),
    updateItem: (id, data) => api.put(`/inventory/${id}`, data),
    deleteItem: (id) => api.delete(`/inventory/${id}`),
    getInStockItems: () => api.get('/inventory/in-stock'),
    getOutOfStockItems: () => api.get('/inventory/out-of-stock'),
    getLowStockItems: () => api.get('/inventory/low-stock'),
    getDashboardStats: () => api.get('/inventory/dashboard/stats'),
};

export const orderAPI = {
    getAllOrders: (params) => api.get('/orders', { params }),
    getOrderById: (id) => api.get(`/orders/${id}`),
    placeOrder: (data) => api.post('/orders/place-order', data),
    cancelOrder: (data) => api.post('/orders/cancel-order', data),
    bulkUpdateQuantities: (data) => api.post('/orders/bulk-update', data),
    checkAvailability: (data) => api.post('/orders/check-availability', data),
};

export default api;
