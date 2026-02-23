"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const sequelize_1 = require("sequelize");
const modelHooks_1 = require("../utils/modelHooks");
class Invoice extends sequelize_1.Model {
    id;
    lead_id;
    amount;
    status;
    due_date;
    static initModel(sequelize, tenantId, userId = 'system') {
        Invoice.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            lead_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            amount: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('DRAFT', 'SENT', 'PAID'),
                allowNull: false,
                defaultValue: 'DRAFT',
            },
            due_date: {
                type: sequelize_1.DataTypes.DATEONLY,
                allowNull: false,
            },
        }, {
            sequelize,
            modelName: 'Invoice',
            tableName: 'invoices',
            timestamps: true,
        });
        (0, modelHooks_1.applyGlobalHooks)(Invoice, tenantId, userId);
    }
}
exports.Invoice = Invoice;
