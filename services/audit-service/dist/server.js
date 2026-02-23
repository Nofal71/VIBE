"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redisBus_1 = require("./config/redisBus");
const auditListener_1 = require("./workers/auditListener");
const startServer = async () => {
    try {
        console.log('Initializing Audit Service...');
        // Connect Redis Bus
        await redisBus_1.redisBus.connect();
        // Start background listeners
        await (0, auditListener_1.startAuditListener)();
        console.log('Audit Service is up and running in headless mode.');
        // Keep process alive for headless operations
        process.on('SIGINT', () => {
            console.log('Gracefully shutting down Audit Service...');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Failed to start Audit Service:', error);
        process.exit(1);
    }
};
startServer();
