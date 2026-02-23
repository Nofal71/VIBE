import { redisBus } from './config/redisBus';
import { startAuditListener } from './workers/auditListener';

const startServer = async () => {
    try {
        console.log('Initializing Audit Service...');

        // Connect Redis Bus
        await redisBus.connect();

        // Start background listeners
        await startAuditListener();

        console.log('Audit Service is up and running in headless mode.');

        // Keep process alive for headless operations
        process.on('SIGINT', () => {
            console.log('Gracefully shutting down Audit Service...');
            process.exit(0);
        });
    } catch (error) {
        console.error('Failed to start Audit Service:', error);
        process.exit(1);
    }
};

startServer();
