"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOutboundEmailListener = void 0;
const redisBus_1 = require("../config/redisBus");
const TenantConnectionManager_1 = require("../config/TenantConnectionManager");
const EmailActivity_1 = require("../models/EmailActivity");
const BrevoService_1 = require("../services/BrevoService");
const uuid_1 = require("uuid");
const startOutboundEmailListener = async () => {
    await redisBus_1.redisBus.subscribe('SEND_OUTBOUND_EMAIL', async (payload) => {
        const { tenantId, leadId, to, subject, body } = payload;
        if (!tenantId || !leadId || !to || !subject || !body) {
            console.error('Invalid payload received on SEND_OUTBOUND_EMAIL', payload);
            return;
        }
        try {
            const isSent = await BrevoService_1.BrevoService.sendEmail(to, subject, body);
            if (isSent) {
                const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
                const TenantEmailActivity = EmailActivity_1.EmailActivity.initModel(sequelize);
                await TenantEmailActivity.create({
                    lead_id: leadId,
                    message_id: `<${(0, uuid_1.v4)()}@ihsolution.tech>`, // Example message ID generation
                    direction: 'OUTBOUND',
                    subject,
                    body,
                    received_at: new Date(),
                });
                console.log(`Logged outbound email to ${to} for Lead ${leadId} in Tenant ${tenantId}`);
            }
            else {
                console.error(`Failed to send email to ${to} for Tenant ${tenantId}`);
            }
        }
        catch (error) {
            console.error(`Error processing outbound email for Tenant ${tenantId}:`, error);
        }
    });
    console.log('OutboundEmailListener started and listening for SEND_OUTBOUND_EMAIL');
};
exports.startOutboundEmailListener = startOutboundEmailListener;
