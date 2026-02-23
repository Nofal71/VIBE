import { redisBus } from './config/redisBus';
import { startWorkers } from './workers/eventListener';

const startServer = async () => {
    try {
        console.log('Initializing Automations Service...');

        // Connect Redis Bus
        await redisBus.connect();

        // Start State Machine Workers
        await startWorkers();

        console.log('Automations Service is up and running in headless mode.');

        // Keep process alive for headless operations
        process.on('SIGINT', () => {
            console.log('Gracefully shutting down Automations Service...');
            process.exit(0);
        });
    } catch (error) {
        console.error('Failed to start Automations Service:', error);
        process.exit(1);
    }
};

startServer();
