import express, { Application } from 'express';
import provisioningRoutes from './routes/provisioningRoutes';
import blueprintRoutes from './routes/blueprintRoutes';
import aiRoutes from './routes/aiRoutes';
import companyRoutes from './routes/companyRoutes';
import { TenantConfigController } from './controllers/TenantConfigController';
import { BroadcastController } from './controllers/BroadcastController';
import { DomainCheckController } from './controllers/DomainCheckController';

const app: Application = express();

app.use(express.json());

app.use('/provision', provisioningRoutes);
app.use('/blueprints', blueprintRoutes);
app.use('/ai', aiRoutes);
app.use('/companies', companyRoutes);

app.get('/tenant/config', TenantConfigController.getTenantConfig);

app.post('/broadcasts/send', BroadcastController.sendGlobalBroadcast);

app.get('/domain-check', DomainCheckController.check);

export default app;
