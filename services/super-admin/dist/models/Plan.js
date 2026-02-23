"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plan = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Plan extends sequelize_1.Model {
    id;
    name;
    max_leads;
    storage_limit_mb;
    features;
    createdAt;
    updatedAt;
}
exports.Plan = Plan;
Plan.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    max_leads: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    storage_limit_mb: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    features: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'plans',
    timestamps: true,
});
