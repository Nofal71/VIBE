"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Domain = exports.Company = exports.DepartmentBlueprint = exports.Plan = exports.sequelize = void 0;
const database_1 = require("../config/database");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return database_1.sequelize; } });
const Plan_1 = require("./Plan");
Object.defineProperty(exports, "Plan", { enumerable: true, get: function () { return Plan_1.Plan; } });
const DepartmentBlueprint_1 = require("./DepartmentBlueprint");
Object.defineProperty(exports, "DepartmentBlueprint", { enumerable: true, get: function () { return DepartmentBlueprint_1.DepartmentBlueprint; } });
const Company_1 = require("./Company");
Object.defineProperty(exports, "Company", { enumerable: true, get: function () { return Company_1.Company; } });
const Domain_1 = require("./Domain");
Object.defineProperty(exports, "Domain", { enumerable: true, get: function () { return Domain_1.Domain; } });
// Setup Relationships
Plan_1.Plan.hasMany(Company_1.Company, {
    sourceKey: 'id',
    foreignKey: 'plan_id',
    as: 'companies'
});
Company_1.Company.belongsTo(Plan_1.Plan, {
    targetKey: 'id',
    foreignKey: 'plan_id',
    as: 'plan'
});
DepartmentBlueprint_1.DepartmentBlueprint.hasMany(Company_1.Company, {
    sourceKey: 'id',
    foreignKey: 'department_id',
    as: 'companies'
});
Company_1.Company.belongsTo(DepartmentBlueprint_1.DepartmentBlueprint, {
    targetKey: 'id',
    foreignKey: 'department_id',
    as: 'department'
});
Company_1.Company.hasMany(Domain_1.Domain, {
    sourceKey: 'id',
    foreignKey: 'company_id',
    as: 'domains'
});
Domain_1.Domain.belongsTo(Company_1.Company, {
    targetKey: 'id',
    foreignKey: 'company_id',
    as: 'company'
});
