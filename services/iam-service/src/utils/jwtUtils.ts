import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'placeholder_secret';

export interface TokenPayload {
    userId: string;
    roleId: string;
    tenantId: string;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, SECRET);
};
