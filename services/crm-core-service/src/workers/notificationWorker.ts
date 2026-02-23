import { redisBus } from '../config/redisBus';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { Notification } from '../models/Notification';

// Generic admin role fallback — overridden if real admin role UUID is provided in the event payload
const ADMIN_ROLE_FALLBACK = 'admin-role-id';

export const startNotificationWorker = (): void => {
    redisBus.subscribe('DEAL_STATE_APPROVED', async (message: string) => {
        try {
            const payload = JSON.parse(message);
            const { tenant_id, deal_id, new_state, admin_role_id } = payload;

            if (!tenant_id || !deal_id) {
                console.warn('[NotificationWorker] Missing tenant_id or deal_id in payload. Skipping.');
                return;
            }

            // Only trigger notification systems when the DFA closes on WON
            if (new_state !== 'WON') {
                console.log(`[NotificationWorker] Deal ${deal_id} transitioned to ${new_state}. No notification needed.`);
                return;
            }

            const sequelize = await TenantConnectionManager.getConnection(tenant_id);
            Notification.initModel(sequelize);
            await Notification.sync({ alter: true });

            const roleTarget = admin_role_id || ADMIN_ROLE_FALLBACK;

            await Notification.create({
                user_id: null,
                role_id: roleTarget,
                message: `🎉 Deal ${deal_id} was successfully marked as WON! Great work — review the account and arrange next steps.`,
                is_read: false,
            });

            console.log(`[NotificationWorker] WON notification broadcast to role [${roleTarget}] for deal ${deal_id} in tenant ${tenant_id}.`);
        } catch (error) {
            console.error('[NotificationWorker] Failed to handle DEAL_STATE_APPROVED event:', error);
        }
    });

    console.log('[NotificationWorker] Armed — listening for DEAL_STATE_APPROVED events.');
};
