import { Request, Response } from 'express';
import { getTenantRoleModel } from '../utils/TenantConnection';
import { resolveDbNameFromTenantId } from '../utils/masterDbResolver';

export class RoleController {
    static async getRoles(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            if (!tenantId) { res.status(400).json({ error: 'x-tenant-id header is missing' }); return; }

            const dbName = await resolveDbNameFromTenantId(tenantId);
            if (!dbName) { res.status(404).json({ error: 'Tenant DB not found' }); return; }

            const RoleModel = await getTenantRoleModel(dbName);
            const roles = await RoleModel.findAll();

            res.status(200).json({ roles });
        } catch (error) {
            console.error('Error fetching tenant roles:', error);
            res.status(500).json({ error: 'Failed to fetch roles' });
        }
    }

    static async updateRole(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const tenantId = req.headers['x-tenant-id'] as string;

            if (!tenantId) { res.status(400).json({ error: 'x-tenant-id header is missing' }); return; }

            const dbName = await resolveDbNameFromTenantId(tenantId);
            if (!dbName) { res.status(404).json({ error: 'Tenant DB not found' }); return; }

            const RoleModel = await getTenantRoleModel(dbName);
            const role: any = await RoleModel.findByPk(id);

            if (!role) { res.status(404).json({ error: 'Role not found' }); return; }
            if (role.is_default) {
                res.status(403).json({ error: 'Default blueprint roles cannot be edited or tampered with.' });
                return;
            }

            role.name = name;
            await role.save();

            res.status(200).json({ message: 'Role updated successfully', role });
        } catch (error) {
            console.error('Error updating tenant role:', error);
            res.status(500).json({ error: 'Failed to update role' });
        }
    }

    static async deleteRole(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const tenantId = req.headers['x-tenant-id'] as string;

            if (!tenantId) { res.status(400).json({ error: 'x-tenant-id header is missing' }); return; }

            const dbName = await resolveDbNameFromTenantId(tenantId);
            if (!dbName) { res.status(404).json({ error: 'Tenant DB not found' }); return; }

            const RoleModel = await getTenantRoleModel(dbName);
            const role: any = await RoleModel.findByPk(id);

            if (!role) { res.status(404).json({ error: 'Role not found' }); return; }
            if (role.is_default) {
                res.status(403).json({ error: 'Default blueprint roles cannot be deleted.' });
                return;
            }

            await role.destroy();

            res.status(200).json({ message: 'Role deleted successfully' });
        } catch (error) {
            console.error('Error deleting tenant role:', error);
            res.status(500).json({ error: 'Failed to delete role' });
        }
    }
}
