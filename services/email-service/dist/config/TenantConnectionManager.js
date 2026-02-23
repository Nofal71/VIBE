"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantConnectionManager = void 0;
const sequelize_1 = require("sequelize");
const masterModels_1 = require("../models/masterModels");
class TenantConnectionManager {
    static connections = new Map();
    static async getConnection(tenantId) {
        if (this.connections.has(tenantId)) {
            return this.connections.get(tenantId);
        }
        const domainRecord = await masterModels_1.Domain.findOne({
            where: { domain_name: tenantId },
            include: [masterModels_1.Company]
        });
        if (!domainRecord || !domainRecord.Company) {
            throw new Error(`Domain or Company not found for tenantId: ${tenantId}`);
        }
        const tenantDbName = domainRecord.Company.db_name;
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
        const dbUser = process.env.DB_USER || 'admin';
        const dbPassword = process.env.DB_PASSWORD || 'admin';
        const sequelize = new sequelize_1.Sequelize(tenantDbName, dbUser, dbPassword, {
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
        }
        catch (error) {
            console.error(`Failed to connect to tenant database ${tenantDbName}:`, error);
            throw error;
        }
    }
}
exports.TenantConnectionManager = TenantConnectionManager;
