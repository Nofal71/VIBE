import express, { Application } from 'express';
import fileRoutes from './routes/fileRoutes';

const app: Application = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/files', fileRoutes);

const startServer = () => {
    app.listen(PORT, () => {
        console.log(`File Service running on port ${PORT}`);
    });
};

startServer();
