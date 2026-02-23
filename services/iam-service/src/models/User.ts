import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface UserAttributes {
    id: string;
    email: string;
    password_hash: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    tenant_id?: string | null;
    role_id?: string | null;
    is_active: boolean;
    requires_password_change: boolean;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'is_active' | 'requires_password_change'> { }

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare public id: string;
    declare public email: string;
    declare public password_hash: string;
    declare public first_name?: string;
    declare public last_name?: string;
    declare public role?: string;
    declare public tenant_id?: string | null;
    declare public role_id?: string | null;
    declare public is_active: boolean;
    declare public requires_password_change: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize): typeof User {
        return User.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                password_hash: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                first_name: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                last_name: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                role: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                tenant_id: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                role_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
                requires_password_change: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
            },
            {
                sequelize,
                tableName: 'users',
                timestamps: true,
            }
        );
    }
}
