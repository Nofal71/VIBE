import { Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { Task } from '../models/Task';

export class TaskController {
    private static async initTask(tenantId: string): Promise<void> {
        const sequelize = await TenantConnectionManager.getConnection(tenantId);
        Task.initModel(sequelize, tenantId);
        await Task.sync({ alter: true });
    }

    static async getTasks(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            await TaskController.initTask(tenantId);

            const { assigned_to, lead_id } = req.query;
            const where: WhereOptions = {};
            if (assigned_to) where['assigned_to'] = assigned_to as string;
            if (lead_id) where['lead_id'] = lead_id as string;

            const tasks = await Task.findAll({ where, order: [['due_date', 'ASC']] });
            res.status(200).json({ tasks });
        } catch (error) {
            console.error('[TaskController] getTasks failed:', error);
            res.status(500).json({ error: 'Failed to retrieve tasks.' });
        }
    }

    static async createTask(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            await TaskController.initTask(tenantId);

            const { lead_id, assigned_to, title, description, due_date, status } = req.body;
            if (!assigned_to || !title || !due_date) {
                res.status(400).json({ error: 'assigned_to, title, and due_date are required.' });
                return;
            }

            const task = await Task.create({
                lead_id: lead_id || null,
                assigned_to,
                title,
                description: description || '',
                due_date,
                status: status || 'TODO',
            });
            res.status(201).json({ task });
        } catch (error) {
            console.error('[TaskController] createTask failed:', error);
            res.status(500).json({ error: 'Failed to create task.' });
        }
    }

    static async updateTask(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            await TaskController.initTask(tenantId);

            const { id } = req.params;
            const task = await Task.findByPk(id);
            if (!task) {
                res.status(404).json({ error: 'Task not found.' });
                return;
            }

            await task.update(req.body);
            res.status(200).json({ task });
        } catch (error) {
            console.error('[TaskController] updateTask failed:', error);
            res.status(500).json({ error: 'Failed to update task.' });
        }
    }

    static async deleteTask(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            await TaskController.initTask(tenantId);

            const { id } = req.params;
            const task = await Task.findByPk(id);
            if (!task) {
                res.status(404).json({ error: 'Task not found.' });
                return;
            }

            await task.destroy();
            res.status(200).json({ message: 'Task deleted successfully.' });
        } catch (error) {
            console.error('[TaskController] deleteTask failed:', error);
            res.status(500).json({ error: 'Failed to delete task.' });
        }
    }
}
