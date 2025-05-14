import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://netwrkly-backend.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    register: async (data: { email: string; role: string; firebaseUid: string }, token: string) => {
        try {
            const response = await api.post('/auth/register', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Registration error:', error);
            throw error;
        }
    }
};

export const creatorProfileService = {
    getProfile: async () => {
        try {
            const response = await api.get('/creator-profiles/me');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error('Access denied. Please log in again.');
            }
            throw error;
        }
    },
    updateProfile: async (data: any) => {
        try {
            const response = await api.put('/creator-profiles/me', data);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error('Access denied. Please log in again.');
            }
            throw error;
        }
    }
}; 