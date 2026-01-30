import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from './models/User';
import Order from './models/Order';
import Product from './models/Product';
import dns from 'dns';

// Force Google DNS to resolve MongoDB Atlas SRV records
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('🌐 DNS servers set to Google (8.8.8.8)');
} catch (e) {
    console.error('⚠️ Failed to set DNS');
}

dotenv.config();

const clearAllData = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(uri as string);
        console.log('✅ Connected to MongoDB\n');

        // Check if there are other collections
        if (!mongoose.connection.db) {
            throw new Error('Database connection established but db object is missing');
        }
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Found collections:', collections.map(c => c.name).join(', '));

        console.log('📊 Current counts:');
        const userCount = await User.countDocuments();
        const orderCount = await Order.countDocuments();
        const productCount = await Product.countDocuments();

        console.log(`- Users: ${userCount}`);
        console.log(`- Orders: ${orderCount}`);
        console.log(`- Products: ${productCount}`);
        console.log('');

        console.log('🗑️  Deleting all data...');

        const userResult = await User.deleteMany({});
        console.log(`✅ Deleted ${userResult.deletedCount} users`);

        const orderResult = await Order.deleteMany({});
        console.log(`✅ Deleted ${orderResult.deletedCount} orders`);

        const productResult = await Product.deleteMany({});
        console.log(`✅ Deleted ${productResult.deletedCount} products`);

        console.log('\n✨ All data has been successfully removed from the primary collections.');

        // Also check if there are any other collections to clear
        for (const collection of collections) {
            const name = collection.name;
            if (!['users', 'orders', 'products', 'identitycounters'].includes(name.toLowerCase())) {
                // We might want to clear these too if they exist, but let's be careful.
                // Usually identitycounters might be used for auto-incrementing IDs.
                // We should probably reset that too if it exists.
                // await mongoose.connection.db.collection(name).deleteMany({});
            }
        }

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);

    } catch (error: any) {
        console.error('❌ Error clearing data:', error.message);
        process.exit(1);
    }
};

clearAllData();
