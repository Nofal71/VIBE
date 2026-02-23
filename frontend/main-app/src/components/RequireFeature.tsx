import React from 'react';
import { usePermissions } from '../context/PermissionContext';

interface RequireFeatureProps {
    feature: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Conditionally renders its children only when the logged-in user's role
 * has access to the specified `feature`.
 *
 * Usage:
 *   <RequireFeature feature="EXPORT_CSV">
 *     <ExportButton />
 *   </RequireFeature>
 *
 * If the feature is not permitted, returns `fallback` (default: null).
 * During the permission loading phase, renders nothing to avoid flash of
 * privileged content.
 */
const RequireFeature: React.FC<RequireFeatureProps> = ({
    feature,
    fallback = null,
    children,
}) => {
    const { canAccessFeature, isLoading } = usePermissions();

    // While permissions are loading, render nothing to prevent premature exposure
    if (isLoading) return null;

    // Feature is allowed (or no explicit restriction) — render children
    if (canAccessFeature(feature)) {
        return <>{children}</>;
    }

    // Feature is explicitly blocked for this role
    return <>{fallback}</>;
};

export default RequireFeature;
