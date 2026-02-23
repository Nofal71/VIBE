import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';

declare global {
    namespace Express {
        interface Request {
            user?: any;
            tenantId?: string;
        }
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        const tenantId = req.headers['x-tenant-id'] as string;
        if (!tenantId) {
            res.status(401).json({ error: 'Unauthorized: Missing x-tenant-id header' });
            return;
        }

        req.user = decoded;
        req.tenantId = tenantId;

        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
