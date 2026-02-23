import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axiosConfig';



interface FieldLock {
    column_name: string;
    table_name: string;
    can_read: boolean;
    can_write: boolean;
}

interface FeaturePermission {
    feature_name: string;
    is_allowed: boolean;
}

interface PermissionContextValue {
    fieldLocks: FieldLock[];
    featurePermissions: FeaturePermission[];
    canAccessFeature: (featureName: string) => boolean;
    canReadField: (tableName: string, columnName: string) => boolean;
    canWriteField: (tableName: string, columnName: string) => boolean;
    roleId: string | null;
    isLoading: boolean;
}



const PermissionContext = createContext<PermissionContextValue>({
    fieldLocks: [],
    featurePermissions: [],
    canAccessFeature: () => true,   
    canReadField: () => true,
    canWriteField: () => true,
    roleId: null,
    isLoading: true,
});



export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fieldLocks, setFieldLocks] = useState<FieldLock[]>([]);
    const [featurePermissions, setFeaturePermissions] = useState<FeaturePermission[]>([]);
    const [roleId, setRoleId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPermissions = async () => {
            try {
                
                const profileRes = await api.get('/iam/me').catch(() => null);
                const currentRoleId: string | null = profileRes?.data?.role_id ?? null;
                setRoleId(currentRoleId);

                if (!currentRoleId) {
                    
                    setIsLoading(false);
                    return;
                }

                
                const [locksRes, featuresRes] = await Promise.allSettled([
                    api.get(`/iam/field-locks?role_id=${currentRoleId}&table_name=leads`),
                    api.get(`/iam/feature-permissions?role_id=${currentRoleId}`),
                ]);

                if (locksRes.status === 'fulfilled') {
                    setFieldLocks(locksRes.value.data?.locks ?? []);
                }

                if (featuresRes.status === 'fulfilled') {
                    setFeaturePermissions(featuresRes.value.data?.permissions ?? []);
                }
            } catch (error) {
                console.warn('[PermissionContext] Failed to load permissions — defaulting to open access.', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPermissions();
    }, []);

    
    const canAccessFeature = useCallback(
        (featureName: string): boolean => {
            const rule = featurePermissions.find((p) => p.feature_name === featureName);
            if (!rule) return true; 
            return rule.is_allowed;
        },
        [featurePermissions]
    );

    const canReadField = useCallback(
        (tableName: string, columnName: string): boolean => {
            const lock = fieldLocks.find(
                (l) => l.table_name === tableName && l.column_name === columnName
            );
            if (!lock) return true;
            return lock.can_read;
        },
        [fieldLocks]
    );

    const canWriteField = useCallback(
        (tableName: string, columnName: string): boolean => {
            const lock = fieldLocks.find(
                (l) => l.table_name === tableName && l.column_name === columnName
            );
            if (!lock) return true;
            return lock.can_write;
        },
        [fieldLocks]
    );

    return (
        <PermissionContext.Provider
            value={{
                fieldLocks,
                featurePermissions,
                canAccessFeature,
                canReadField,
                canWriteField,
                roleId,
                isLoading,
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};



export const usePermissions = (): PermissionContextValue => {
    return useContext(PermissionContext);
};
