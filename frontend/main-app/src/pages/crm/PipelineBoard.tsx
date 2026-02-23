import React, { useState } from 'react';
import api from '../../api/axiosConfig';

export enum DealState {
    NEW = 'NEW',
    CONTACTED = 'CONTACTED',
    QUALIFIED = 'QUALIFIED',
    PROPOSAL_SENT = 'PROPOSAL_SENT',
    NEGOTIATION = 'NEGOTIATION',
    WON = 'WON',
    LOST = 'LOST',
}

export enum DealEvent {
    INITIATE_CONTACT = 'INITIATE_CONTACT',
    QUALIFY_LEAD = 'QUALIFY_LEAD',
    SEND_PROPOSAL = 'SEND_PROPOSAL',
    BEGIN_NEGOTIATION = 'BEGIN_NEGOTIATION',
    ACCEPT_TERMS = 'ACCEPT_TERMS',
    REJECT_TERMS = 'REJECT_TERMS',
}

interface Deal {
    id: string;
    title: string;
    state: DealState;
}

const PipelineBoard: React.FC = () => {
    const [deals, setDeals] = useState<Deal[]>([
        { id: '1', title: 'Acme Corp Deal', state: DealState.NEW },
        { id: '2', title: 'Global Tech Contract', state: DealState.CONTACTED },
        { id: '3', title: 'Small Business Package', state: DealState.QUALIFIED },
    ]);

    const columns = [DealState.NEW, DealState.CONTACTED, DealState.QUALIFIED, DealState.NEGOTIATION];

    const eventMapping: Record<string, DealEvent> = {
        [`${DealState.NEW}->${DealState.CONTACTED}`]: DealEvent.INITIATE_CONTACT,
        [`${DealState.CONTACTED}->${DealState.QUALIFIED}`]: DealEvent.QUALIFY_LEAD,
        [`${DealState.QUALIFIED}->${DealState.PROPOSAL_SENT}`]: DealEvent.SEND_PROPOSAL,
        [`${DealState.PROPOSAL_SENT}->${DealState.NEGOTIATION}`]: DealEvent.BEGIN_NEGOTIATION,
    };

    const handleDragEnd = async (dealId: string, currentDealState: DealState, targetState: DealState) => {
        const requiredEvent = eventMapping[`${currentDealState}->${targetState}`];

        if (!requiredEvent) {
            alert(`Invalid Direct Transition from ${currentDealState} to ${targetState}`);
            return;
        }

        setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, state: targetState } : d));

        try {
            await api.post(`/deals/${dealId}/transition`, { event: requiredEvent });
            console.log('Transition requested successfully.');
        } catch (error) {
            console.error('Failed to trigger state machine:', error);
            setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, state: currentDealState } : d));
            alert('Transition failed due to server error or validation.');
        }
    };

    return (
        <div className="p-8 h-screen bg-gray-100 flex flex-col">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Dynamic Pipeline</h1>
            <div className="flex flex-1 gap-6 overflow-x-auto">
                {columns.map((col) => (
                    <div key={col} className="bg-white p-4 rounded-lg shadow min-w-[300px] flex flex-col">
                        <h3 className="font-semibold text-gray-700 border-b pb-2 mb-4">{col.replace('_', ' ')}</h3>
                        <div className="flex-1 space-y-4">
                            {deals.filter((d) => d.state === col).map((deal) => (
                                <div
                                    key={deal.id}
                                    className="bg-blue-50 border border-blue-200 p-3 rounded shadow-sm cursor-grab hover:bg-blue-100"
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('dealId', deal.id)}
                                >
                                    <p className="font-medium text-gray-800">{deal.title}</p>
                                </div>
                            ))}

                            <div
                                className="h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const dealId = e.dataTransfer.getData('dealId');
                                    const deal = deals.find(d => d.id === dealId);
                                    if (deal && deal.state !== col) {
                                        handleDragEnd(deal.id, deal.state, col);
                                    }
                                }}
                            >
                                Drop here
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PipelineBoard;
