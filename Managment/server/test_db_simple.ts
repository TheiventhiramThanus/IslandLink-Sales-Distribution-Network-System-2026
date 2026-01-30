
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Force Google DNS
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) { }

const uri = process.env.MONGODB_URI;
console.log('URI:', uri);

mongoose.connect(uri!, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('CONNECTED!');
        process.exit(0);
    })
    .catch((err) => {
        console.log('ERROR_NAME:', err.name);
        console.log('ERROR_MSG:', err.message);
        console.log('ERROR_REASON:', err.reason);
        console.log('ERROR_CODE:', err.code);
        process.exit(1);
    });
