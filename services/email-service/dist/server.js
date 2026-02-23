"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redisBus_1 = require("./config/redisBus");
const outboundEmailListener_1 = require("./workers/outboundEmailListener");
const imapScraper_1 = require("./workers/imapScraper");
const inboxRoutes_1 = __importDefault(require("./routes/inboxRoutes"));
const startServer = async () => {
    try {
        console.log('Initializing Email Service...');
        // Connect Redis Bus
        await redisBus_1.redisBus.connect();
        // Start background listeners and cron jobs
        await (0, outboundEmailListener_1.startOutboundEmailListener)();
        (0, imapScraper_1.startImapCron)();
        // HTTP server for inbox API
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/api/inbox', inboxRoutes_1.default);
        const PORT = parseInt(process.env.EMAIL_SERVICE_PORT || '4003', 10);
        app.listen(PORT, () => {
            console.log(`Email Service HTTP API running on port ${PORT}`);
        });
        console.log('Email Service is up and running.');
        process.on('SIGINT', () => {
            console.log('Gracefully shutting down Email Service...');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Failed to start Email Service:', error);
        process.exit(1);
    }
};
startServer();
