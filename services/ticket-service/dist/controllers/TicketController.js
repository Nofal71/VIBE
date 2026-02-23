"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const TenantConnectionManager_1 = require("../config/TenantConnectionManager");
const Ticket_1 = require("../models/Ticket");
class TicketController {
    static async createTicket(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            if (!tenantId) {
                res.status(400).json({ error: 'Missing x-tenant-id header' });
                return;
            }
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
            const TenantTicket = Ticket_1.Ticket.initModel(sequelize);
            const newTicket = await TenantTicket.create(req.body);
            res.status(201).json({
                message: 'Ticket created successfully',
                ticket: newTicket,
            });
        }
        catch (error) {
            console.error('Error creating ticket:', error);
            res.status(500).json({ error: 'Failed to create ticket.' });
        }
    }
    static async getTickets(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            if (!tenantId) {
                res.status(400).json({ error: 'Missing x-tenant-id header' });
                return;
            }
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
            const TenantTicket = Ticket_1.Ticket.initModel(sequelize);
            const tickets = await TenantTicket.findAll();
            res.status(200).json({
                tickets,
            });
        }
        catch (error) {
            console.error('Error fetching tickets:', error);
            res.status(500).json({ error: 'Failed to fetch tickets.' });
        }
    }
}
exports.TicketController = TicketController;
