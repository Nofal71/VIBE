"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantSeeder = void 0;
const sequelize_1 = require("sequelize");
// Mock connection utility mapping since TenantSeeder is executed inside Super-Admin bounding Master networks.
class TenantSeeder {
    static async seedTenantBasics(dbName, config, adminEmail = 'admin@tenant.com') {
        try {
            console.log(`[TenantSeeder] Generating internal baseline structures executing securely into DB: ${dbName}`);
            // 1. Establish isolated connection explicitly mapped tracking newly generated db bounds natively
            const sequelize = new sequelize_1.Sequelize(dbName, process.env.MYSQL_USER || 'admin', process.env.MYSQL_PASSWORD || 'admin', {
                host: process.env.DB_HOST || 'mysql-master',
                port: Number(process.env.DB_PORT || 3306),
                dialect: 'mysql',
                logging: false
            });
            // 2. Define minimum IAM structure tracking natively over the new DB footprint uniquely
            const Role = sequelize.define('role', {
                id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
                name: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true }
            }, { timestamps: false });
            const User = sequelize.define('user', {
                id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
                email: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
                role_id: { type: sequelize_1.DataTypes.UUID, allowNull: false }
            }, { timestamps: false });
            await sequelize.sync({ alter: true }); // Secure alignment
            // 3. Parse default explicit roles tracking Blueprint mappings
            const defaultRoles = config?.default_roles_json?.roles || ['Admin'];
            let adminRoleId = null;
            for (const r of defaultRoles) {
                const [roleRecord] = await Role.findOrCreate({ where: { name: r } });
                if (r === 'Admin')
                    adminRoleId = roleRecord.id;
            }
            // 4. Force default Admin extraction
            if (adminRoleId) {
                await User.create({
                    email: adminEmail,
                    role_id: adminRoleId
                });
                console.log(`[TenantSeeder] SuperAdmin injected user: ${adminEmail} gracefully mapped into ${dbName}`);
            }
            await sequelize.close();
        }
        catch (error) {
            console.error(`[TenantSeeder] Database seeding constraints failed dynamically executing inside ${dbName}`, error);
        }
    }
}
exports.TenantSeeder = TenantSeeder;
