import express, { Application } from 'express';
import provisioningRoutes from './routes/provisioningRoutes';
import blueprintRoutes from './routes/blueprintRoutes';
import aiRoutes from './routes/aiRoutes';
import companyRoutes from './routes/companyRoutes';
import { TenantConfigController } from './controllers/TenantConfigController';
import { BroadcastController } from './controllers/BroadcastController';

const app: Application = express();

app.use(express.json());

app.use('/provision', provisioningRoutes);
app.use('/blueprints', blueprintRoutes);
app.use('/ai', aiRoutes);
app.use('/companies', companyRoutes);
// Hook new explicit route pointing towards frontend Sidebars extracting logic natively
app.get('/tenant/config', TenantConfigController.getTenantConfig);
// Super Admin global broadcast — inserts notification into every active tenant DB
app.post('/broadcasts/send', BroadcastController.sendGlobalBroadcast);

export default app;
