"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const sequelize_1 = require("sequelize");
const modelHooks_1 = require("../utils/modelHooks");
class Note extends sequelize_1.Model {
    id;
    lead_id;
    content;
    author_id;
    visibility;
    createdAt;
    updatedAt;
    static initModel(sequelize, tenantId, userId = 'system') {
        Note.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            lead_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            content: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            },
            author_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            visibility: {
                type: sequelize_1.DataTypes.ENUM('PUBLIC', 'PRIVATE', 'ADMIN_ONLY'),
                allowNull: false,
                defaultValue: 'PUBLIC',
            },
        }, {
            sequelize,
            modelName: 'Note',
            tableName: 'lead_notes',
            timestamps: true,
        });
        (0, modelHooks_1.applyGlobalHooks)(Note, tenantId, userId);
    }
}
exports.Note = Note;
