import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TicketAttributes {
    id: string;
    lead_id: string | null;
    assigned_to: string | null;
    subject: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TicketCreationAttributes extends Optional<TicketAttributes, 'id' | 'status' | 'lead_id' | 'assigned_to'> { }

export class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
    public id!: string;
    public lead_id!: string | null;
    public assigned_to!: string | null;
    public subject!: string;
    public description!: string;
    public status!: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    public priority!: 'LOW' | 'MEDIUM' | 'HIGH';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Ticket {
        return Ticket.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                lead_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                assigned_to: {
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                subject: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED'),
                    allowNull: false,
                    defaultValue: 'OPEN',
                },
                priority: {
                    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'tickets',
                timestamps: true,
            }
        );
    }
}
