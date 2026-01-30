import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const clearCustomerUsers = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Connected to MongoDB\n');

        console.log('📊 Current database status:');
        const totalUsers = await User.countDocuments();
        const customerCount = await User.countDocuments({ role: 'customer' });

        console.log(`Total users in database: ${totalUsers}`);
        console.log(`Customer users: ${customerCount}\n`);

        if (customerCount === 0) {
            console.log('ℹ️  No customer users found. Nothing to delete.');
            await mongoose.disconnect();
            return;
        }

        // Show all user breakdown
        const drivers = await User.countDocuments({ role: 'driver' });
        const admins = await User.countDocuments({ role: 'admin' });
        const managers = await User.countDocuments({ role: 'manager' });
        const sales = await User.countDocuments({ role: 'sales' });
        const logistics = await User.countDocuments({ role: 'logistics' });

        console.log('Current user breakdown:');
        console.log(`  ❌ Customers: ${customerCount} (WILL BE DELETED)`);
        console.log(`  ✅ Drivers: ${drivers} (will be kept)`);
        console.log(`  ✅ Admins: ${admins} (will be kept)`);
        console.log(`  ✅ Managers: ${managers} (will be kept)`);
        console.log(`  ✅ Sales Reps: ${sales} (will be kept)`);
        console.log(`  ✅ Logistics: ${logistics} (will be kept)`);
        console.log('');

        console.log('🗑️  Deleting ONLY customer users...\n');

        // Delete only customers
        const result = await User.deleteMany({ role: 'customer' });

        console.log('✅ Successfully deleted customer users!');
        console.log(`📊 Deleted ${result.deletedCount} customer(s)\n`);

        // Verify deletion
        const remainingCustomers = await User.countDocuments({ role: 'customer' });
        const remainingTotal = await User.countDocuments();

        console.log('After deletion:');
        console.log(`  - Remaining customers: ${remainingCustomers}`);
        console.log(`  - Total remaining users: ${remainingTotal}`);

        if (remainingCustomers === 0) {
            console.log('\n✅ All customer users have been removed!');
            console.log('✅ Other user roles (drivers, admins, etc.) are preserved.');
        } else {
            console.log('\n⚠️  Warning: Some customer users may still remain');
        }

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        console.log('✅ Operation completed successfully!');

    } catch (error: any) {
        console.error('❌ Error clearing customer users:', error.message);
        console.error(error);
        process.exit(1);
    }
};

// Run the script
clearCustomerUsers();
