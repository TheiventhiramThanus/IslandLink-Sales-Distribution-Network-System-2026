import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const clearAllUsers = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Connected to MongoDB\n');

        console.log('📊 Current database status:');
        const userCount = await User.countDocuments();
        console.log(`Total users in database: ${userCount}\n`);

        if (userCount === 0) {
            console.log('ℹ️  Database is already empty. No users to delete.');
            await mongoose.disconnect();
            return;
        }

        // Show user breakdown
        const customers = await User.countDocuments({ role: 'customer' });
        const drivers = await User.countDocuments({ role: 'driver' });
        const admins = await User.countDocuments({ role: 'admin' });
        const managers = await User.countDocuments({ role: 'manager' });
        const sales = await User.countDocuments({ role: 'sales' });
        const logistics = await User.countDocuments({ role: 'logistics' });

        console.log('User breakdown by role:');
        console.log(`  - Customers: ${customers}`);
        console.log(`  - Drivers: ${drivers}`);
        console.log(`  - Admins: ${admins}`);
        console.log(`  - Managers: ${managers}`);
        console.log(`  - Sales Reps: ${sales}`);
        console.log(`  - Logistics: ${logistics}`);
        console.log('');

        console.log('⚠️  WARNING: This will DELETE ALL USERS from the database!');
        console.log('🗑️  Deleting all users...\n');

        // Delete all users
        const result = await User.deleteMany({});

        console.log('✅ Successfully deleted all users!');
        console.log(`📊 Deleted ${result.deletedCount} user(s)\n`);

        // Verify deletion
        const remainingUsers = await User.countDocuments();
        console.log(`Remaining users: ${remainingUsers}`);

        if (remainingUsers === 0) {
            console.log('✅ Database is now clean - all users removed!');
        } else {
            console.log('⚠️  Warning: Some users may still remain in database');
        }

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        console.log('✅ Operation completed successfully!');

    } catch (error: any) {
        console.error('❌ Error clearing users:', error.message);
        console.error(error);
        process.exit(1);
    }
};

// Run the script
clearAllUsers();
