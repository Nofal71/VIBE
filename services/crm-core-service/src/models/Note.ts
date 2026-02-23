import { DataTypes, Model, Sequelize } from 'sequelize';
import { applyGlobalHooks } from '../utils/modelHooks';

export type NoteVisibility = 'PUBLIC' | 'PRIVATE' | 'ADMIN_ONLY';

export class Note extends Model {
    public id!: string;
    public lead_id!: string;
    public content!: string;
    public author_id!: string;
    public visibility!: NoteVisibility;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize, tenantId: string, userId: string | null = 'system'): void {
        Note.init(
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
                content: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                author_id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                },
                visibility: {
                    type: DataTypes.ENUM('PUBLIC', 'PRIVATE', 'ADMIN_ONLY'),
                    allowNull: false,
                    defaultValue: 'PUBLIC',
                },
            },
            {
                sequelize,
                modelName: 'Note',
                tableName: 'lead_notes',
                timestamps: true,
            }
        );

        applyGlobalHooks(Note, tenantId, userId);
    }
}
