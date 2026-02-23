"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAuditListener = void 0;
const redisBus_1 = require("../config/redisBus");
const TenantConnectionManager_1 = require("../config/TenantConnectionManager");
const AuditLog_1 = require("../models/AuditLog");
const startAuditListener = () => {
    redisBus_1.redisBus.subscribe('AUDIT_LOG_EVENT', async (message) => {
        try {
            const payload = JSON.parse(message);
            const { tenant_id, action, table_name, record_id, old_values, new_values, updated_by } = payload;
            console.log(`[Audit Service] Auditing ${action} on ${table_name} for tenant ${tenant_id}`);
            // Secure dynamic connection
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenant_id);
            // Ensure local tenant mapping models exist securely
            AuditLog_1.AuditLog.initModel(sequelize);
            // Insert Audit Tracking using JSON bounds
            await AuditLog_1.AuditLog.create({
                user_id: updated_by || null,
                action,
                table_name,
                record_id,
                old_values,
                new_values
            });
        }
        catch (error) {
            console.error('[Audit Service] Failed to execute strict Audit Tracking constraint:', error);
        }
    });
    console.log('[Audit Service] Armed! Listening to AUDIT_LOG_EVENT globally.');
};
exports.startAuditListener = startAuditListener;
