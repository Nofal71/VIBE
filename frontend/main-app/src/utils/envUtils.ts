// ─────────────────────────────────────────────────────────────────────────────
//  Environment Utilities
//  Single source of truth for environment-aware values used across the frontend.
//  Import from here instead of hard-coding domain strings anywhere.
// ─────────────────────────────────────────────────────────────────────────────

const hostname = window.location.hostname;

// ── Base Domain ───────────────────────────────────────────────────────────────

/**
 * Returns the base domain for the current environment.
 *
 * - Local dev:   'localhost'
 * - Production:  'ihsolution.tech'
 *
 * Use this anywhere you need to construct tenant URLs, embed snippet hostnames,
 * or canonical links — never hardcode 'ihsolution.tech' directly.
 *
 * @example
 *   const tenantUrl = `https://${subdomain}.${getBaseDomain()}`;
 */
export const getBaseDomain = (): string =>
    hostname.endsWith('.localhost') || hostname === 'localhost' || hostname === '127.0.0.1'
        ? 'localhost'
        : 'ihsolution.tech';

// ── Protocol ──────────────────────────────────────────────────────────────────

/**
 * Returns 'http' for local development and 'https' for production.
 * Caddy handles TLS termination in production via ACME (Let's Encrypt).
 */
export const getProtocol = (): 'http' | 'https' =>
    getBaseDomain() === 'localhost' ? 'http' : 'https';

// ── API Gateway URL ───────────────────────────────────────────────────────────

/**
 * Returns the full API gateway root URL (without trailing slash).
 *
 * - Local:  'http://api.localhost'
 * - Prod:   'https://api.ihsolution.tech'
 */
export const getApiGateway = (): string =>
    `${getProtocol()}://api.${getBaseDomain()}`;

// ── Tenant URL Builder ────────────────────────────────────────────────────────

/**
 * Constructs the full URL for a given tenant subdomain.
 *
 * @param subdomain - The company/tenant subdomain (e.g. 'demo', 'elite-re')
 * @returns Full URL string, e.g. 'https://demo.ihsolution.tech'
 *
 * @example
 *   const link = getTenantUrl('demo');
 *   // → 'http://demo.localhost' (local) or 'https://demo.ihsolution.tech' (prod)
 */
export const getTenantUrl = (subdomain: string): string =>
    `${getProtocol()}://${subdomain}.${getBaseDomain()}`;

// ── Web Form Embed Base ───────────────────────────────────────────────────────

/**
 * Returns the public-facing gateway base for web-to-lead embed snippets.
 * Used in WebFormBuilder.tsx to generate embeddable form code.
 *
 * - Local:  'http://api.localhost/core'
 * - Prod:   'https://api.ihsolution.tech/core'
 */
export const getWebFormGateway = (): string =>
    `${getApiGateway()}/core`;

// ── Environment Flag ──────────────────────────────────────────────────────────

/** True when running in local development mode. */
export const isLocalEnv = (): boolean => getBaseDomain() === 'localhost';

/** True when running in production. */
export const isProductionEnv = (): boolean => getBaseDomain() === 'ihsolution.tech';
