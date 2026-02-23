import { Sequelize, DataTypes, QueryTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { sequelize as masterSequelize } from '../config/database';

// Mock connection utility mapping since TenantSeeder is executed inside Super-Admin bounding Master networks.
export class TenantSeeder {
    static async seedTenantBasics(dbName: string, config: any, adminEmail: string, tempPassword: string, tenantId: string): Promise<void> {
        try {
            console.log(`[TenantSeeder] Generating internal baseline structures executing securely into DB: ${dbName}`);

            // 1. Establish isolated connection explicitly mapped tracking newly generated db bounds natively
            const sequelize = new Sequelize(
                dbName,
                process.env.MYSQL_USER || 'admin',
                process.env.MYSQL_PASSWORD || 'admin',
                {
                    host: process.env.DB_HOST || 'mysql-master',
                    port: Number(process.env.DB_PORT || 3306),
                    dialect: 'mysql',
                    logging: false
                }
            );

            // 2. Define minimum IAM structure tracking natively over the new DB footprint uniquely
            const Role = sequelize.define('role', {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                name: { type: DataTypes.STRING, allowNull: false, unique: true }
            }, { timestamps: false });

            const User = sequelize.define('user', {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                email: { type: DataTypes.STRING, allowNull: false, unique: true },
                role_id: { type: DataTypes.UUID, allowNull: true },
                password_hash: { type: DataTypes.STRING, allowNull: false },
                first_name: { type: DataTypes.STRING, allowNull: true },
                last_name: { type: DataTypes.STRING, allowNull: true },
                is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
                requires_password_change: { type: DataTypes.BOOLEAN, defaultValue: false }
            }, { timestamps: true });

            await sequelize.sync({ alter: true }); // Secure alignment

            // 3. Parse default explicit roles tracking Blueprint mappings
            const defaultRoles = config?.default_roles_json?.roles || ['Admin'];

            let adminRoleId = null;
            for (const r of defaultRoles) {
                const [roleRecord] = await Role.findOrCreate({ where: { name: r } });
                if (r === 'Admin') adminRoleId = (roleRecord as any).id;
            }

            // 4. Force default Admin extraction
            const userId = uuidv4();
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            // Inject into Tenant DATABASE
            await User.create({
                id: userId,
                email: adminEmail,
                role_id: adminRoleId,
                password_hash: hashedPassword,
                first_name: 'Tenant',
                last_name: 'Admin',
                is_active: true,
                requires_password_change: true
            });

            // Inject into MASTER DATABASE (Centralized IAM)
            // This allows iam-service to find the user during login.
            await masterSequelize.query(
                `INSERT INTO users (id, email, password_hash, first_name, last_name, \`role\`, tenant_id, role_id, is_active, requires_password_change, createdAt, updatedAt) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                 ON DUPLICATE KEY UPDATE 
                 password_hash = VALUES(password_hash),
                 requires_password_change = VALUES(requires_password_change),
                 tenant_id = VALUES(tenant_id),
                 role_id = VALUES(role_id),
                 \`role\` = VALUES(\`role\`)`,
                {
                    replacements: [
                        userId,
                        adminEmail,
                        hashedPassword,
                        'Tenant',
                        'Admin',
                        'ADMIN',
                        tenantId,
                        adminRoleId,
                        1, // is_active
                        1  // requires_password_change
                    ],
                    type: QueryTypes.INSERT
                }
            );

            console.log(`[TenantSeeder] SuperAdmin injected user: ${adminEmail} gracefully mapped into ${dbName} and saas_master_db`);

            await sequelize.close();
        } catch (error) {
            console.error(`[TenantSeeder] Database seeding constraints failed dynamically executing inside ${dbName}`, error);
        }
    }
}
