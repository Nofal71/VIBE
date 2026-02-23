import { DataTypes, Model, Sequelize } from 'sequelize';

export type FeatureName =
    | 'EXPORT_CSV'
    | 'IMPORT_CSV'
    | 'BULK_DELETE'
    | 'BULK_ASSIGN'
    | 'SEND_EMAIL'
    | 'USE_FILTERS'
    | 'VIEW_AUDIT_LOGS'
    | 'MANAGE_STAFF'
    | 'MANAGE_STAGES'
    | 'MANAGE_FIELDS'
    | 'VIEW_INVOICES'
    | 'CREATE_INVOICE'
    | 'VIEW_ACCOUNTS'
    | 'CREATE_ACCOUNT';

export class FeaturePermission extends Model {
    public id!: string;
    public role_id!: string;
    public feature_name!: FeatureName;
    public is_allowed!: boolean;

    static initModel(sequelize: Sequelize): void {
        FeaturePermission.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                role_id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                },
                feature_name: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                is_allowed: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
            },
            {
                sequelize,
                modelName: 'FeaturePermission',
                tableName: 'feature_permissions',
                timestamps: true,
                // Composite unique: one row per role + feature
                indexes: [
                    { unique: true, fields: ['role_id', 'feature_name'] },
                ],
            }
        );
    }
}
