import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const token = localStorage.getItem('jwt_token');
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
            } catch (error) {
                console.error('Auth verification failed', error);
                localStorage.removeItem('jwt_token');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-black"><span className="text-white animate-pulse">Loading secure session...</span></div>;
    }

    if (!token || !user) {
        if (location.pathname.startsWith('/super-admin')) {
            return <Navigate to="/super-admin/login" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    // First-Time Login Password Reset Logic
    if (user.requires_password_change === true && location.pathname !== '/crm/change-password') {
        return <Navigate to="/crm/change-password" replace />;
    }

    if (user.requires_password_change === false && location.pathname === '/crm/change-password') {
        return <Navigate to="/crm/dashboard" replace />;
    }

    return <>{children}</>;
};
