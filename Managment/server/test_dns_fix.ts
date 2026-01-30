
import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Custom DNS Fix...');

// 1. Force Node.js to use Google DNS
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('✅ DNS Servers set to Google (8.8.8.8)');
} catch (e: any) {
    console.error('❌ Failed to set DNS servers:', e.message);
}

// 2. Try to resolve the SRV record manually to verify
const hostname = '_mongodb._tcp.ase.ljbkkcw.mongodb.net';
console.log(`\n🔍 Resolving SRV for: ${hostname}`);

dns.resolveSrv(hostname, (err, addresses) => {
    if (err) {
        console.error('❌ SRV Resolution Failed:', err.message);
        console.error('   Code:', err.code);
    } else {
        console.log('✅ SRV Resolution Successful!');
        console.log('   Records found:', addresses.length);
        console.log('   First record:', addresses[0]);

        // 3. If SRV works, try Mongoose connection
        console.log('\n🔌 Attempting Mongoose Connection...');
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('❌ MONGODB_URI not found in .env');
            return;
        }

        mongoose.connect(uri)
            .then(() => {
                console.log('✅ Mongoose Connected Successfully!');
                console.log('🎉 THE DNS FIX WORKS!');
                process.exit(0);
            })
            .catch((connErr) => {
                console.error('❌ Mongoose Connection Failed:', connErr.message);
                process.exit(1);
            });
    }
});
