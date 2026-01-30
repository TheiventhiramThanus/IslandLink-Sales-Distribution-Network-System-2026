import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Route from './models/Route';
import Vehicle from './models/Vehicle';
import User from './models/User';

dotenv.config({ path: './.env' });

const seedLogistics = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        // Create sample routes
        const routes = [
            {
                name: 'Colombo - Gampaha Route',
                startPoint: { address: 'Colombo Fort', lat: 6.9344, lng: 79.8451 },
                endPoint: { address: 'Gampaha Town', lat: 7.0897, lng: 79.9925 },
                stops: [{ address: 'Kandana', lat: 7.0483, lng: 79.8974 }],
                distance: 35,
                estimatedTime: '1.5 hours'
            },
            {
                name: 'Colombo - Galle Express',
                startPoint: { address: 'Makumbura Interchange', lat: 6.8406, lng: 79.9972 },
                endPoint: { address: 'Galle Fort', lat: 6.0267, lng: 80.2176 },
                stops: [{ address: 'Dodangoda', lat: 6.5778, lng: 80.0522 }],
                distance: 115,
                estimatedTime: '2 hours'
            }
        ];

        await Route.deleteMany({});
        await Route.insertMany(routes);
        console.log('Routes seeded');

        // Ensure there's a vehicle
        const vehicleCount = await Vehicle.countDocuments();
        if (vehicleCount === 0) {
            await Vehicle.create({
                vehicleId: 'VEH-001',
                model: 'Toyota Hiace',
                licensePlate: 'WP-CAS-1234',
                type: 'Van',
                status: 'Active',
                distributionCenter: 'Central'
            });
            console.log('Sample vehicle created');
        }

        // Ensure there's a logistics officer and driver for testing
        const logisticsCount = await User.countDocuments({ role: 'logistics' });
        if (logisticsCount === 0) {
            await User.create({
                name: 'John Logistics',
                email: 'logistics@isdn.com',
                password: 'password123',
                role: 'logistics',
                status: 'Active'
            });
            console.log('Logistics user created');
        }

        const driverCount = await User.countDocuments({ role: 'driver' });
        if (driverCount === 0) {
            await User.create({
                name: 'Sam Driver',
                email: 'driver@isdn.com',
                password: 'password123',
                role: 'driver',
                status: 'Active',
                approvalStatus: 'Approved'
            });
            console.log('Driver user created');
        }

        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedLogistics();
