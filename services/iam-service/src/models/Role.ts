import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface RoleAttributes {
    id: string;
    name: string;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, 'id'> { }

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
    public id!: string;
    public name!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Role {
        return Role.init(
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
            },
            {
                sequelize,
                tableName: 'roles',
                timestamps: true,
            }
        );
    }
}
