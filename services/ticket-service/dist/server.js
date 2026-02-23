"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4003;
app.use(express_1.default.json());
app.use('/api/tickets', ticketRoutes_1.default);
const startServer = () => {
    try {
        console.log('Initializing Ticket Service...');
        app.listen(PORT, () => {
            console.log(`Ticket Service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start Ticket Service:', error);
        process.exit(1);
    }
};
startServer();
