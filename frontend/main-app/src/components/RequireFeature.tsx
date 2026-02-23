import React from 'react';
import { usePermissions } from '../context/PermissionContext';

interface RequireFeatureProps {
    feature: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}


const RequireFeature: React.FC<RequireFeatureProps> = ({
    feature,
    fallback = null,
    children,
}) => {
    const { canAccessFeature, isLoading } = usePermissions();

    
    if (isLoading) return null;

    
    if (canAccessFeature(feature)) {
        return <>{children}</>;
    }

    
    return <>{fallback}</>;
};

export default RequireFeature;
