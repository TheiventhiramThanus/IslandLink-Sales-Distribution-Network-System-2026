import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Product from './models/Product';
import Order from './models/Order';

dotenv.config(); // Will look for .env in current working directory (root)

const products = [
    {
        name: 'ISDN Basic Line',
        sku: 'ISDN-BL-001',
        stock: 150,
        reserved: 20,
        available: 130,
        rdc: 'Colombo RDC',
        location: 'WH-A1',
        status: 'In Stock' as const,
        price: 150.00,
        category: 'Connectivity',
        description: 'Standard ISDN basic rate interface for small office connectivity.'
    },
    {
        name: 'ISDN Primary Rate Interface',
        sku: 'ISDN-PRI-002',
        stock: 45,
        reserved: 10,
        available: 35,
        rdc: 'Colombo RDC',
        location: 'WH-B2',
        status: 'Low Stock' as const,
        price: 1250.00,
        category: 'Enterprise',
        description: 'High-capacity PRI interface for enterprise-grade communication systems.'
    },
    {
        name: 'ISDN Terminal Adapter',
        sku: 'ISDN-TA-003',
        stock: 12,
        reserved: 5,
        available: 7,
        rdc: 'Galle RDC',
        location: 'WH-C3',
        status: 'Critical' as const,
        price: 85.00,
        category: 'Accessories',
        description: 'Universal terminal adapter for connecting legacy equipment to ISDN lines.'
    }
];

const users = [
    {
        name: 'System Administrator',
        email: 'admin@isdn.com',
        role: 'admin',
        password: 'password123',
        status: 'Active',
        company: 'ISDN Head Office',
        address: 'Colombo, Sri Lanka',
        phone: '+94 77 123 4567'
    },
    {
        name: 'Sales Representative',
        email: 'sales@isdn.com',
        role: 'sales',
        password: 'password123',
        status: 'Active',
        company: 'ISDN Local Sales',
        address: 'Kandy, Sri Lanka',
        phone: '+94 77 234 5678'
    },
    {
        name: 'RDC Inventory Clerk',
        email: 'inventory@isdn.com',
        role: 'inventory',
        password: 'password123',
        status: 'Active',
        company: 'Colombo RDC',
        address: 'Colombo RDC Warehouse',
        phone: '+94 77 345 6789'
    },
    {
        name: 'Logistics Officer',
        email: 'logistics@isdn.com',
        role: 'logistics',
        password: 'password123',
        status: 'Active',
        company: 'Logistics HQ',
        address: 'Biyagama, Sri Lanka',
        phone: '+94 77 456 7890'
    },
    {
        name: 'Delivery Driver',
        email: 'driver@isdn.com',
        role: 'driver',
        password: 'password123',
        status: 'Active',
        company: 'ISDN Logistics',
        address: 'Mobile Unit 5',
        phone: '+94 77 567 8901'
    },
    {
        name: 'Head Office Manager',
        email: 'manager@isdn.com',
        role: 'manager',
        password: 'password123',
        status: 'Active',
        company: 'ISDN Head Office',
        address: 'Colombo, Sri Lanka',
        phone: '+94 77 678 9012'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/isdn_system');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});

        // Seed Users
        const createdUsers = await User.insertMany(users);
        console.log('Users seeded');

        // Seed Products
        const createdProducts = await Product.insertMany(products);
        console.log('Products seeded');

        // Seed initial Order
        await Order.create({
            orderId: 'ORD-2026-001',
            customer: 'Acme Corp',
            address: '123 Main St, City Center',
            items: [
                { product: createdProducts[0]._id, quantity: 2, price: 1500 }
            ],
            totalAmount: 3000,
            status: 'Approved',
            salesRep: createdUsers[0]._id,
            priority: 'High',
            orderDate: new Date().toISOString()
        });
        console.log('Orders seeded');

        console.log('Database Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
