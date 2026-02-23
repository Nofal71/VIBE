import axios, { AxiosError } from 'axios';

const hostname = window.location.hostname;

const isLocal = hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname.endsWith('.localhost');

const isProduction = hostname === 'ihsolution.tech'
    || hostname.endsWith('.ihsolution.tech');

const resolveBaseUrl = (): string => {
    return '/api';
};

const SYSTEM_SUBDOMAINS = new Set(['www', 'api', 'mail', 'smtp', 'ftp', 'localhost', '127.0.0.1', '']);

const resolveTenantId = (): string => {
    let subdomain = '';

    if (hostname.endsWith('.localhost')) {
        subdomain = hostname.slice(0, hostname.length - '.localhost'.length);
    } else if (hostname.endsWith('.ihsolution.tech')) {
        subdomain = hostname.slice(0, hostname.length - '.ihsolution.tech'.length);
    }

    return SYSTEM_SUBDOMAINS.has(subdomain) ? 'public' : subdomain;
};

const BASE_URL = resolveBaseUrl();
const TENANT_ID = resolveTenantId();

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        const overrideTenantId = localStorage.getItem('x-tenant-id');
        const effectiveTenantId = overrideTenantId ?? TENANT_ID;

        if (effectiveTenantId && effectiveTenantId !== 'public') {
            config.headers['x-tenant-id'] = effectiveTenantId;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 403) {
            const data = error.response.data as Record<string, unknown> | undefined;

            if (data?.['error'] === 'ACCOUNT_SUSPENDED') {
                localStorage.removeItem('jwt_token');
                window.location.replace('/suspended');

                return new Promise(() => { });
            }
        }

        return Promise.reject(error);
    }
);

export default api;

export const API_BASE_URL = BASE_URL;

export const CURRENT_TENANT_ID = TENANT_ID;

export const IS_LOCAL = isLocal;

export const IS_PRODUCTION = isProduction;
