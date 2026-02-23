"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAutomationEmailTrigger = void 0;
const redisBus_1 = require("../config/redisBus");
const BrevoService_1 = require("../services/BrevoService");
const startAutomationEmailTrigger = () => {
    redisBus_1.redisBus.subscribe('DEAL_STATE_APPROVED', async (message) => {
        try {
            const payload = JSON.parse(message);
            const { tenant_id, deal_id, new_state } = payload;
            if (new_state === 'WON') {
                console.log(`[Email Service Automations] Deal ${deal_id} marked as WON. Pushing sequence via Brevo.`);
                // Mock Lead Fetch Context via ID in production
                const mockLeadEmail = 'client@example.com';
                await BrevoService_1.BrevoService.sendEmail(mockLeadEmail, 'Congratulations! Your Deal has been finalized!', `<h1>Welcome!</h1><p>We are excited to proceed with deal parameter #${deal_id}.</p>`);
                console.log(`[Email Service Automations] Welcome payload dispatched securely for ${deal_id}.`);
            }
        }
        catch (error) {
            console.error('[Email Service Automations] Sequence fail trigger:', error);
        }
    });
    console.log('[Email Service Automations] Listening for Deal Pipeline approvals (DEAL_STATE_APPROVED).');
};
exports.startAutomationEmailTrigger = startAutomationEmailTrigger;
