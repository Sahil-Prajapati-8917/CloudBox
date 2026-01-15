import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import authService from '../services/authService';
import { AuthContextType, AuthUser, LoginCredentials, RegisterData, ApiError } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = useCallback(async () => {
        try {
            const token = authService.getCurrentUser();
            if (token) {
                // For now, just set the user with token
                // In a real app, you'd verify the token with the backend
                setUser({ token, _id: '', name: '', email: '' });
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            authService.logout();
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true);
            const data = await authService.login(credentials);
            setUser(data);
        } catch (error: any) {
            console.error('Login failed:', error);
            throw new Error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        try {
            setIsLoading(true);
            const userData = await authService.register(data);
            setUser(userData);
        } catch (error: any) {
            console.error('Registration failed:', error);
            throw new Error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        setIsLoading(false);
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
