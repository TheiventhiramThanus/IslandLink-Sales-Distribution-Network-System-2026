import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User';

dotenv.config({ path: './.env' });

const approveDriver = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const result = await User.findOneAndUpdate(
            { email: 'driver@isdn.com', role: 'driver' },
            {
                approvalStatus: 'Approved',
                status: 'Active'
            },
            { new: true }
        );

        if (result) {
            console.log('Driver approved successfully:', result.email);
        } else {
            console.log('Driver not found');
        }

        process.exit();
    } catch (error) {
        console.error('Approval error:', error);
        process.exit(1);
    }
};

approveDriver();
