import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface FileRecordAttributes {
    id: string;
    lead_id: string;
    file_name: string;
    file_path: string;
    mime_type: string;
    size_bytes: number;
    uploaded_by: string;
}

export interface FileRecordCreationAttributes extends Optional<FileRecordAttributes, 'id'> { }

export class FileRecord extends Model<FileRecordAttributes, FileRecordCreationAttributes> implements FileRecordAttributes {
    public id!: string;
    public lead_id!: string;
    public file_name!: string;
    public file_path!: string;
    public mime_type!: string;
    public size_bytes!: number;
    public uploaded_by!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize): typeof FileRecord {
        return FileRecord.init(
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
                file_name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                file_path: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                mime_type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                size_bytes: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                uploaded_by: {
                    type: DataTypes.UUID,
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'file_records',
                timestamps: true,
            }
        );
    }
}
