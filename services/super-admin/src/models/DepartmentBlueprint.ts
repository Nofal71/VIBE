import { DataTypes, Model, Sequelize, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface DepartmentBlueprintAttributes {
    id: string;
    name: string;
    schema_json: Record<string, any>;
    default_roles_json: Record<string, any>;
    ui_config_json: Record<string, any>;
    default_stages_json: Record<string, any>;
}

interface DepartmentBlueprintCreationAttributes extends Optional<DepartmentBlueprintAttributes, 'id' | 'schema_json' | 'default_roles_json' | 'ui_config_json' | 'default_stages_json'> { }

export class DepartmentBlueprint extends Model<DepartmentBlueprintAttributes, DepartmentBlueprintCreationAttributes> implements DepartmentBlueprintAttributes {
    declare id: string;
    declare name: string;
    declare schema_json: Record<string, any>;
    declare default_roles_json: Record<string, any>;
    declare ui_config_json: Record<string, any>;
    declare default_stages_json: Record<string, any>;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

DepartmentBlueprint.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        schema_json: { type: DataTypes.JSON, allowNull: false, defaultValue: { tables: [] } },
        default_roles_json: { type: DataTypes.JSON, allowNull: false, defaultValue: { roles: [] } },
        ui_config_json: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
        default_stages_json: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    },
    {
        sequelize,
        modelName: 'DepartmentBlueprint',
        tableName: 'department_blueprints',
        timestamps: true,
    }
);
