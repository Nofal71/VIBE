import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { generateToken, verifyToken } from '../utils/jwtUtils';

const router = Router();

// ─── POST /auth/login ─────────────────────────────────────────────────────────
// Accepts { email, password }
// Returns  { token, user: { id, email, role, first_name, last_name, requires_password_change } }

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body as { email: string; password: string };

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // MySQL BOOLEAN is TINYINT(1) — Sequelize may return 0/1 instead of false/true
        if (user.is_active == false || (user.is_active as unknown as number) === 0) {
            return res.status(403).json({ error: 'Account is inactive.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = generateToken({
            userId: user.id,
            roleId: user.role_id ?? '',
            tenantId: user.tenant_id ?? 'public',
        });

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
                tenant_id: user.tenant_id,
                requires_password_change: user.requires_password_change,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
// Returns the current authenticated user from the JWT token.

router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided.' });
        }
        const { verifyToken } = await import('../utils/jwtUtils');
        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token) as { userId: string };
        const user = await User.findOne({ where: { id: payload.userId } });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        return res.json({
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            tenant_id: user.tenant_id,
            requires_password_change: user.requires_password_change,
        });
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
});

router.post('/change-password', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided.' });
        }
        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token) as { userId: string };

        const { new_password } = req.body;
        if (!new_password) {
            return res.status(400).json({ error: 'New password is required.' });
        }

        const user = await User.findOne({ where: { id: payload.userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const newHash = await bcrypt.hash(new_password, 10);
        await user.update({
            password_hash: newHash,
            requires_password_change: false,
        });

        return res.json({ success: true });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ error: 'Failed to update password.' });
    }
});

export default router;
