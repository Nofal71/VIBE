"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Domain = exports.Company = void 0;
const sequelize_1 = require("sequelize");
const MasterDatabase_1 = require("../config/MasterDatabase");
class Company extends sequelize_1.Model {
    id;
    db_name;
}
exports.Company = Company;
Company.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    db_name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
}, { sequelize: MasterDatabase_1.masterSequelize, tableName: 'companies' });
class Domain extends sequelize_1.Model {
    id;
    company_id;
    domain_name;
}
exports.Domain = Domain;
Domain.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    company_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    domain_name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
}, { sequelize: MasterDatabase_1.masterSequelize, tableName: 'domains' });
Company.hasMany(Domain, { foreignKey: 'company_id' });
Domain.belongsTo(Company, { foreignKey: 'company_id' });
