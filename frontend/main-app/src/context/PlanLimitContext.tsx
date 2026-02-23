import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useTenantContext } from './TenantContext';



interface PlanLimits {
    max_leads?: number;
    max_users?: number;
    max_file_storage_mb?: number;
    plan_name?: string;
    [key: string]: unknown;
}

interface PlanLimitContextProps {
    planLimits: PlanLimits;
    
    checkLeadLimit: (currentLeadCount: number) => boolean;
    showUpgradeModal: boolean;
    setShowUpgradeModal: (show: boolean) => void;
    
    limitReason: string;
}



const PlanLimitContext = createContext<PlanLimitContextProps>({
    planLimits: {},
    checkLeadLimit: () => true,
    showUpgradeModal: false,
    setShowUpgradeModal: () => { },
    limitReason: '',
});



export const PlanLimitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { uiConfig } = useTenantContext();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [limitReason, setLimitReason] = useState('');

    
    
    const planLimits: PlanLimits = (uiConfig as any)?.plan_limits ?? {};

    
    const checkLeadLimit = useCallback(
        (currentLeadCount: number): boolean => {
            const maxLeads = planLimits.max_leads;

            
            if (maxLeads === undefined || maxLeads === null) return true;

            if (currentLeadCount >= maxLeads) {
                setLimitReason(
                    `Your current plan (${planLimits.plan_name ?? 'Starter'}) allows a maximum of ${maxLeads.toLocaleString()} leads. You have reached this limit.`
                );
                setShowUpgradeModal(true);
                return false;
            }

            return true;
        },
        [planLimits]
    );

    return (
        <PlanLimitContext.Provider
            value={{ planLimits, checkLeadLimit, showUpgradeModal, setShowUpgradeModal, limitReason }}
        >
            {children}
        </PlanLimitContext.Provider>
    );
};



export const usePlanLimits = () => useContext(PlanLimitContext);
