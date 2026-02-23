import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axiosConfig';

interface Stage {
    name: string;
    color: string;
}

interface UiConfig {
    primary_color?: string;
    logo_url?: string;
    sidebar_theme?: 'dark' | 'light';
}

interface TenantContextProps {
    uiConfig: UiConfig;
    stages: Stage[];
    schemaJson: any;
    companyName: string;
    loading: boolean;
}

const defaultContext: TenantContextProps = {
    uiConfig: {},
    stages: [],
    schemaJson: { tables: [] },
    companyName: 'Tenant',
    loading: true,
};

const TenantContext = createContext<TenantContextProps>(defaultContext);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<Omit<TenantContextProps, 'loading'>>({
        uiConfig: {},
        stages: [],
        schemaJson: { tables: [] },
        companyName: 'Loading...'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await api.get('/tenant/config');
                setData({
                    uiConfig: response.data.ui_config_json || {},
                    stages: response.data.default_stages_json || [],
                    schemaJson: response.data.schema_json || { tables: [] },
                    companyName: response.data.company_name || 'Tenant',
                });
            } catch (err) {
                console.error('Failed to load Tenant Configuration Context', err);
                // Safely fail open to default schema on load error assuming unseeded UI
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    return (
        <TenantContext.Provider value={{ ...data, loading }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenantContext = () => useContext(TenantContext);
