// ─────────────────────────────────────────────────────────────────────────────
//  Environment-Aware Axios Configuration
//  Detects local vs. production automatically from window.location.hostname.
//  No hard-coded API URL — everything is derived at runtime.
// ─────────────────────────────────────────────────────────────────────────────

import axios, { AxiosError } from 'axios';

// ── Environment Detection ─────────────────────────────────────────────────────

const hostname = window.location.hostname;

const isLocal = hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname.endsWith('.localhost');

const isProduction = hostname === 'ihsolution.tech'
    || hostname.endsWith('.ihsolution.tech');

// ── API Base URL ──────────────────────────────────────────────────────────────
//  Local  → Caddy at http://api.localhost  (port 80, wildcard .localhost)
//  Prod   → Caddy at https://api.ihsolution.tech (TLS via Caddy ACME)
//  Fallback  → use VITE env variable if somehow neither matches

const resolveBaseUrl = (): string => {
    // Relative path is most robust across different ports/subdomains
    return '/api';
};

// ── Tenant Subdomain Extraction ───────────────────────────────────────────────
//
//  Pattern:   <subdomain>.<base-domain>
//  Examples:
//    demo.localhost          → 'demo'
//    elite-re.ihsolution.tech → 'elite-re'
//    localhost               → 'public'   (Super Admin / main landing)
//    ihsolution.tech         → 'public'
//    api.localhost           → 'public'   (API gateway — no tenant context)
//    www.ihsolution.tech     → 'public'

const SYSTEM_SUBDOMAINS = new Set(['www', 'api', 'mail', 'smtp', 'ftp', 'localhost', '127.0.0.1', '']);

const resolveTenantId = (): string => {
    let subdomain = '';

    if (hostname.endsWith('.localhost')) {
        // e.g. "demo.localhost" → "demo"
        subdomain = hostname.slice(0, hostname.length - '.localhost'.length);
    } else if (hostname.endsWith('.ihsolution.tech')) {
        // e.g. "elite-re.ihsolution.tech" → "elite-re"
        subdomain = hostname.slice(0, hostname.length - '.ihsolution.tech'.length);
    }
    // else: plain "localhost", "ihsolution.tech", "127.0.0.1" etc. → subdomain stays ''

    return SYSTEM_SUBDOMAINS.has(subdomain) ? 'public' : subdomain;
};

const BASE_URL = resolveBaseUrl();
const TENANT_ID = resolveTenantId();

// ── Axios Instance ────────────────────────────────────────────────────────────

const api = axios.create({ baseURL: BASE_URL });

// ─────────────────────────────────────────────────────────────────────────────
//  Request Interceptor — Attach Auth + Tenant Headers
// ─────────────────────────────────────────────────────────────────────────────

api.interceptors.request.use(
    (config) => {
        // Bearer token from auth storage
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Tenant header — use runtime-derived value, with localStorage override
        // for cases like Super Admin tunnelling into a specific tenant.
        const overrideTenantId = localStorage.getItem('x-tenant-id');
        const effectiveTenantId = overrideTenantId ?? TENANT_ID;

        if (effectiveTenantId && effectiveTenantId !== 'public') {
            config.headers['x-tenant-id'] = effectiveTenantId;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────────────────────
//  Response Interceptor — Gateway Lockout (Phase 24)
// ─────────────────────────────────────────────────────────────────────────────

api.interceptors.response.use(
    // Pass-through successful responses
    (response) => response,

    // Global error gate
    (error: AxiosError) => {
        if (error.response?.status === 403) {
            const data = error.response.data as Record<string, unknown> | undefined;

            if (data?.['error'] === 'ACCOUNT_SUSPENDED') {
                // Clear session to prevent retry loops
                localStorage.removeItem('jwt_token');

                // Hard redirect — bypasses React Router to clear all in-flight requests
                window.location.replace('/suspended');

                // Return never-resolving Promise to silence downstream handlers
                return new Promise(() => { /* intentionally never resolves */ });
            }
        }

        return Promise.reject(error);
    }
);

// ─────────────────────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────────────────────

export default api;

/** Resolved API base URL (useful for constructing public embed snippet URLs) */
export const API_BASE_URL = BASE_URL;

/** Resolved tenant ID for the current hostname */
export const CURRENT_TENANT_ID = TENANT_ID;

/** Whether the current environment is local development */
export const IS_LOCAL = isLocal;

/** Whether the current environment is production */
export const IS_PRODUCTION = isProduction;
