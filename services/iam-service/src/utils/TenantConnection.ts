import { Sequelize, DataTypes, Model } from 'sequelize';

// Cache to avoid recreating Sequelize instances if they exist
const tenantConnections: Record<string, Sequelize> = {};

export const getTenantConnection = async (tenantDbName: string): Promise<Sequelize> => {
    if (tenantConnections[tenantDbName]) {
        return tenantConnections[tenantDbName];
    }

    const seq = new Sequelize(tenantDbName, process.env.DB_USER || 'admin', process.env.DB_PASSWORD || 'admin', {
        host: process.env.DB_HOST || 'mysql-master',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        dialect: 'mysql',
        logging: false,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    });

    try {
        await seq.authenticate();
        tenantConnections[tenantDbName] = seq;
        return seq;
    } catch (error) {
        console.error(`[IAM] Failed to connect to tenant DB: ${tenantDbName}`, error);
        throw error;
    }
};

export const getTenantRoleModel = async (tenantDbName: string) => {
    const seq = await getTenantConnection(tenantDbName);

    // Ensure model is defined
    if (seq.models.role) {
        return seq.models.role;
    }

    return seq.define('role', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        is_default: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, { timestamps: false });
};

export const getTenantUserModel = async (tenantDbName: string) => {
    const seq = await getTenantConnection(tenantDbName);

    if (seq.models.user) {
        return seq.models.user;
    }

    return seq.define('user', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        role_id: { type: DataTypes.UUID, allowNull: true },
        password_hash: { type: DataTypes.STRING, allowNull: false },
        first_name: { type: DataTypes.STRING, allowNull: true },
        last_name: { type: DataTypes.STRING, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        requires_password_change: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, { timestamps: true });
};
