const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './Managment/server/.env' });

const testConnection = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        console.log('Testing connection to:', uri ? uri.replace(/:([^@]+)@/, ':****@') : 'MISSING URI');

        if (!uri) return;

        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected successfully!');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Found collections:', collections.map(c => c.name));

        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error(error);
    }
};

testConnection();
