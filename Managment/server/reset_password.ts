import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const resetPassword = async (email: string, newPassword: string) => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Connected to MongoDB\n');

        console.log(`🔍 Searching for user: ${email}\n`);

        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found with this email.');
            console.log('💡 Make sure the email is correct or register first.');
            await mongoose.disconnect();
            return;
        }

        console.log('✅ User found:');
        console.log('━'.repeat(60));
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Current Password: ${user.password || '(not set)'}`);
        console.log('━'.repeat(60));
        console.log('');

        console.log(`🔑 Setting new password: ${newPassword}\n`);

        user.password = newPassword;
        await user.save();

        console.log('✅ Password updated successfully!');
        console.log('');
        console.log('📝 Login Credentials:');
        console.log('━'.repeat(60));
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${newPassword}`);
        console.log('━'.repeat(60));
        console.log('');
        console.log('✅ You can now log in with these credentials!');

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

// Get email and password from command line
const email = process.argv[2];
const password = process.argv[3] || 'password123';

if (!email) {
    console.log('❌ Error: Email is required');
    console.log('');
    console.log('Usage:');
    console.log('  npx ts-node server/reset_password.ts EMAIL [PASSWORD]');
    console.log('');
    console.log('Examples:');
    console.log('  npx ts-node server/reset_password.ts thanust858@gmail.com password123');
    console.log('  npx ts-node server/reset_password.ts user@example.com mypassword');
    console.log('');
    process.exit(1);
}

console.log('🔧 Password Reset Tool');
console.log('━'.repeat(60));
console.log(`Email: ${email}`);
console.log(`New Password: ${password}`);
console.log('━'.repeat(60));
console.log('');

// Run the script
resetPassword(email, password);
