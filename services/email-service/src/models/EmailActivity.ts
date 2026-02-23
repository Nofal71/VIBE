import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface EmailActivityAttributes {
    id: string;
    lead_id: string;
    message_id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    subject: string;
    body: string;
    received_at: Date;
}

export interface EmailActivityCreationAttributes extends Optional<EmailActivityAttributes, 'id' | 'received_at'> { }

export class EmailActivity extends Model<EmailActivityAttributes, EmailActivityCreationAttributes> implements EmailActivityAttributes {
    public id!: string;
    public lead_id!: string;
    public message_id!: string;
    public direction!: 'INBOUND' | 'OUTBOUND';
    public subject!: string;
    public body!: string;
    public received_at!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize): typeof EmailActivity {
        return EmailActivity.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                lead_id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                },
                message_id: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                direction: {
                    type: DataTypes.ENUM('INBOUND', 'OUTBOUND'),
                    allowNull: false,
                },
                subject: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                body: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                received_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            },
            {
                sequelize,
                tableName: 'email_activities',
                timestamps: true,
            }
        );
    }
}
