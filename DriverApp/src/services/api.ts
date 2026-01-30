import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const orderService = {
    getAll: () => api.get('/orders'),
    updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
    updateLocation: (id: string, location: { lat: number; lng: number }) => api.put(`/orders/${id}/location`, location)
};

export default api;
