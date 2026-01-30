import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const userService = {
    getAll: (params?: any) => api.get('/users', { params }),
    create: (userData: any) => api.post('/users', userData),
    update: (id: string, userData: any) => api.put(`/users/${id}`, userData),
    delete: (id: string) => api.delete(`/users/${id}`)
};

export const orderService = {
    getAll: () => api.get('/orders'),
    create: (orderData: any) => api.post('/orders', orderData),
    updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
    sendToLogistics: (id: string, clerkId: string) => api.put(`/orders/${id}/send-to-logistics`, { clerkId })
};

export const productService = {
    getAll: () => api.get('/products'),
    create: (productData: any) => api.post('/products', productData),
    update: (id: string, productData: any) => api.put(`/products/${id}`, productData),
    updateStock: (id: string, stockData: any) => api.put(`/products/${id}/stock`, stockData),
    delete: (id: string) => api.delete(`/products/${id}`)
};

export const authService = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    register: (userData: any) => api.post('/auth/register', userData),
    getCurrentUser: () => api.get('/auth/me')
};

export const invoiceService = {
    send: (data: { orderId: string; recipientEmail: string; recipientName?: string }) =>
        api.post('/invoices/send', data),
    generate: (orderId: string) => api.post('/invoices/generate', { orderId }),
    getInvoice: (orderId: string) => api.get(`/invoices/${orderId}`)
};

export const analyticsService = {
    getDashboardStats: () => api.get('/analytics/dashboard'),
    getSalesStats: () => api.get('/analytics/sales'),
    getInventoryStats: () => api.get('/analytics/inventory'),
    getDeliveryStats: () => api.get('/analytics/delivery'),
    getStaffStats: () => api.get('/analytics/staff'),
    getRouteStats: () => api.get('/analytics/routes')
};

export const vehicleService = {
    getAll: (params?: any) => api.get('/vehicles', { params }),
    create: (vehicleData: any) => api.post('/vehicles', vehicleData),
    update: (id: string, vehicleData: any) => api.put(`/vehicles/${id}`, vehicleData),
    delete: (id: string) => api.delete(`/vehicles/${id}`)
};

export const logisticsService = {
    getStats: () => api.get('/logistics/stats'),
    getDispatchQueue: (center?: string) => api.get('/logistics/dispatch-queue', { params: { center } }),
    assignDriver: (data: any) => api.post('/logistics/assign', data),
    getAssignments: (params?: any) => api.get('/logistics/assignments', { params }),
    verifyAssignment: (id: string, verified: boolean) => api.patch(`/logistics/assignments/${id}/verify`, { verified }),
    getAvailableDrivers: (center: string) => api.get('/logistics/available-drivers', { params: { center } }),
    getAvailableVehicles: (center: string) => api.get('/logistics/available-vehicles', { params: { center } }),
    updateDeliveryStatus: (id: string, status: string, data?: any) => api.put(`/logistics/assignments/${id}/status`, { status, ...data }),
    updateTracking: (data: any) => api.post('/logistics/tracking/update', data),
    getTrackingHistory: (deliveryId: string) => api.get(`/logistics/tracking/${deliveryId}`)
};

export const driverService = {
    getAll: (params?: any) => api.get('/drivers', { params }),
    updateStatus: (id: string, data: { status: string; note?: string; adminId: string }) =>
        api.patch(`/drivers/${id}/status`, data)
};

export default api;
