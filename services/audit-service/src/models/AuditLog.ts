import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface AuditLogAttributes {
    id: string;
    user_id: string | null;
    action: string;
    table_name: string;
    record_id: string;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
}

export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'user_id' | 'old_values' | 'new_values'> { }

export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
    public id!: string;
    public user_id!: string | null;
    public action!: string;
    public table_name!: string;
    public record_id!: string;
    public old_values!: Record<string, any> | null;
    public new_values!: Record<string, any> | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize): typeof AuditLog {
        return AuditLog.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                user_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                action: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                table_name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                record_id: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                old_values: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                new_values: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: 'audit_logs',
                timestamps: true,
            }
        );
    }
}
