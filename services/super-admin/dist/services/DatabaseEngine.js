"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseEngine = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class DatabaseEngine {
    static async createTenantDatabase(dbName) {
        const query = `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
        await database_1.sequelize.query(query, { type: sequelize_1.QueryTypes.RAW });
        console.log(`Database ${dbName} created or already exists.`);
    }
    static async generateDynamicSchema(dbName, blueprintJson) {
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
        const dbUser = process.env.DB_USER || 'admin';
        const dbPassword = process.env.DB_PASSWORD || 'admin';
        const tenantSequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
            host: dbHost,
            port: dbPort,
            dialect: 'mysql',
            logging: false,
        });
        try {
            await tenantSequelize.authenticate();
            const queryInterface = tenantSequelize.getQueryInterface();
            if (blueprintJson.tables && Array.isArray(blueprintJson.tables)) {
                for (const tableConfig of blueprintJson.tables) {
                    const tableName = tableConfig.name;
                    const columns = tableConfig.columns;
                    await queryInterface.createTable(tableName, columns);
                    console.log(`Table ${tableName} created in ${dbName}.`);
                    if (tableConfig.relations && Array.isArray(tableConfig.relations)) {
                        for (const relation of tableConfig.relations) {
                            await queryInterface.addConstraint(tableName, {
                                fields: [relation.foreignKey],
                                type: 'foreign key',
                                name: `fk_${tableName}_${relation.foreignKey}`,
                                references: {
                                    table: 'leads',
                                    field: 'id',
                                },
                                onDelete: 'CASCADE',
                                onUpdate: 'CASCADE',
                            });
                            console.log(`Added constraint to ${tableName} on ${relation.foreignKey}`);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error(`Failed to generate dynamic schema for ${dbName}:`, error);
            throw error;
        }
        finally {
            await tenantSequelize.close();
        }
    }
}
exports.DatabaseEngine = DatabaseEngine;
