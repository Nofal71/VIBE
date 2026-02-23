"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4002;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/files', fileRoutes_1.default);
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`File Service running on port ${PORT}`);
    });
};
startServer();
