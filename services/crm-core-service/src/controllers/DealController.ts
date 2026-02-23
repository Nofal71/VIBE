import { Request, Response } from 'express';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { Deal } from '../models/Deal';
import { redisBus } from '../config/redisBus';

export class DealController {
    static async requestStateTransition(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            const { id: dealId } = req.params;
            const { event } = req.body;

            if (!tenantId) {
                res.status(400).json({ error: 'Missing x-tenant-id header' });
                return;
            }

            if (!dealId || !event) {
                res.status(400).json({ error: 'Missing dealId or event' });
                return;
            }

            // 1. Get Dynamic Tenant Connection
            const sequelize = await TenantConnectionManager.getConnection(tenantId);

            // 2. Initialize Model Dynamically for this request
            const TenantDeal = Deal.initModel(sequelize, tenantId, 'system') as any;

            // 3. Find the Deal to get its current state
            const deal = await TenantDeal.findByPk(dealId);
            if (!deal) {
                res.status(404).json({ error: 'Deal not found' });
                return;
            }

            // 4. Publish exactly as state machine expects
            await redisBus.publish('DEAL_STATE_UPDATE_REQUESTED', {
                tenantId,
                dealId,
                currentState: deal.current_state,
                event,
            });

            // 5. Instantly return 202 Accepted allowing asynchronous resolution
            res.status(202).json({
                message: 'State transition requested successfully. System is processing it asynchronously.',
            });
        } catch (error) {
            console.error('State transition request error:', error);
            res.status(500).json({ error: 'Failed to process request.' });
        }
    }
}
