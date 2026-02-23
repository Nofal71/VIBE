"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRecord = void 0;
const sequelize_1 = require("sequelize");
class FileRecord extends sequelize_1.Model {
    id;
    lead_id;
    file_name;
    file_path;
    mime_type;
    size_bytes;
    uploaded_by;
    createdAt;
    updatedAt;
    static initModel(sequelize) {
        return FileRecord.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            lead_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            file_name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            file_path: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            mime_type: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            size_bytes: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            uploaded_by: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
        }, {
            sequelize,
            tableName: 'file_records',
            timestamps: true,
        });
    }
}
exports.FileRecord = FileRecord;
