import { DataTypes, Model, Sequelize } from 'sequelize';

export class Notification extends Model {
    public id!: string;
    public user_id!: string | null;
    public role_id!: string | null;
    public message!: string;
    public is_read!: boolean;

    static initModel(sequelize: Sequelize): void {
        Notification.init(
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
                role_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                message: {
                    type: DataTypes.STRING(512),
                    allowNull: false,
                },
                is_read: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
            },
            {
                sequelize,
                modelName: 'Notification',
                tableName: 'notifications',
                timestamps: true,
            }
        );
        // Notifications are system-generated; no global audit hooks needed to avoid circular events
    }
}
