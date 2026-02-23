"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startListener = void 0;
const redisBus_1 = require("../config/redisBus");
const TenantConnectionManager_1 = require("../config/TenantConnectionManager");
const Deal_1 = require("../models/Deal");
const startListener = async () => {
    await redisBus_1.redisBus.subscribe('DEAL_STATE_APPROVED', async (payload) => {
        const { tenantId, dealId, newState } = payload;
        if (!tenantId || !dealId || !newState) {
            console.error('Invalid payload received on DEAL_STATE_APPROVED', payload);
            return;
        }
        try {
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
            const TenantDeal = Deal_1.Deal.initModel(sequelize, tenantId, 'worker');
            const deal = await TenantDeal.findByPk(dealId);
            if (deal) {
                deal.current_state = newState;
                await deal.save();
                console.log(`Successfully persisted state ${newState} for Deal ${dealId} in Tenant DB ${tenantId}`);
            }
            else {
                console.warn(`Could not find Deal ${dealId} in Tenant DB ${tenantId} to update state.`);
            }
        }
        catch (error) {
            console.error(`Failed to update state for deal ${dealId} (Tenant: ${tenantId}):`, error);
        }
    });
    console.log('StateApprovedListener started and listening for DEAL_STATE_APPROVED');
};
exports.startListener = startListener;
