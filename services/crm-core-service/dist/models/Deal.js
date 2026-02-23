"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deal = void 0;
const sequelize_1 = require("sequelize");
const modelHooks_1 = require("../utils/modelHooks");
class Deal extends sequelize_1.Model {
    id;
    lead_id;
    title;
    current_state;
    amount;
    static initModel(sequelize, tenantId, userId = 'system') {
        const model = Deal.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            lead_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
            title: { type: sequelize_1.DataTypes.STRING, allowNull: false },
            current_state: { type: sequelize_1.DataTypes.STRING, allowNull: false, defaultValue: 'NEW' },
            amount: { type: sequelize_1.DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
        }, {
            sequelize,
            modelName: 'Deal',
            tableName: 'deals',
            timestamps: true,
        });
        (0, modelHooks_1.applyGlobalHooks)(Deal, tenantId, userId);
        return model;
    }
}
exports.Deal = Deal;
