import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Force Google DNS
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('🌐 [Config] DNS servers set to Google (8.8.8.8)');
} catch (e: any) {
    console.error('⚠️ [Config] Failed to set DNS:', e.message);
}

const connectDB = async (retryCount = 0) => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/isdn_system';
        console.log(`🔌 [Attempt ${retryCount + 1}] Connecting to MongoDB...`);

        // Extract hostname for manual resolution check
        try {
            const match = uri.match(/@([^/]+)/);
            if (match && match[1]) {
                const hostname = match[1];
                console.log(`🔍 Pre-resolving hostname: ${hostname}`);
                dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
                    if (err) console.log('⚠️ Pre-resolve failed (might be normal for some URIs):', err.message);
                    else console.log(`✅ Pre-resolve successful: Found ${addresses.length} records`);
                });
            }
        } catch (e) {
            // Ignore parsing errors
        }

        const conn = await mongoose.connect(uri, {
            family: 4, // Force IPv4
            serverSelectionTimeoutMS: 30000 // Increase timeout
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Log connection status monitoring
        setInterval(() => {
            const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
            const state = mongoose.connection.readyState;
            console.log(`🔌 DB Status: ${states[state] || state} (${state})`);
        }, 5000);


        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB Connection Lost:', err.message);
        });

    } catch (error: any) {
        console.error('❌ MongoDB Connection Error!');
        console.error(`Message: ${error.message}`);

        const isDnsError = error.message.includes('ENOTFOUND') || error.message.includes('EAI_AGAIN');

        if (isDnsError) {
            console.error('💡 DNS Error Detected (ENOTFOUND):');
            console.error('   - Your internet connection might be unstable.');
            console.error('   - Your DNS server might be failing to resolve MongoDB Atlas.');
            console.error('   - Tip: Try changing your DNS or restarting your router.');
        }

        if (retryCount < 1000) { // Keep retrying effectively forever
            const delay = retryCount < 10 ? 10000 : 30000; // Fast retry at first, then slow down
            console.log(`🔄 Retrying in ${delay / 1000} seconds... (${retryCount + 1}/1000)`);
            setTimeout(() => connectDB(retryCount + 1), delay);
        } else {
            // After 1000 retries (~8 hours), restart the counter
            console.log('🔄 Resetting retry counter...');
            connectDB(0);
        }
    }
};

export default connectDB;
