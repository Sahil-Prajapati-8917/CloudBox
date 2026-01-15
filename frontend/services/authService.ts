import api from './api';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types';

const authService = {
    register: async (userData: RegisterData): Promise<AuthResponse> => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error: any) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    login: async (userData: LoginCredentials): Promise<AuthResponse> => {
        try {
            const response = await api.post('/auth/login', userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    },

    getUserProfile: async (): Promise<User> => {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error: any) {
            console.error('Profile fetch error:', error);
            throw error;
        }
    },

    logout: (): void => {
        try {
            localStorage.removeItem('token');
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    getCurrentUser: (): string | null => {
        try {
            return localStorage.getItem('token');
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    },

    isAuthenticated: (): boolean => {
        try {
            const token = localStorage.getItem('token');
            return !!token;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    },
};

export default authService;
