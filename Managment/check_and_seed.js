const mongoose = require('mongoose');
require('dotenv').config({ path: './Managment/server/.env' });

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    rdc: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, default: 'In Stock' },
    image: { type: String, default: '' },
    price: { type: Number, default: 0 },
    category: { type: String, default: 'General' },
    description: { type: String, default: '' }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const checkDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is missing');

        console.log('Connecting to DB...');
        await mongoose.connect(uri);
        console.log('✅ Connected');

        const count = await Product.countDocuments();
        console.log(`Product count: ${count}`);

        if (count === 0) {
            console.log('Seedings some products...');
            await Product.create([
                {
                    name: 'ISDN Solar Panel 400W',
                    sku: 'SOL-400-W',
                    stock: 150,
                    reserved: 20,
                    available: 130,
                    rdc: 'Colombo RDC',
                    location: 'A-12',
                    status: 'In Stock',
                    price: 250,
                    category: 'Energy',
                    description: 'High efficiency solar panel'
                },
                {
                    name: 'ISDN Battery 100Ah',
                    sku: 'BAT-100-AH',
                    stock: 45,
                    reserved: 5,
                    available: 40,
                    rdc: 'Colombo RDC',
                    location: 'B-04',
                    status: 'Low Stock',
                    price: 180,
                    category: 'Energy',
                    description: 'Deep cycle gel battery'
                }
            ]);
            console.log('✅ Seeded');
        }

        await mongoose.disconnect();
        console.log('Done.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

checkDB();
