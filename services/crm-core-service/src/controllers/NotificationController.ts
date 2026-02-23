import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { Notification } from '../models/Notification';

export class NotificationController {
    private static async initNotification(tenantId: string): Promise<void> {
        const sequelize = await TenantConnectionManager.getConnection(tenantId);
        Notification.initModel(sequelize);
        await Notification.sync({ alter: true });
    }

    /**
     * Fetches unread notifications scoped to a user_id or role_id.
     * Query params: ?user_id=<uuid>&role_id=<uuid>
     */
    static async getUnreadNotifications(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            await NotificationController.initNotification(tenantId);

            const { user_id, role_id } = req.query;
            const orConditions: any[] = [{ is_read: false }];

            if (user_id) {
                orConditions.push({ user_id: user_id as string });
            }
            if (role_id) {
                orConditions.push({ role_id: role_id as string });
            }

            // Return all unread notifications scoped to this user or their role
            const notifications = await Notification.findAll({
                where: {
                    is_read: false,
                    [Op.or]: [
                        ...(user_id ? [{ user_id: user_id as string }] : []),
                        ...(role_id ? [{ role_id: role_id as string }] : []),
                        // Fallback: broadcast notifications with no specific target
                        { user_id: null, role_id: null },
                    ],
                },
                order: [['createdAt', 'DESC']],
                limit: 50,
            });

            res.status(200).json({ notifications });
        } catch (error) {
            console.error('[NotificationController] getUnreadNotifications failed:', error);
            res.status(500).json({ error: 'Failed to fetch notifications.' });
        }
    }

    /**
     * Marks a single notification as read by ID.
     */
    static async markAsRead(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            await NotificationController.initNotification(tenantId);

            const { id } = req.params;
            const notification = await Notification.findByPk(id);
            if (!notification) {
                res.status(404).json({ error: 'Notification not found.' });
                return;
            }

            await notification.update({ is_read: true });
            res.status(200).json({ message: 'Notification marked as read.', notification });
        } catch (error) {
            console.error('[NotificationController] markAsRead failed:', error);
            res.status(500).json({ error: 'Failed to mark notification as read.' });
        }
    }

    /**
     * Marks ALL unread notifications as read for a given user or role.
     */
    static async markAllAsRead(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;
            await NotificationController.initNotification(tenantId);

            const { user_id, role_id } = req.body;
            const whereOr: any[] = [];
            if (user_id) whereOr.push({ user_id });
            if (role_id) whereOr.push({ role_id });
            whereOr.push({ user_id: null, role_id: null });

            await Notification.update(
                { is_read: true },
                { where: { is_read: false, [Op.or]: whereOr } }
            );

            res.status(200).json({ message: 'All notifications marked as read.' });
        } catch (error) {
            console.error('[NotificationController] markAllAsRead failed:', error);
            res.status(500).json({ error: 'Failed to mark all notifications as read.' });
        }
    }
}
