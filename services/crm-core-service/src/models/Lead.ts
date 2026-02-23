import { DataTypes, Model, Sequelize } from 'sequelize';
import { applyGlobalHooks } from '../utils/modelHooks';

export class Lead extends Model {
    public id!: string;
    public first_name!: string;
    public last_name!: string;
    public email!: string;
    public status_id!: string;

    static initModel(sequelize: Sequelize, tenantId: string, userId: string | null = 'system') {
        Lead.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                first_name: { type: DataTypes.STRING, allowNull: false },
                last_name: { type: DataTypes.STRING, allowNull: false },
                email: { type: DataTypes.STRING, allowNull: false },
                status_id: { type: DataTypes.STRING, allowNull: false, defaultValue: 'NEW' },
            },
            {
                sequelize,
                modelName: 'Lead',
                tableName: 'leads',
                timestamps: true,
            }
        );

        applyGlobalHooks(Lead, tenantId, userId);
    }
}
