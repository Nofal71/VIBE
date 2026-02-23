import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axiosConfig';

export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    tenant_id?: string;
    requires_password_change?: boolean;
}

interface AuthContextProps {
    user: User | null;
    token: string | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
    user: null,
    token: null,
    loading: true,
    refreshUser: async () => { },
    logout: () => { },
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const currentToken = localStorage.getItem('jwt_token');
            if (!currentToken) {
                setUser(null);
                setToken(null);
                setLoading(false);
                return;
            }
            const res = await api.get('/auth/me');
            setUser(res.data);
            setToken(currentToken);
        } catch (error) {
            console.error('Failed to fetch user context', error);
            setUser(null);
            setToken(null);
            localStorage.removeItem('jwt_token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const logout = () => {
        localStorage.removeItem('jwt_token');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, refreshUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
