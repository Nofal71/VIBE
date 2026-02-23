"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lead = void 0;
const sequelize_1 = require("sequelize");
const modelHooks_1 = require("../utils/modelHooks");
class Lead extends sequelize_1.Model {
    id;
    first_name;
    last_name;
    email;
    status_id;
    static initModel(sequelize, tenantId, userId = 'system') {
        Lead.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            first_name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
            last_name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
            email: { type: sequelize_1.DataTypes.STRING, allowNull: false },
            status_id: { type: sequelize_1.DataTypes.STRING, allowNull: false, defaultValue: 'NEW' },
        }, {
            sequelize,
            modelName: 'Lead',
            tableName: 'leads',
            timestamps: true,
        });
        (0, modelHooks_1.applyGlobalHooks)(Lead, tenantId, userId);
    }
}
exports.Lead = Lead;
