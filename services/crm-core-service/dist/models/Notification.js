"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const sequelize_1 = require("sequelize");
class Notification extends sequelize_1.Model {
    id;
    user_id;
    role_id;
    message;
    is_read;
    static initModel(sequelize) {
        Notification.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: true,
            },
            role_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: true,
            },
            message: {
                type: sequelize_1.DataTypes.STRING(512),
                allowNull: false,
            },
            is_read: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        }, {
            sequelize,
            modelName: 'Notification',
            tableName: 'notifications',
            timestamps: true,
        });
        // Notifications are system-generated; no global audit hooks needed to avoid circular events
    }
}
exports.Notification = Notification;
