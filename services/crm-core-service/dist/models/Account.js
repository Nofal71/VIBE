"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const sequelize_1 = require("sequelize");
const modelHooks_1 = require("../utils/modelHooks");
class Account extends sequelize_1.Model {
    id;
    name;
    industry;
    website;
    static initModel(sequelize, tenantId, userId = 'system') {
        Account.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
            },
            industry: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
            },
            website: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
            },
        }, {
            sequelize,
            modelName: 'Account',
            tableName: 'accounts',
            timestamps: true,
        });
        (0, modelHooks_1.applyGlobalHooks)(Account, tenantId, userId);
    }
}
exports.Account = Account;
