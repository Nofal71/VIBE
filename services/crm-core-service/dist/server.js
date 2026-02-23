"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dealRoutes_1 = __importDefault(require("./routes/dealRoutes"));
const genericRoutes_1 = __importDefault(require("./routes/genericRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const importExportRoutes_1 = __importDefault(require("./routes/importExportRoutes"));
const financeRoutes_1 = __importDefault(require("./routes/financeRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const leadOpsRoutes_1 = __importDefault(require("./routes/leadOpsRoutes"));
const tenantSettingsRoutes_1 = __importDefault(require("./routes/tenantSettingsRoutes"));
const noteRoutes_1 = __importDefault(require("./routes/noteRoutes"));
const templateRoutes_1 = __importDefault(require("./routes/templateRoutes"));
const webFormRoutes_1 = __importDefault(require("./routes/webFormRoutes"));
const redisBus_1 = require("./config/redisBus");
const stateApprovedListener_1 = require("./workers/stateApprovedListener");
const notificationWorker_1 = require("./workers/notificationWorker");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4001;
app.use(express_1.default.json());
// ── Public routes (no auth — must be registered FIRST) ──────────────────────
app.use('/api/web-forms', webFormRoutes_1.default);
// ── Protected routes ────────────────────────────────────────────────────────
app.use('/api/deals', dealRoutes_1.default);
app.use('/api/core/generic', genericRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/data', importExportRoutes_1.default);
app.use('/api/finance', financeRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/leads', leadOpsRoutes_1.default);
app.use('/api/tenant/settings', tenantSettingsRoutes_1.default);
app.use('/api/notes', noteRoutes_1.default);
app.use('/api/templates', templateRoutes_1.default);
const startServer = async () => {
    try {
        console.log('Initializing CRM Core Service...');
        // Connect Redis Bus
        await redisBus_1.redisBus.connect();
        // Start background listeners
        await (0, stateApprovedListener_1.startListener)();
        (0, notificationWorker_1.startNotificationWorker)();
        app.listen(PORT, () => {
            console.log(`CRM Core Service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start CRM Core Service:', error);
        process.exit(1);
    }
};
startServer();
