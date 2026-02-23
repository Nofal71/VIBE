import { Model, DataTypes } from 'sequelize';
import { masterSequelize } from '../config/MasterDatabase';

export class Company extends Model {
    public id!: string;
    public db_name!: string;
}

Company.init(
    {
        id: { type: DataTypes.UUID, primaryKey: true },
        db_name: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize: masterSequelize, tableName: 'companies' }
);

export class Domain extends Model {
    public id!: string;
    public company_id!: string;
    public domain_name!: string;
}

Domain.init(
    {
        id: { type: DataTypes.UUID, primaryKey: true },
        company_id: { type: DataTypes.UUID, allowNull: false },
        domain_name: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize: masterSequelize, tableName: 'domains' }
);

Company.hasMany(Domain, { foreignKey: 'company_id' });
Domain.belongsTo(Company, { foreignKey: 'company_id' });
