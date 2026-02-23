import { DataTypes, Model, Sequelize } from 'sequelize';
import { applyGlobalHooks } from '../utils/modelHooks';

export class Account extends Model {
    public id!: string;
    public name!: string;
    public industry!: string;
    public website!: string;

    static initModel(sequelize: Sequelize, tenantId: string, userId: string | null = 'system'): void {
        Account.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                industry: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                website: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
            },
            {
                sequelize,
                modelName: 'Account',
                tableName: 'accounts',
                timestamps: true,
            }
        );

        applyGlobalHooks(Account, tenantId, userId);
    }
}
