import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import { User } from './models/User';
import { Role } from './models/Role';
import { Permission } from './models/Permission';
import { RolePermission } from './models/RolePermission';
import { FeaturePermission } from './models/FeaturePermission';
import { FieldLock } from './models/FieldLock';
import { seedSuperAdmin } from './seeders/superAdminSeeder';
import authRoutes from './routes/authRoutes';

const app = express();
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);

const sequelize = new Sequelize(
    process.env.DB_NAME || 'saas_master_db',
    process.env.DB_USER || 'admin',
    process.env.DB_PASSWORD || 'your_password',
    {
        host: process.env.DB_HOST || 'mysql-master',
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        logging: false,
    }
);

// Init models
User.initModel(sequelize);
Role.initModel(sequelize);
Permission.initModel(sequelize);
RolePermission.initModel(sequelize);
FeaturePermission.initModel(sequelize);
FieldLock.initModel(sequelize);

// Any associations can be set up here if needed
// e.g. User.belongsTo(Role, { foreignKey: 'role_id' })

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4004;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Sync database
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced.');

        // Seed Super Admin
        await seedSuperAdmin();

        app.listen(PORT, () => {
            console.log(`🚀 IAM Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
    }
};

startServer();
