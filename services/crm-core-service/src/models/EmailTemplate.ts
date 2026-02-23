import { DataTypes, Model, Sequelize } from 'sequelize';
import { applyGlobalHooks } from '../utils/modelHooks';

export class EmailTemplate extends Model {
    public id!: string;
    public name!: string;
    public subject!: string;
    public body_html!: string;
    /** Array of variable names used in the template, e.g. ['first_name', 'company_name'] */
    public variables!: string[];
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize, tenantId: string, userId: string | null = 'system'): void {
        EmailTemplate.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING(150),
                    allowNull: false,
                },
                subject: {
                    type: DataTypes.STRING(250),
                    allowNull: false,
                },
                body_html: {
                    type: DataTypes.TEXT('long'),
                    allowNull: false,
                },
                variables: {
                    type: DataTypes.JSON,
                    allowNull: false,
                    defaultValue: [],
                },
            },
            {
                sequelize,
                modelName: 'EmailTemplate',
                tableName: 'email_templates',
                timestamps: true,
            }
        );

        applyGlobalHooks(EmailTemplate, tenantId, userId);
    }
}
