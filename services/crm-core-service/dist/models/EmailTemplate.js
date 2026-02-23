"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailTemplate = void 0;
const sequelize_1 = require("sequelize");
const modelHooks_1 = require("../utils/modelHooks");
class EmailTemplate extends sequelize_1.Model {
    id;
    name;
    subject;
    body_html;
    /** Array of variable names used in the template, e.g. ['first_name', 'company_name'] */
    variables;
    createdAt;
    updatedAt;
    static initModel(sequelize, tenantId, userId = 'system') {
        EmailTemplate.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: sequelize_1.DataTypes.STRING(150),
                allowNull: false,
            },
            subject: {
                type: sequelize_1.DataTypes.STRING(250),
                allowNull: false,
            },
            body_html: {
                type: sequelize_1.DataTypes.TEXT('long'),
                allowNull: false,
            },
            variables: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            },
        }, {
            sequelize,
            modelName: 'EmailTemplate',
            tableName: 'email_templates',
            timestamps: true,
        });
        (0, modelHooks_1.applyGlobalHooks)(EmailTemplate, tenantId, userId);
    }
}
exports.EmailTemplate = EmailTemplate;
