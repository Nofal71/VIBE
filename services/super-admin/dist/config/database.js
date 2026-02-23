"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'admin';
const dbPassword = process.env.DB_PASSWORD || 'admin';
const dbName = process.env.DB_NAME || 'saas_master_db';
exports.sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
const connectDatabase = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log('Successfully connected to the saas_master_db.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
