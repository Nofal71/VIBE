"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const initialSeed_1 = require("./seeders/initialSeed");
require("./models"); // Ensure models are loaded for sync
const PORT = process.env.PORT || 4000;
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        await database_1.sequelize.sync({ alter: true });
        console.log('Master database synced successfully.');
        // Phase 9: Database Seeding check
        if (process.env.RUN_SEED === 'true') {
            await (0, initialSeed_1.runInitialSeed)();
        }
        app_1.default.listen(PORT, () => {
            console.log(`Super Admin Service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
