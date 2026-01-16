import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import authService from '../services/authService';
import { AuthContextType, AuthUser, LoginCredentials, RegisterData, ApiError } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = useCallback(async () => {
        try {
            // Check if there's a stored token
            const token = authService.getCurrentUser();
            if (token) {
                // Validate token by fetching user profile
                const userData = await authService.getUserProfile();
                setUser({ ...userData, token });
                console.log('User authenticated from stored token');
            } else {
                setUser(null);
                console.log('No stored token found');
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            // If token is invalid, clear it
            authService.logout();
            setUser(null);
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
