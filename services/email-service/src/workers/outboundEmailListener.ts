import { redisBus } from '../config/redisBus';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { EmailActivity } from '../models/EmailActivity';
import { BrevoService } from '../services/BrevoService';
import { v4 as uuidv4 } from 'uuid';

interface OutboundEmailPayload {
    tenantId: string;
    leadId: string;
    to: string;
    subject: string;
    body: string;
}

export const startOutboundEmailListener = async (): Promise<void> => {
    await redisBus.subscribe('SEND_OUTBOUND_EMAIL', async (payload: OutboundEmailPayload) => {
        const { tenantId, leadId, to, subject, body } = payload;

        if (!tenantId || !leadId || !to || !subject || !body) {
            console.error('Invalid payload received on SEND_OUTBOUND_EMAIL', payload);
            return;
        }

        try {
            const isSent = await BrevoService.sendEmail(to, subject, body);

            if (isSent) {
                const sequelize = await TenantConnectionManager.getConnection(tenantId);
                const TenantEmailActivity = EmailActivity.initModel(sequelize);

                await TenantEmailActivity.create({
                    lead_id: leadId,
                    message_id: `<${uuidv4()}@ihsolution.tech>`, // Example message ID generation
                    direction: 'OUTBOUND',
                    subject,
                    body,
                    received_at: new Date(),
                });

                console.log(`Logged outbound email to ${to} for Lead ${leadId} in Tenant ${tenantId}`);
            } else {
                console.error(`Failed to send email to ${to} for Tenant ${tenantId}`);
            }
        } catch (error) {
            console.error(`Error processing outbound email for Tenant ${tenantId}:`, error);
        }
    });

    console.log('OutboundEmailListener started and listening for SEND_OUTBOUND_EMAIL');
};
