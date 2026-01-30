import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add interceptor to include token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add interceptor to handle errors globally
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || (error.response.status === 404 && error.config.url.includes('/orders/user/')))) {
            // If user is not found or token invalid, clear local storage and redirect to login
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            // We don't want to redirect mid-flight usually, but for this demo/stale state fix, it's effective
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    register: (userData: any) => api.post('/auth/register', { ...userData, role: 'customer' }),
    getCurrentUser: () => api.get('/auth/me'),
    updateProfile: (profileData: any) => api.put('/auth/profile', profileData)
};

export const orderService = {
    getAll: () => api.get('/orders'),
    create: (orderData: any) => api.post('/orders', orderData),
    getByUser: (userId: string) => api.get(`/orders/user/${userId}`),
    getById: (orderId: string) => api.get(`/orders/${orderId}`),
    cancel: (orderId: string) => api.put(`/orders/${orderId}/cancel`)
};

export const invoiceService = {
    getAll: () => api.get('/invoices'),
    getInvoice: (orderId: string) => api.get(`/invoices/${orderId}`),
    generate: (orderId: string) => api.post('/invoices/generate', { orderId })
};

export const productService = {
    getAll: () => api.get('/products')
};

export const paymentService = {
    createPaymentIntent: (amount: number, currency: string) => api.post('/payments/create-payment-intent', { amount, currency })
};

export default api;
