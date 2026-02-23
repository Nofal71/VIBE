"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImapSetting = void 0;
const sequelize_1 = require("sequelize");
class ImapSetting extends sequelize_1.Model {
    id;
    user_id;
    imap_host;
    imap_port;
    imap_username;
    imap_password;
    is_active;
    createdAt;
    updatedAt;
    static initModel(sequelize) {
        return ImapSetting.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            imap_host: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            imap_port: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            imap_username: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            imap_password: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            is_active: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        }, {
            sequelize,
            tableName: 'imap_settings',
            timestamps: true,
        });
    }
}
exports.ImapSetting = ImapSetting;
