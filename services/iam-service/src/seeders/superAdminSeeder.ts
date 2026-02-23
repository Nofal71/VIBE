import bcrypt from 'bcrypt';
import { User } from '../models/User';

export const seedSuperAdmin = async () => {
    try {
        const existingSuperAdmin = await User.findOne({
            where: {
                role: 'SUPER_ADMIN',
            },
        });

        if (!existingSuperAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                email: 'admin@ihsolution.tech',
                first_name: 'System',
                last_name: 'Admin',
                role: 'SUPER_ADMIN',
                password_hash: hashedPassword,
                tenant_id: 'public', // Using 'public' per requirements or null
                is_active: true,
            });
            console.log('✅ Super Admin seeded successfully.');
        } else {
            console.log('⚡ Super Admin already exists. Skipping seed.');
        }
    } catch (error) {
        console.error('❌ Error seeding Super Admin:', error);
    }
};
