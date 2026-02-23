import { Request, Response, NextFunction } from 'express';
import { Sequelize, QueryTypes } from 'sequelize';

// ─── Master DB connection (singleton) ─────────────────────────────────────────

let masterSeq: Sequelize | null = null;

function getMasterConnection(): Sequelize {
    if (masterSeq) return masterSeq;

    masterSeq = new Sequelize(
        process.env.MASTER_DB_NAME || 'crm_master',
        process.env.DB_USER || 'admin',
        process.env.DB_PASSWORD || 'admin',
        {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            dialect: 'mysql',
            logging: false,
            pool: { max: 5, min: 0, acquire: 20000, idle: 10000 },
        }
    );
    return masterSeq;
}

// ─── In-memory cache to avoid a Master DB round-trip on every request ─────────

interface CachedStatus {
    status: 'active' | 'suspended';
    cachedAt: number; // epoch ms
}

const STATUS_CACHE = new Map<string, CachedStatus>();
const CACHE_TTL_MS = 30_000; // 30 seconds — balance freshness vs. DB load

async function getTenantStatus(tenantId: string): Promise<'active' | 'suspended' | null> {
    const now = Date.now();

    // Return cached entry if still fresh
    const cached = STATUS_CACHE.get(tenantId);
    if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
        return cached.status;
    }

    // Query Master DB
    try {
        const seq = getMasterConnection();
        const rows = await seq.query<{ status: 'active' | 'suspended' }>(
            'SELECT status FROM `companies` WHERE id = :tenantId LIMIT 1',
            { replacements: { tenantId }, type: QueryTypes.SELECT }
        );

        if (rows.length === 0) return null; // Unknown tenant — let auth handle it

        const { status } = rows[0];
        STATUS_CACHE.set(tenantId, { status, cachedAt: now });
        return status;

    } catch (err) {
        // On Master DB failure: fail open (allow request through) to avoid taking
        // the entire platform down if Master DB is briefly unavailable.
        console.error('[tenantStatusMiddleware] Master DB query failed, allowing request through:', err);
        return 'active';
    }
}

// ─── Exported cache invalidator (call after updateCompanyStatus) ──────────────

export function invalidateTenantStatusCache(tenantId: string): void {
    STATUS_CACHE.delete(tenantId);
    console.log(`[tenantStatusMiddleware] Cache invalidated for tenant: ${tenantId}`);
}

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * `checkTenantStatus` — runs BEFORE `requireAuth`.
 *
 * Reads the `x-tenant-id` header, checks the tenant's `status` field in the
 * Master DB (with a 30-second in-memory cache), and blocks with 403 if
 * the account is suspended.
 *
 * Usage in server.ts:
 *   app.use(checkTenantStatus);   ← add before auth middleware
 */
export const checkTenantStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const tenantId = req.headers['x-tenant-id'] as string | undefined;

    // Skip check for routes that don't carry a tenant context
    if (!tenantId) {
        next();
        return;
    }

    try {
        const status = await getTenantStatus(tenantId);

        if (status === 'suspended') {
            res.status(403).json({
                error: 'ACCOUNT_SUSPENDED',
                message: 'This account has been suspended. Please contact support to restore access.',
                tenant_id: tenantId,
            });
            return;
        }

        // Active or unknown — proceed to auth
        next();

    } catch (err) {
        // Unexpected error in the middleware itself — fail open
        console.error('[tenantStatusMiddleware] Unexpected error:', err);
        next();
    }
};
