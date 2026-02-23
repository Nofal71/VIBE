import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';

interface RequireMasterAuthProps {
    children: React.ReactNode;
}

const RequireMasterAuth: React.FC<RequireMasterAuthProps> = ({ children }) => {
    const [isValid, setIsValid] = useState<boolean | string | null>(null);

    useEffect(() => {
        const verifyMasterRole = async () => {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                setIsValid('No token found in localStorage.');
                return;
            }

            try {
                const res = await api.get('/auth/me', { headers: { 'x-tenant-id': 'public' } });
                const user = res.data.user || res.data;

                if (user && user.role === 'SUPER_ADMIN') {
                    setIsValid(true);
                } else {
                    setIsValid(`User is not SUPER_ADMIN. Role is: ${user?.role}`);
                }
            } catch (error: any) {
                console.error('MasterAuth verification failed:', error);
                const msg = error.response ? `${error.response.status}: ${JSON.stringify(error.response.data)}` : error.message;
                setIsValid(`API Error: ${msg}`);
            }
        };

        verifyMasterRole();
    }, []);

    if (isValid === null) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
                Verifying Master Access...
            </div>
        );
    }

    if (typeof isValid === 'string') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
                <div className="bg-slate-900 border border-red-500/20 shadow-2xl p-8 rounded-xl max-w-lg w-full text-center">
                    <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-xl font-bold text-white mb-4">Auth Verification Failed</h2>
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl font-mono text-sm break-all text-left">
                        {isValid}
                    </div>
                    <button
                        onClick={() => { localStorage.removeItem('jwt_token'); window.location.href = '/super-admin/login'; }}
                        className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    // Only render children if strictly valid
    if (isValid === true) {
        return <>{children}</>;
    }

    return null;
};

export default RequireMasterAuth;
