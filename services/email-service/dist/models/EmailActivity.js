"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailActivity = void 0;
const sequelize_1 = require("sequelize");
class EmailActivity extends sequelize_1.Model {
    id;
    lead_id;
    message_id;
    direction;
    subject;
    body;
    received_at;
    createdAt;
    updatedAt;
    static initModel(sequelize) {
        return EmailActivity.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            lead_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            message_id: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            direction: {
                type: sequelize_1.DataTypes.ENUM('INBOUND', 'OUTBOUND'),
                allowNull: false,
            },
            subject: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            body: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            received_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
        }, {
            sequelize,
            tableName: 'email_activities',
            timestamps: true,
        });
    }
}
exports.EmailActivity = EmailActivity;
