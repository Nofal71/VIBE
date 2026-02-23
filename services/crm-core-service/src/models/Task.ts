import { DataTypes, Model, Sequelize } from 'sequelize';
import { applyGlobalHooks } from '../utils/modelHooks';

export class Task extends Model {
    public id!: string;
    public lead_id!: string | null;
    public assigned_to!: string;
    public title!: string;
    public description!: string;
    public due_date!: Date;
    public status!: 'TODO' | 'IN_PROGRESS' | 'DONE';

    static initModel(sequelize: Sequelize, tenantId: string, userId: string | null = 'system') {
        Task.init(
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
                    allowNull: false,
                },
                title: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                due_date: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'DONE'),
                    allowNull: false,
                    defaultValue: 'TODO',
                },
            },
            {
                sequelize,
                modelName: 'Task',
                tableName: 'tasks',
                timestamps: true,
            }
        );

        applyGlobalHooks(Task, tenantId, userId);
    }
}
