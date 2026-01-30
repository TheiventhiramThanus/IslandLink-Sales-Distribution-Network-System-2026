import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from './models/Product';
import User from './models/User';
import Order from './models/Order';

dotenv.config({ path: path.join(__dirname, '../.env') });

const products = [
    {
        name: 'Premium Coffee Beans 1kg',
        sku: 'BEV-001',
        stock: 150,
        reserved: 20,
        available: 130,
        rdc: 'Colombo RDC',
        location: 'Aisle 1-A',
        status: 'In Stock',
        price: 24.99,
        category: 'Beverages',
        description: 'Rich, aromatic coffee beans sourced from local island farms'
    },
    {
        name: 'Organic Coconut Oil 500ml',
        sku: 'FOOD-002',
        stock: 80,
        reserved: 5,
        available: 75,
        rdc: 'Galle RDC',
        location: 'Aisle 2-B',
        status: 'In Stock',
        price: 15.99,
        category: 'Food',
        description: 'Pure organic coconut oil, cold-pressed for maximum quality'
    },
    {
        name: 'Island Spice Mix Set',
        sku: 'FOOD-003',
        stock: 25,
        reserved: 10,
        available: 15,
        rdc: 'Kandy RDC',
        location: 'Aisle 3-C',
        status: 'Low Stock',
        price: 12.50,
        category: 'Food',
        description: 'Authentic island spices blend for traditional cooking'
    },
    {
        name: 'Natural Honey 250g',
        sku: 'FOOD-004',
        stock: 120,
        reserved: 15,
        available: 105,
        rdc: 'Colombo RDC',
        location: 'Aisle 1-D',
        status: 'In Stock',
        price: 18.99,
        category: 'Food',
        description: 'Raw natural honey harvested from island beekeepers'
    },
    {
        name: 'Fresh Pineapple Juice 1L',
        sku: 'BEV-005',
        stock: 200,
        reserved: 40,
        available: 160,
        rdc: 'Negombo RDC',
        location: 'Cold Store 1',
        status: 'In Stock',
        price: 8.99,
        category: 'Beverages',
        description: 'Fresh squeezed pineapple juice, no added sugar'
    },
    {
        name: 'Dried Mango Slices 200g',
        sku: 'SNK-006',
        stock: 300,
        reserved: 50,
        available: 250,
        rdc: 'Galle RDC',
        location: 'Aisle 4-A',
        status: 'In Stock',
        price: 9.99,
        category: 'Snacks',
        description: 'Sweet dried mango slices, perfect for snacking'
    }
];

const seedDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/isdn-system';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});
        await Order.deleteMany({});
        console.log('Cleared Products, Users, and Orders');

        // Insert products
        await Product.insertMany(products);
        console.log('Inserted Sample Products');

        // Insert default users
        await User.create({
            name: 'Raviraj Sarangan',
            email: 'admin@example.com',
            password: 'password123',
            role: 'customer',
            status: 'Active',
            company: 'Island Tech Solutions',
            phone: '+94 77 123 4567',
            address: '45 Lotus Rd, Colombo 01'
        });
        console.log('Inserted Default Customer User');

        await User.create({
            name: 'System Administrator',
            email: 'admin123@gmail.com',
            password: 'admin123',
            role: 'admin',
            status: 'Active',
            company: 'ISDN System',
            phone: '+94 11 234 5678',
            address: 'Main Office, Colombo'
        });
        console.log('Inserted System Administrator User');

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDB();
