import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { IUser } from './models/User';

dotenv.config();

const checkAndDeleteUser = async (email: string) => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Connected to MongoDB\n');

        console.log(`🔍 Searching for user with email: ${email}\n`);

        const user = await User.findOne({ email }) as IUser;

        if (!user) {
            console.log('❌ No user found with this email.');
            console.log('✅ You can register with this email!');
            await mongoose.disconnect();
            return;
        }

        console.log('✅ User found:');
        console.log('━'.repeat(60));
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Status: ${user.status || 'N/A'}`);
        console.log(`Created: ${(user as any).createdAt || 'N/A'}`);
        console.log('━'.repeat(60));
        console.log('');

        console.log('🗑️  Deleting this user...\n');

        await User.deleteOne({ email });

        console.log('✅ User deleted successfully!');
        console.log(`📧 Email ${email} is now available for registration.\n`);

        // Verify deletion
        const checkAgain = await User.findOne({ email });
        if (!checkAgain) {
            console.log('✅ Confirmed: User has been removed from database.');
            console.log('✅ You can now register with this email!');
        } else {
            console.log('⚠️  Warning: User may still exist in database.');
        }

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        console.log('✅ Operation completed successfully!');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

// Get email from command line or use default
const email = process.argv[2] || 'thanusl216@gmail.com';

console.log('🔧 User Email Checker & Deleter');
console.log('━'.repeat(60));
console.log(`Target email: ${email}`);
console.log('━'.repeat(60));
console.log('');

// Run the script
checkAndDeleteUser(email);
