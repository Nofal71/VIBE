import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface FieldLockAttributes {
    id: string;
    role_id: string;
    table_name: string;
    column_name: string;
    can_read: boolean;
    can_write: boolean;
}

export interface FieldLockCreationAttributes extends Optional<FieldLockAttributes, 'id' | 'can_read' | 'can_write'> { }

export class FieldLock extends Model<FieldLockAttributes, FieldLockCreationAttributes> implements FieldLockAttributes {
    public id!: string;
    public role_id!: string;
    public table_name!: string;
    public column_name!: string;
    public can_read!: boolean;
    public can_write!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize): typeof FieldLock {
        return FieldLock.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                role_id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                },
                table_name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                column_name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                can_read: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
                can_write: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
            },
            {
                sequelize,
                tableName: 'field_locks',
                timestamps: true,
            }
        );
    }
}
