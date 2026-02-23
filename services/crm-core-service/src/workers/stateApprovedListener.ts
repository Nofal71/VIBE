import { redisBus } from '../config/redisBus';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { Deal } from '../models/Deal';

interface StateApprovedPayload {
    tenantId: string;
    dealId: string;
    newState: string;
}

export const startListener = async (): Promise<void> => {
    await redisBus.subscribe('DEAL_STATE_APPROVED', async (payload: StateApprovedPayload) => {
        const { tenantId, dealId, newState } = payload;

        if (!tenantId || !dealId || !newState) {
            console.error('Invalid payload received on DEAL_STATE_APPROVED', payload);
            return;
        }

        try {
            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            const TenantDeal = Deal.initModel(sequelize, tenantId, 'worker') as any;

            const deal = await TenantDeal.findByPk(dealId);

            if (deal) {
                deal.current_state = newState;
                await deal.save();
                console.log(`Successfully persisted state ${newState} for Deal ${dealId} in Tenant DB ${tenantId}`);
            } else {
                console.warn(`Could not find Deal ${dealId} in Tenant DB ${tenantId} to update state.`);
            }
        } catch (error) {
            console.error(`Failed to update state for deal ${dealId} (Tenant: ${tenantId}):`, error);
        }
    });

    console.log('StateApprovedListener started and listening for DEAL_STATE_APPROVED');
};
