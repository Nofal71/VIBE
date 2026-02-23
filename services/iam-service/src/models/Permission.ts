import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface PermissionAttributes {
    id: string;
    action_name: string;
}

export interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id'> { }

export class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
    public id!: string;
    public action_name!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Permission {
        return Permission.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                action_name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
            },
            {
                sequelize,
                tableName: 'permissions',
                timestamps: true,
            }
        );
    }
}
