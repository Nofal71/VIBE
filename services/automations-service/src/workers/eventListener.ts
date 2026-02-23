import { redisBus } from '../config/redisBus';
import { DealStateMachine } from '../dfa/DealStateMachine';
import { DealState, DealEvent } from '../dfa/PipelineAlphabet';

interface StateUpdateRequestPayload {
    tenantId: string;
    dealId: string;
    currentState: DealState;
    event: DealEvent;
}

export const startWorkers = async (): Promise<void> => {
    await redisBus.subscribe('DEAL_STATE_UPDATE_REQUESTED', async (payload: StateUpdateRequestPayload) => {
        const { tenantId, dealId, currentState, event } = payload;

        if (!tenantId || !dealId || !currentState || !event) {
            console.error('Invalid payload received on DEAL_STATE_UPDATE_REQUESTED', payload);
            return;
        }

        try {
            console.log(`Processing transition for deal ${dealId} (Tenant: ${tenantId}): ${currentState} -> event: ${event}`);

            const newState = DealStateMachine.transition(currentState, event);

            await redisBus.publish('DEAL_STATE_APPROVED', {
                tenantId,
                dealId,
                newState,
                previousState: currentState,
                event,
                timestamp: new Date().toISOString()
            });

            console.log(`Transition successful. Deal ${dealId} is now ${newState}.`);
        } catch (error: any) {
            console.error(`Transition failed for deal ${dealId}:`, error.message);

            await redisBus.publish('DEAL_STATE_REJECTED', {
                tenantId,
                dealId,
                attemptedState: currentState,
                attemptedEvent: event,
                reason: error.message || 'Unknown error during transition',
                timestamp: new Date().toISOString()
            });
        }
    });

    console.log('EventListener workers started and listening for DEAL_STATE_UPDATE_REQUESTED');
};
