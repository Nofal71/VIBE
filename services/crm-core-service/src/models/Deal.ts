import { DataTypes, Model, Sequelize } from 'sequelize';
import { applyGlobalHooks } from '../utils/modelHooks';

export class Deal extends Model {
    public id!: string;
    public lead_id!: string;
    public title!: string;
    public current_state!: string;
    public amount!: number;

    static initModel(sequelize: Sequelize, tenantId: string, userId: string | null = 'system') {
        const model = Deal.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                lead_id: { type: DataTypes.UUID, allowNull: false },
                title: { type: DataTypes.STRING, allowNull: false },
                current_state: { type: DataTypes.STRING, allowNull: false, defaultValue: 'NEW' },
                amount: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
            },
            {
                sequelize,
                modelName: 'Deal',
                tableName: 'deals',
                timestamps: true,
            }
        );

        applyGlobalHooks(Deal, tenantId, userId);
        return model;
    }
}
