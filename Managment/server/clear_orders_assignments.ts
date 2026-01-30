import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Order from './models/Order';
import Assignment from './models/Assignment';
import Delivery from './models/Delivery';
import GPSTracking from './models/GPSTracking';
import dns from 'dns';

// Force Google DNS to resolve MongoDB Atlas SRV records
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('🌐 DNS servers set to Google (8.8.8.8)');
} catch (e) {
    console.error('⚠️ Failed to set DNS');
}

dotenv.config();

const clearOrdersAndAssignments = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(uri as string);
        console.log('✅ Connected to MongoDB\n');

        console.log('📊 Current counts:');
        const orderCount = await Order.countDocuments();
        const assignmentCount = await Assignment.countDocuments();
        const deliveryCount = await Delivery.countDocuments();
        const gpsCount = await GPSTracking.countDocuments();

        console.log(`- Orders: ${orderCount}`);
        console.log(`- Assignments: ${assignmentCount}`);
        console.log(`- Deliveries: ${deliveryCount}`);
        console.log(`- GPS Tracking Entries: ${gpsCount}`);
        console.log('');

        console.log('🗑️  Deleting orders and assignments data...');

        const orderResult = await Order.deleteMany({});
        console.log(`✅ Deleted ${orderResult.deletedCount} orders`);

        const assignmentResult = await Assignment.deleteMany({});
        console.log(`✅ Deleted ${assignmentResult.deletedCount} assignments`);

        const deliveryResult = await Delivery.deleteMany({});
        console.log(`✅ Deleted ${deliveryResult.deletedCount} deliveries`);

        const gpsResult = await GPSTracking.deleteMany({});
        console.log(`✅ Deleted ${gpsResult.deletedCount} GPS tracking entries`);

        console.log('\n✨ Specified data has been successfully removed.');

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);

    } catch (error: any) {
        console.error('❌ Error clearing data:', error.message);
        process.exit(1);
    }
};

clearOrdersAndAssignments();
