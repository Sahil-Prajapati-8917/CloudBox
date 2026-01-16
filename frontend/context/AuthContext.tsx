import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import authService from '../services/authService';
import { AuthContextType, AuthUser, LoginCredentials, RegisterData, ApiError } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = useCallback(async () => {
        try {
            // Always clear any existing auth state on app start
            // Users must login fresh each time they enter the site
            console.log('Clearing authentication state on app start');
            authService.logout();
            setUser(null);
            console.log('Authentication state cleared');
        } catch (error) {
            console.error('Auth cleanup failed:', error);
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
