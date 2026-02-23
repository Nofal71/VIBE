import { sequelize } from '../config/database';
import { Plan } from './Plan';
import { DepartmentBlueprint } from './DepartmentBlueprint';
import { Company } from './Company';
import { Domain } from './Domain';


Plan.hasMany(Company, {
    sourceKey: 'id',
    foreignKey: 'plan_id',
    as: 'companies'
});

Company.belongsTo(Plan, {
    targetKey: 'id',
    foreignKey: 'plan_id',
    as: 'plan'
});

DepartmentBlueprint.hasMany(Company, {
    sourceKey: 'id',
    foreignKey: 'department_id',
    as: 'companies'
});

Company.belongsTo(DepartmentBlueprint, {
    targetKey: 'id',
    foreignKey: 'department_id',
    as: 'department'
});

Company.hasMany(Domain, {
    sourceKey: 'id',
    foreignKey: 'company_id',
    as: 'domains'
});

Domain.belongsTo(Company, {
    targetKey: 'id',
    foreignKey: 'company_id',
    as: 'company'
});

export {
    sequelize,
    Plan,
    DepartmentBlueprint,
    Company,
    Domain
};
