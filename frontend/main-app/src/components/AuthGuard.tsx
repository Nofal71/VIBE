import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { token, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-black"><span className="text-white animate-pulse">Loading secure session...</span></div>;
    }

    if (!token || !user) {
        if (location.pathname.startsWith('/super-admin')) {
            return <Navigate to="/super-admin/login" replace />;
        }
        return <Navigate to="/login" replace />;
    }


    if (user.requires_password_change === true && location.pathname !== '/crm/change-password') {
        return <Navigate to="/crm/change-password" replace />;
    }

    if (user.requires_password_change === false && location.pathname === '/crm/change-password') {
        return <Navigate to="/crm/dashboard" replace />;
    }

    return <>{children}</>;
};
