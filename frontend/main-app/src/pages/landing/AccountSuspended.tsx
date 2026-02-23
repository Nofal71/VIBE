import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccountSuspended: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">

            {}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-900/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-900/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gray-900/60 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-xl w-full text-center">

                {}
                <div className="relative inline-flex items-center justify-center mb-8">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-900/80 to-orange-900/60 border border-red-800/50 flex items-center justify-center shadow-2xl shadow-red-900/50">
                        <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                    </div>
                    {}
                    <div className="absolute inset-0 rounded-3xl border border-red-600/30 animate-ping" />
                </div>

                {}
                <div className="inline-flex items-center gap-2 bg-red-900/40 border border-red-800/60 text-red-400 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Service Suspended
                </div>

                {}
                <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3 leading-tight">
                    Service Temporarily<br />Unavailable
                </h1>

                {}
                <p className="text-gray-400 text-base leading-relaxed mb-8">
                    The CRM instance for this domain has been <strong className="text-red-400">suspended</strong>.
                    Access to all tenant resources has been restricted pending account resolution.
                </p>

                {}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-orange-900/50 flex items-center justify-center text-base">💳</div>
                            <p className="font-bold text-white text-sm">For Administrators</p>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Please update your billing details or contact the platform support team to restore access immediately.
                        </p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-900/50 flex items-center justify-center text-base">👥</div>
                            <p className="font-bold text-white text-sm">For Staff Members</p>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Please contact your account administrator for updates on service restoration.
                        </p>
                    </div>
                </div>

                {}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                        href="mailto:support@ihsolution.tech"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white font-extrabold px-8 py-3.5 rounded-xl hover:from-red-700 hover:to-orange-700 transition shadow-lg shadow-red-900/50 text-sm"
                    >
                        📧 Contact Support
                    </a>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 font-bold px-8 py-3.5 rounded-xl transition text-sm"
                    >
                        ← Back to Home
                    </button>
                </div>

                {}
                <div className="mt-10 pt-6 border-t border-gray-800">
                    <p className="text-xs text-gray-600">
                        Error Code: <code className="font-mono text-gray-500">403 ACCOUNT_SUSPENDED</code>
                        <span className="mx-2">·</span>
                        <a href="mailto:support@ihsolution.tech" className="text-indigo-500 hover:text-indigo-400 transition font-semibold">
                            support@ihsolution.tech
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AccountSuspended;
