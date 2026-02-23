import { Request, Response } from 'express';
import { getTenantUserModel } from '../utils/TenantConnection';
import { resolveDbNameFromTenantId } from '../utils/masterDbResolver';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export class UserController {
    static async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            if (!tenantId) { res.status(400).json({ error: 'x-tenant-id missing' }); return; }

            const dbName = await resolveDbNameFromTenantId(tenantId);
            if (!dbName) { res.status(404).json({ error: 'Tenant DB not found' }); return; }

            const UserModel = await getTenantUserModel(dbName);
            const users = await UserModel.findAll({ attributes: { exclude: ['password_hash'] } });

            res.status(200).json({ users });
        } catch (error) {
            console.error('Error fetching tenant users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }

    static async createUser(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            const { email, first_name, last_name, role_id, temp_password } = req.body;

            if (!tenantId || !email || !temp_password) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }

            const dbName = await resolveDbNameFromTenantId(tenantId);
            if (!dbName) { res.status(404).json({ error: 'Tenant DB not found' }); return; }

            const UserModel = await getTenantUserModel(dbName);

            const existingUser = await UserModel.findOne({ where: { email } });
            if (existingUser) { res.status(409).json({ error: 'User already exists' }); return; }

            const hashedPassword = await bcrypt.hash(temp_password, 10);

            const newUser = await UserModel.create({
                id: uuidv4(),
                email,
                first_name,
                last_name,
                role_id,
                password_hash: hashedPassword,
                requires_password_change: true
            });

            // Note: In a complete implementation, we should also insert this user into Master DB
            // We'll trust the global syncing or a message queue handles master propagation in the future.

            res.status(201).json({ message: 'User created', user: newUser });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }
}
