import { Sequelize } from 'sequelize';
import { Company, Domain } from '../models/masterModels';

export class TenantConnectionManager {
    private static connections: Map<string, Sequelize> = new Map();

    /**
     * @param tenantId The subdomain/identifier passed in headers
     */
    static async getConnection(tenantId: string): Promise<Sequelize> {
        // 1. Check Cache
        if (this.connections.has(tenantId)) {
            return this.connections.get(tenantId)!;
        }

        // 2. Resolve db_name from Master DB
        // Lookup the domain that matches this tenantId
        const domainRecord = await Domain.findOne({
            where: { domain_name: tenantId },
            include: [Company]
        }) as any;

        if (!domainRecord || !domainRecord.Company) {
            throw new Error(`Domain or Company not found for tenantId: ${tenantId}`);
        }

        const tenantDbName = domainRecord.Company.db_name;

        // 3. Setup Connection
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
        const dbUser = process.env.DB_USER || 'admin';
        const dbPassword = process.env.DB_PASSWORD || 'admin';

        const sequelize = new Sequelize(tenantDbName, dbUser, dbPassword, {
            host: dbHost,
            port: dbPort,
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
        });

        try {
            await sequelize.authenticate();
            this.connections.set(tenantId, sequelize);
            console.log(`Cached new connection for tenant [${tenantId}] -> DB [${tenantDbName}]`);
            return sequelize;
        } catch (error) {
            console.error(`Failed to connect to tenant database ${tenantDbName}:`, error);
            throw error;
        }
    }
}
