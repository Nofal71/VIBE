import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Company } from './Company';

export interface DomainAttributes {
    id: string;
    company_id: string;
    domain_name: string;
    is_verified: boolean;
}

export interface DomainCreationAttributes extends Optional<DomainAttributes, 'id' | 'is_verified'> { }

export class Domain extends Model<DomainAttributes, DomainCreationAttributes> implements DomainAttributes {
    declare id: string;
    declare company_id: string;
    declare domain_name: string;
    declare is_verified: boolean;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Domain.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Company,
                key: 'id',
            },
        },
        domain_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'domains',
        timestamps: true,
    }
);
