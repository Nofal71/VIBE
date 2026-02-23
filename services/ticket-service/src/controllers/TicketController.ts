import { Request, Response } from 'express';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { Ticket } from '../models/Ticket';

export class TicketController {
    static async createTicket(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;

            if (!tenantId) {
                res.status(400).json({ error: 'Missing x-tenant-id header' });
                return;
            }

            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            const TenantTicket = Ticket.initModel(sequelize);

            const newTicket = await TenantTicket.create(req.body);

            res.status(201).json({
                message: 'Ticket created successfully',
                ticket: newTicket,
            });
        } catch (error) {
            console.error('Error creating ticket:', error);
            res.status(500).json({ error: 'Failed to create ticket.' });
        }
    }

    static async getTickets(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;

            if (!tenantId) {
                res.status(400).json({ error: 'Missing x-tenant-id header' });
                return;
            }

            const sequelize = await TenantConnectionManager.getConnection(tenantId);
            const TenantTicket = Ticket.initModel(sequelize);

            const tickets = await TenantTicket.findAll();

            res.status(200).json({
                tickets,
            });
        } catch (error) {
            console.error('Error fetching tickets:', error);
            res.status(500).json({ error: 'Failed to fetch tickets.' });
        }
    }
}
