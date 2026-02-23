import { DealState, DealEvent } from './PipelineAlphabet';
import { TransitionMatrix } from './TransitionMatrix';

export class DealStateMachine {
    static transition(currentState: DealState, event: DealEvent): DealState {
        const validTransitions = TransitionMatrix[currentState];

        if (!validTransitions) {
            throw new Error(`Invalid State Transition: State '${currentState}' is unrecognized.`);
        }

        const nextState = validTransitions[event];

        if (!nextState) {
            throw new Error(`Invalid State Transition: Cannot process event '${event}' from state '${currentState}'.`);
        }

        return nextState;
    }
}
