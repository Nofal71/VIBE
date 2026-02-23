"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Domain = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Company_1 = require("./Company");
class Domain extends sequelize_1.Model {
    id;
    company_id;
    domain_name;
    is_verified;
    createdAt;
    updatedAt;
}
exports.Domain = Domain;
Domain.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    company_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: Company_1.Company,
            key: 'id',
        },
    },
    domain_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    is_verified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'domains',
    timestamps: true,
});
