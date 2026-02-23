import { Model, DataTypes, Sequelize } from 'sequelize';

export interface RolePermissionAttributes {
    role_id: string;
    permission_id: string;
}

export class RolePermission extends Model<RolePermissionAttributes> implements RolePermissionAttributes {
    public role_id!: string;
    public permission_id!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize): typeof RolePermission {
        return RolePermission.init(
            {
                role_id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    allowNull: false,
                },
                permission_id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'role_permissions',
                timestamps: true,
            }
        );
    }
}
