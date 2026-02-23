"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Plan_1 = require("./Plan");
const DepartmentBlueprint_1 = require("./DepartmentBlueprint");
class Company extends sequelize_1.Model {
    id;
    name;
    plan_id;
    department_id;
    db_name;
    db_user;
    db_password;
    status;
    createdAt;
    updatedAt;
}
exports.Company = Company;
Company.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    plan_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: Plan_1.Plan,
            key: 'id',
        },
    },
    department_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: DepartmentBlueprint_1.DepartmentBlueprint,
            key: 'id',
        },
    },
    db_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    db_user: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    db_password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'suspended'),
        allowNull: false,
        defaultValue: 'active',
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'companies',
    timestamps: true,
});
