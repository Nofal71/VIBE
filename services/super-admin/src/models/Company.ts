import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Plan } from './Plan';
import { DepartmentBlueprint } from './DepartmentBlueprint';

export interface CompanyAttributes {
    id: string;
    name: string;
    plan_id: string;
    department_id: string;
    db_name: string;
    db_user?: string;
    db_password?: string;
    status: 'active' | 'suspended';
}

export interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id'> { }

export class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
    declare id: string;
    declare name: string;
    declare plan_id: string;
    declare department_id: string;
    declare db_name: string;
    declare db_user?: string;
    declare db_password?: string;
    declare status: 'active' | 'suspended';

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Company.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        plan_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Plan,
                key: 'id',
            },
        },
        department_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: DepartmentBlueprint,
                key: 'id',
            },
        },
        db_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        db_user: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        db_password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('active', 'suspended'),
            allowNull: false,
            defaultValue: 'active',
        },
    },
    {
        sequelize,
        tableName: 'companies',
        timestamps: true,
    }
);
