import express from 'express';
import { redisBus } from './config/redisBus';
import { startOutboundEmailListener } from './workers/outboundEmailListener';
import { startImapCron } from './workers/imapScraper';
import inboxRoutes from './routes/inboxRoutes';

const startServer = async () => {
    try {
        console.log('Initializing Email Service...');

        // Connect Redis Bus
        await redisBus.connect();

        // Start background listeners and cron jobs
        await startOutboundEmailListener();
        startImapCron();

        // HTTP server for inbox API
        const app = express();
        app.use(express.json());
        app.use('/api/inbox', inboxRoutes);

        const PORT = parseInt(process.env.EMAIL_SERVICE_PORT || '4003', 10);
        app.listen(PORT, () => {
            console.log(`Email Service HTTP API running on port ${PORT}`);
        });

        console.log('Email Service is up and running.');

        process.on('SIGINT', () => {
            console.log('Gracefully shutting down Email Service...');
            process.exit(0);
        });
    } catch (error) {
        console.error('Failed to start Email Service:', error);
        process.exit(1);
    }
};

startServer();

