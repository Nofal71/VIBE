import { DataTypes, Model, Sequelize } from 'sequelize';
import { applyGlobalHooks } from '../utils/modelHooks';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID';

export class Invoice extends Model {
    public id!: string;
    public lead_id!: string;
    public amount!: number;
    public status!: InvoiceStatus;
    public due_date!: string;

    static initModel(sequelize: Sequelize, tenantId: string, userId: string | null = 'system'): void {
        Invoice.init(
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
                amount: {
                    type: DataTypes.FLOAT,
                    allowNull: false,
                    defaultValue: 0,
                },
                status: {
                    type: DataTypes.ENUM('DRAFT', 'SENT', 'PAID'),
                    allowNull: false,
                    defaultValue: 'DRAFT',
                },
                due_date: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'Invoice',
                tableName: 'invoices',
                timestamps: true,
            }
        );

        applyGlobalHooks(Invoice, tenantId, userId);
    }
}
