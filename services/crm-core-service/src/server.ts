import express, { Application } from 'express';
import dealRoutes from './routes/dealRoutes';
import genericRoutes from './routes/genericRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import taskRoutes from './routes/taskRoutes';
import importExportRoutes from './routes/importExportRoutes';
import financeRoutes from './routes/financeRoutes';
import notificationRoutes from './routes/notificationRoutes';
import leadOpsRoutes from './routes/leadOpsRoutes';
import tenantSettingsRoutes from './routes/tenantSettingsRoutes';
import noteRoutes from './routes/noteRoutes';
import templateRoutes from './routes/templateRoutes';
import webFormRoutes from './routes/webFormRoutes';
import { redisBus } from './config/redisBus';
import { startListener } from './workers/stateApprovedListener';
import { startNotificationWorker } from './workers/notificationWorker';

const app: Application = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

// ── Public routes (no auth — must be registered FIRST) ──────────────────────
app.use('/api/web-forms', webFormRoutes);

// ── Protected routes ────────────────────────────────────────────────────────
app.use('/api/deals', dealRoutes);
app.use('/api/core/generic', genericRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/data', importExportRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leads', leadOpsRoutes);
app.use('/api/tenant/settings', tenantSettingsRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/templates', templateRoutes);

const startServer = async () => {
    try {
        console.log('Initializing CRM Core Service...');

        // Connect Redis Bus
        await redisBus.connect();

        // Start background listeners
        await startListener();
        startNotificationWorker();

        app.listen(PORT, () => {
            console.log(`CRM Core Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start CRM Core Service:', error);
        process.exit(1);
    }
};

startServer();
