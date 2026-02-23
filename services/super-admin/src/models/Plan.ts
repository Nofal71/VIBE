import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PlanAttributes {
    id: string;
    name: string;
    max_leads: number;
    storage_limit_mb: number;
    features: Record<string, any>;
}

export interface PlanCreationAttributes extends Optional<PlanAttributes, 'id'> { }

export class Plan extends Model<PlanAttributes, PlanCreationAttributes> implements PlanAttributes {
    declare id: string;
    declare name: string;
    declare max_leads: number;
    declare storage_limit_mb: number;
    declare features: Record<string, any>;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Plan.init(
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
        max_leads: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        storage_limit_mb: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        features: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {},
        },
    },
    {
        sequelize,
        tableName: 'plans',
        timestamps: true,
    }
);
