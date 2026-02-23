"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastController = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const sequelize_2 = require("sequelize");
// ─── Tenant connection pool (lightweight — separate from TCM in crm-core) ─────
const tenantConnectionCache = new Map();
async function getTenantConnection(dbName) {
    if (tenantConnectionCache.has(dbName)) {
        return tenantConnectionCache.get(dbName);
    }
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
    const dbUser = process.env.DB_USER || 'admin';
    const dbPassword = process.env.DB_PASSWORD || 'admin';
    const seq = new sequelize_2.Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: 'mysql',
        logging: false,
        pool: { max: 3, min: 0, acquire: 20000, idle: 5000 },
    });
    await seq.authenticate();
    tenantConnectionCache.set(dbName, seq);
    return seq;
}
// ─── Controller ───────────────────────────────────────────────────────────────
class BroadcastController {
    /**
     * POST /api/broadcasts/send
     * Super Admin only — inserts a Notification record into every active
     * tenant database. user_id and role_id are NULL, which signals the
     * frontend notification system that this is a global/broadcast message.
     *
     * Body: { message: string, title?: string, priority?: 'INFO'|'WARNING'|'CRITICAL' }
     */
    static async sendGlobalBroadcast(req, res) {
        try {
            const { message, title, priority = 'INFO' } = req.body;
            if (!message || message.trim().length === 0) {
                res.status(400).json({ error: '`message` is required and cannot be empty.' });
                return;
            }
            const VALID_PRIORITIES = ['INFO', 'WARNING', 'CRITICAL'];
            if (!VALID_PRIORITIES.includes(priority)) {
                res.status(400).json({ error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}.` });
                return;
            }
            // 1. Fetch all ACTIVE companies from Master DB
            const companies = await database_1.sequelize.query(`SELECT id, name, db_name, status FROM \`companies\` WHERE status = 'active'`, { type: sequelize_1.QueryTypes.SELECT });
            if (companies.length === 0) {
                res.status(200).json({ message: 'No active tenants found.', delivered_to: 0 });
                return;
            }
            console.log(`[BroadcastController] Dispatching broadcast to ${companies.length} active tenant(s).`);
            const results = [];
            // 2. Iterate each tenant safely — failures are isolated per tenant
            for (const company of companies) {
                try {
                    const seq = await getTenantConnection(company.db_name);
                    // Ensure notifications table exists (safe on fresh tenants)
                    await seq.query(`CREATE TABLE IF NOT EXISTS \`notifications\` (
                            id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                            user_id     VARCHAR(36)  NULL COMMENT 'NULL = global broadcast',
                            role_id     VARCHAR(36)  NULL COMMENT 'NULL = all roles',
                            title       VARCHAR(255) NOT NULL DEFAULT 'System Notification',
                            message     TEXT         NOT NULL,
                            priority    ENUM('INFO','WARNING','CRITICAL') NOT NULL DEFAULT 'INFO',
                            is_read     TINYINT(1)   NOT NULL DEFAULT 0,
                            source      VARCHAR(100) NOT NULL DEFAULT 'SUPER_ADMIN_BROADCAST',
                            created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                        )`, { type: sequelize_1.QueryTypes.RAW });
                    // Insert the broadcast record
                    await seq.query(`INSERT INTO \`notifications\`
                            (user_id, role_id, title, message, priority, source)
                         VALUES
                            (NULL, NULL, :title, :message, :priority, 'SUPER_ADMIN_BROADCAST')`, {
                        replacements: {
                            title: title ?? 'Broadcast from System Admin',
                            message: message.trim(),
                            priority,
                        },
                        type: sequelize_1.QueryTypes.INSERT,
                    });
                    results.push({ tenant: company.name, success: true });
                    console.log(`[BroadcastController] ✓ Delivered to tenant: ${company.name} (${company.db_name})`);
                }
                catch (tenantError) {
                    const errMsg = tenantError instanceof Error ? tenantError.message : String(tenantError);
                    console.error(`[BroadcastController] ✗ Failed for tenant ${company.name}:`, errMsg);
                    results.push({ tenant: company.name, success: false, error: errMsg });
                }
            }
            const successCount = results.filter((r) => r.success).length;
            const failCount = results.length - successCount;
            res.status(200).json({
                message: `Broadcast dispatched.`,
                delivered_to: successCount,
                failed: failCount,
                results,
            });
        }
        catch (error) {
            console.error('[BroadcastController] sendGlobalBroadcast failed:', error);
            res.status(500).json({ error: 'Failed to dispatch global broadcast.' });
        }
    }
}
exports.BroadcastController = BroadcastController;
