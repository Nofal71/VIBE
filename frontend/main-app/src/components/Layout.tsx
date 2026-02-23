import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import UpgradeModal from './UpgradeModal';
import { PlanLimitProvider } from '../context/PlanLimitContext';

export const Layout: React.FC = () => {
    const { scaleClass } = useTheme();

    return (
        <PlanLimitProvider>
            {}
            <UpgradeModal />

            <div className={`flex h-screen bg-gray-100 overflow-hidden font-sans ${scaleClass}`}>
                <Sidebar />
                <div className="flex-1 overflow-y-auto w-full">
                    <header className="bg-white shadow sticky top-0 z-10">
                        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                            <h1 className="text-xl font-bold leading-tight text-gray-900">Tenant Workspace</h1>
                        </div>
                    </header>
                    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </PlanLimitProvider>
    );
};
