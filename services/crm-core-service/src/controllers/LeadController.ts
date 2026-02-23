import { Request, Response } from 'express';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { Lead } from '../models/Lead';

export class LeadController {

    private static async initLead(tenantId: string): Promise<void> {
        const sequelize = await TenantConnectionManager.getConnection(tenantId);
        Lead.initModel(sequelize, tenantId);
        await Lead.sync({ alter: true });
    }

    static async getLeads(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;
        try {
            await LeadController.initLead(tenantId);
            const leads = await Lead.findAll({ order: [['createdAt', 'DESC']] });
            res.status(200).json({ leads });
        } catch (error) {
            console.error('[LeadController] getLeads failed:', error);
            res.status(500).json({ error: 'Failed to fetch leads' });
        }
    }

    static async getLeadById(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        try {
            await LeadController.initLead(tenantId);
            const lead = await Lead.findByPk(id);
            if (!lead) {
                res.status(404).json({ error: 'Lead not found' });
                return;
            }
            res.status(200).json({ lead });
        } catch (error) {
            console.error('[LeadController] getLeadById failed:', error);
            res.status(500).json({ error: 'Failed to fetch lead' });
        }
    }

    static async createLead(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;
        try {
            await LeadController.initLead(tenantId);
            const lead = await Lead.create(req.body);
            res.status(201).json({ message: 'Lead created successfully', lead });
        } catch (error) {
            console.error('[LeadController] createLead failed:', error);
            res.status(500).json({ error: 'Failed to create lead' });
        }
    }

    static async updateLead(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        try {
            await LeadController.initLead(tenantId);
            const lead = await Lead.findByPk(id);
            if (!lead) {
                res.status(404).json({ error: 'Lead not found' });
                return;
            }
            await lead.update(req.body);
            res.status(200).json({ message: 'Lead updated successfully', lead });
        } catch (error) {
            console.error('[LeadController] updateLead failed:', error);
            res.status(500).json({ error: 'Failed to update lead' });
        }
    }

    static async deleteLead(req: Request, res: Response): Promise<void> {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        try {
            await LeadController.initLead(tenantId);
            const lead = await Lead.findByPk(id);
            if (!lead) {
                res.status(404).json({ error: 'Lead not found' });
                return;
            }
            await lead.destroy();
            res.status(200).json({ message: 'Lead deleted successfully' });
        } catch (error) {
            console.error('[LeadController] deleteLead failed:', error);
            res.status(500).json({ error: 'Failed to delete lead' });
        }
    }
}
