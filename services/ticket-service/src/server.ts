import express, { Application } from 'express';
import ticketRoutes from './routes/ticketRoutes';

const app: Application = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());

app.use('/api/tickets', ticketRoutes);

const startServer = () => {
    try {
        console.log('Initializing Ticket Service...');

        app.listen(PORT, () => {
            console.log(`Ticket Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start Ticket Service:', error);
        process.exit(1);
    }
};

startServer();
