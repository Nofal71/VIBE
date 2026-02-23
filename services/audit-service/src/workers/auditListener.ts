import { redisBus } from '../config/redisBus';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { AuditLog } from '../models/AuditLog';

export const startAuditListener = () => {
    redisBus.subscribe('AUDIT_LOG_EVENT', async (message: string) => {
        try {
            const payload = JSON.parse(message);
            const { tenant_id, action, table_name, record_id, old_values, new_values, updated_by } = payload;

            console.log(`[Audit Service] Auditing ${action} on ${table_name} for tenant ${tenant_id}`);

            // Secure dynamic connection
            const sequelize = await TenantConnectionManager.getConnection(tenant_id);

            // Ensure local tenant mapping models exist securely
            AuditLog.initModel(sequelize);

            // Insert Audit Tracking using JSON bounds
            await AuditLog.create({
                user_id: updated_by || null,
                action,
                table_name,
                record_id,
                old_values,
                new_values
            });

        } catch (error) {
            console.error('[Audit Service] Failed to execute strict Audit Tracking constraint:', error);
        }
    });

    console.log('[Audit Service] Armed! Listening to AUDIT_LOG_EVENT globally.');
};
