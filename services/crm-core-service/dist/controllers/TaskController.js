"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const TenantConnectionManager_1 = require("../config/TenantConnectionManager");
const Task_1 = require("../models/Task");
class TaskController {
    static async initTask(tenantId) {
        const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
        Task_1.Task.initModel(sequelize, tenantId);
        await Task_1.Task.sync({ alter: true });
    }
    static async getTasks(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            await TaskController.initTask(tenantId);
            const { assigned_to, lead_id } = req.query;
            const where = {};
            if (assigned_to)
                where['assigned_to'] = assigned_to;
            if (lead_id)
                where['lead_id'] = lead_id;
            const tasks = await Task_1.Task.findAll({ where, order: [['due_date', 'ASC']] });
            res.status(200).json({ tasks });
        }
        catch (error) {
            console.error('[TaskController] getTasks failed:', error);
            res.status(500).json({ error: 'Failed to retrieve tasks.' });
        }
    }
    static async createTask(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            await TaskController.initTask(tenantId);
            const { lead_id, assigned_to, title, description, due_date, status } = req.body;
            if (!assigned_to || !title || !due_date) {
                res.status(400).json({ error: 'assigned_to, title, and due_date are required.' });
                return;
            }
            const task = await Task_1.Task.create({
                lead_id: lead_id || null,
                assigned_to,
                title,
                description: description || '',
                due_date,
                status: status || 'TODO',
            });
            res.status(201).json({ task });
        }
        catch (error) {
            console.error('[TaskController] createTask failed:', error);
            res.status(500).json({ error: 'Failed to create task.' });
        }
    }
    static async updateTask(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            await TaskController.initTask(tenantId);
            const { id } = req.params;
            const task = await Task_1.Task.findByPk(id);
            if (!task) {
                res.status(404).json({ error: 'Task not found.' });
                return;
            }
            await task.update(req.body);
            res.status(200).json({ task });
        }
        catch (error) {
            console.error('[TaskController] updateTask failed:', error);
            res.status(500).json({ error: 'Failed to update task.' });
        }
    }
    static async deleteTask(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            await TaskController.initTask(tenantId);
            const { id } = req.params;
            const task = await Task_1.Task.findByPk(id);
            if (!task) {
                res.status(404).json({ error: 'Task not found.' });
                return;
            }
            await task.destroy();
            res.status(200).json({ message: 'Task deleted successfully.' });
        }
        catch (error) {
            console.error('[TaskController] deleteTask failed:', error);
            res.status(500).json({ error: 'Failed to delete task.' });
        }
    }
}
exports.TaskController = TaskController;
