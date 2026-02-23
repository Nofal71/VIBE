import { Sequelize, QueryTypes, DataTypes } from 'sequelize';
import { sequelize as masterSequelize } from '../config/database';

export class DatabaseEngine {
    static async createTenantDatabase(dbName: string): Promise<void> {
        const query = `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
        await masterSequelize.query(query, { type: QueryTypes.RAW });

        const dbUser = process.env.DB_USER || 'admin';
        const grantQuery = `GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'%';`;
        await masterSequelize.query(grantQuery, { type: QueryTypes.RAW });
        await masterSequelize.query('FLUSH PRIVILEGES;', { type: QueryTypes.RAW });

        console.log(`Database ${dbName} created and access granted to ${dbUser}.`);
    }

    static async generateDynamicSchema(dbName: string, blueprintJson: Record<string, any>): Promise<void> {
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
        const dbUser = process.env.DB_USER || 'admin';
        const dbPassword = process.env.DB_PASSWORD || 'admin';

        const tenantSequelize = new Sequelize(dbName, dbUser, dbPassword, {
            host: dbHost,
            port: dbPort,
            dialect: 'mysql',
            logging: false,
        });

        try {
            await tenantSequelize.authenticate();
            const queryInterface = tenantSequelize.getQueryInterface();

            
            await queryInterface.createTable('leads', {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            });

            if (blueprintJson.tables && Array.isArray(blueprintJson.tables)) {
                for (const tableConfig of blueprintJson.tables) {
                    const tableName = tableConfig.name;
                    const columnsRaw = tableConfig.columns;

                    const columns: Record<string, any> = {};
                    for (const [colName, colDef] of Object.entries<any>(columnsRaw)) {
                        const parsedDef: any = { ...colDef };

                        
                        switch (parsedDef.type?.toUpperCase()) {
                            case 'UUID': parsedDef.type = DataTypes.UUID; break;
                            case 'STRING': parsedDef.type = DataTypes.STRING; break;
                            case 'FLOAT': parsedDef.type = DataTypes.FLOAT; break;
                            case 'INTEGER': parsedDef.type = DataTypes.INTEGER; break;
                            case 'BOOLEAN': parsedDef.type = DataTypes.BOOLEAN; break;
                            case 'TEXT': parsedDef.type = DataTypes.TEXT; break;
                            case 'DATE': parsedDef.type = DataTypes.DATE; break;
                            default: parsedDef.type = DataTypes.STRING; break;
                        }

                        
                        if (parsedDef.defaultValue === 'UUIDV4') {
                            parsedDef.defaultValue = DataTypes.UUIDV4;
                        }

                        columns[colName] = parsedDef;
                    }

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
        } catch (error) {
            console.error(`Failed to generate dynamic schema for ${dbName}:`, error);
            throw error;
        } finally {
            await tenantSequelize.close();
        }
    }
}
