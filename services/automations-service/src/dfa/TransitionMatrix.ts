import { DealState, DealEvent } from './PipelineAlphabet';

export const TransitionMatrix: Record<DealState, Partial<Record<DealEvent, DealState>>> = {
    [DealState.NEW]: {
        [DealEvent.INITIATE_CONTACT]: DealState.CONTACTED,
        [DealEvent.REJECT_TERMS]: DealState.LOST, // Fast track to lost
    },
    [DealState.CONTACTED]: {
        [DealEvent.QUALIFY_LEAD]: DealState.QUALIFIED,
        [DealEvent.REJECT_TERMS]: DealState.LOST,
    },
    [DealState.QUALIFIED]: {
        [DealEvent.SEND_PROPOSAL]: DealState.PROPOSAL_SENT,
        [DealEvent.REJECT_TERMS]: DealState.LOST,
    },
    [DealState.PROPOSAL_SENT]: {
        [DealEvent.BEGIN_NEGOTIATION]: DealState.NEGOTIATION,
        [DealEvent.ACCEPT_TERMS]: DealState.WON,
        [DealEvent.REJECT_TERMS]: DealState.LOST,
    },
    [DealState.NEGOTIATION]: {
        [DealEvent.ACCEPT_TERMS]: DealState.WON,
        [DealEvent.REJECT_TERMS]: DealState.LOST,
    },
    [DealState.WON]: {},  // Terminal State
    [DealState.LOST]: {}, // Terminal State
};
