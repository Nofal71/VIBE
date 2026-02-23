"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const sequelize_1 = require("sequelize");
const modelHooks_1 = require("../utils/modelHooks");
class Task extends sequelize_1.Model {
    id;
    lead_id;
    assigned_to;
    title;
    description;
    due_date;
    status;
    static initModel(sequelize, tenantId, userId = 'system') {
        Task.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            lead_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: true,
            },
            assigned_to: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            title: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            due_date: {
                type: sequelize_1.DataTypes.DATEONLY,
                allowNull: false,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('TODO', 'IN_PROGRESS', 'DONE'),
                allowNull: false,
                defaultValue: 'TODO',
            },
        }, {
            sequelize,
            modelName: 'Task',
            tableName: 'tasks',
            timestamps: true,
        });
        (0, modelHooks_1.applyGlobalHooks)(Task, tenantId, userId);
    }
}
exports.Task = Task;
