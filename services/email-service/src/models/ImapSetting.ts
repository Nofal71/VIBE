import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface ImapSettingAttributes {
    id: string;
    user_id: string;
    imap_host: string;
    imap_port: number;
    imap_username: string;
    imap_password?: string;
    is_active: boolean;
}

export interface ImapSettingCreationAttributes extends Optional<ImapSettingAttributes, 'id' | 'is_active' | 'imap_password'> { }

export class ImapSetting extends Model<ImapSettingAttributes, ImapSettingCreationAttributes> implements ImapSettingAttributes {
    public id!: string;
    public user_id!: string;
    public imap_host!: string;
    public imap_port!: number;
    public imap_username!: string;
    public imap_password!: string;
    public is_active!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: Sequelize): typeof ImapSetting {
        return ImapSetting.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                user_id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                },
                imap_host: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                imap_port: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                imap_username: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                imap_password: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
            },
            {
                sequelize,
                tableName: 'imap_settings',
                timestamps: true,
            }
        );
    }
}
