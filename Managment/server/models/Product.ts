import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    sku: string;
    stock: number;
    reserved: number;
    available: number;
    rdc: string;
    location: string;
    status: 'In Stock' | 'Low Stock' | 'Critical';
    image?: string;
    price: number;
    category: string;
    description: string;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, default: 0 },
    reserved: { type: Number, required: true, default: 0 },
    available: { type: Number, required: true, default: 0 },
    rdc: { type: String, required: true },
    location: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['In Stock', 'Low Stock', 'Critical'],
        default: 'In Stock'
    },
    image: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, required: true, default: 'General' },
    description: { type: String, default: '' }
}, {
    timestamps: true
});

export default mongoose.model<IProduct>('Product', ProductSchema);

