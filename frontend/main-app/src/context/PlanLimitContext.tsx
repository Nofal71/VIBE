import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useTenantContext } from './TenantContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlanLimits {
    max_leads?: number;
    max_users?: number;
    max_file_storage_mb?: number;
    plan_name?: string;
    [key: string]: unknown;
}

interface PlanLimitContextProps {
    planLimits: PlanLimits;
    /** Returns true if allowed, false if limit exceeded */
    checkLeadLimit: (currentLeadCount: number) => boolean;
    showUpgradeModal: boolean;
    setShowUpgradeModal: (show: boolean) => void;
    /** The reason/message to show in the modal */
    limitReason: string;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const PlanLimitContext = createContext<PlanLimitContextProps>({
    planLimits: {},
    checkLeadLimit: () => true,
    showUpgradeModal: false,
    setShowUpgradeModal: () => { },
    limitReason: '',
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const PlanLimitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { uiConfig } = useTenantContext();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [limitReason, setLimitReason] = useState('');

    // Extract plan_limits from the ui_config_json payload if present
    // The tenant config API can include plan_limits alongside ui_config_json
    const planLimits: PlanLimits = (uiConfig as any)?.plan_limits ?? {};

    /**
     * Checks if the current lead count is within the plan's lead limit.
     * If exceeded, triggers the upgrade modal and returns false.
     */
    const checkLeadLimit = useCallback(
        (currentLeadCount: number): boolean => {
            const maxLeads = planLimits.max_leads;

            // No limit configured — allow
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const usePlanLimits = () => useContext(PlanLimitContext);
