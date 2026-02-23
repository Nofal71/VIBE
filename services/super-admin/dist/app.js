"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const provisioningRoutes_1 = __importDefault(require("./routes/provisioningRoutes"));
const blueprintRoutes_1 = __importDefault(require("./routes/blueprintRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const TenantConfigController_1 = require("./controllers/TenantConfigController");
const BroadcastController_1 = require("./controllers/BroadcastController");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/provision', provisioningRoutes_1.default);
app.use('/blueprints', blueprintRoutes_1.default);
app.use('/ai', aiRoutes_1.default);
app.use('/companies', companyRoutes_1.default);
// Hook new explicit route pointing towards frontend Sidebars extracting logic natively
app.get('/tenant/config', TenantConfigController_1.TenantConfigController.getTenantConfig);
// Super Admin global broadcast — inserts notification into every active tenant DB
app.post('/broadcasts/send', BroadcastController_1.BroadcastController.sendGlobalBroadcast);
exports.default = app;
