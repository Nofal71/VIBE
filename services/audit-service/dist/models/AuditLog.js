"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const sequelize_1 = require("sequelize");
class AuditLog extends sequelize_1.Model {
    id;
    user_id;
    action;
    table_name;
    record_id;
    old_values;
    new_values;
    createdAt;
    updatedAt;
    static initModel(sequelize) {
        return AuditLog.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: true,
            },
            action: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            table_name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            record_id: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            old_values: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
            },
            new_values: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'audit_logs',
            timestamps: true,
        });
    }
}
exports.AuditLog = AuditLog;
