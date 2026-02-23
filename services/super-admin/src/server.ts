import app from './app';
import { sequelize, connectDatabase } from './config/database';
import { runInitialSeed } from './seeders/initialSeed';
import './models'; // Ensure models are loaded for sync

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        await connectDatabase();
        await sequelize.sync({ alter: true });
        console.log('Master database synced successfully.');

        // Phase 9: Database Seeding check
        if (process.env.RUN_SEED === 'true') {
            await runInitialSeed();
        }

        app.listen(PORT, () => {
            console.log(`Super Admin Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
