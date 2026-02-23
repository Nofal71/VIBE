"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const sequelize_1 = require("sequelize");
class Ticket extends sequelize_1.Model {
    id;
    lead_id;
    assigned_to;
    subject;
    description;
    status;
    priority;
    createdAt;
    updatedAt;
    static initModel(sequelize) {
        return Ticket.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            lead_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: true,
            },
            assigned_to: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: true,
            },
            subject: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED'),
                allowNull: false,
                defaultValue: 'OPEN',
            },
            priority: {
                type: sequelize_1.DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
                allowNull: false,
            },
        }, {
            sequelize,
            tableName: 'tickets',
            timestamps: true,
        });
    }
}
exports.Ticket = Ticket;
