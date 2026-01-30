import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IOrder extends Document {
    orderId: string;
    customer: string;
    userId?: mongoose.Types.ObjectId;
    address: string;
    items: IOrderItem[];
    totalAmount: number;
    status: 'Pending' | 'Approved' | 'Processing' | 'Ready for Delivery' | 'ReadyForDispatch' | 'Assigned' | 'In Transit' | 'Delivered' | 'Cancelled' | 'Paid';
    sentToLogistics?: boolean;
    sentAt?: Date;
    sentBy?: mongoose.Types.ObjectId;
    paymentMethod?: string;
    paymentIntentId?: string;
    salesRep: mongoose.Types.ObjectId;
    driver?: mongoose.Types.ObjectId;
    priority: 'Normal' | 'High';
    orderDate: Date;
    deliveryCenter: 'North' | 'South' | 'East' | 'West' | 'Central';
    currentLocation?: {
        lat: number;
        lng: number;
        updatedAt: Date;
    };
}

const OrderSchema: Schema = new Schema({
    orderId: { type: String, required: true, unique: true },
    customer: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    address: { type: String, required: true },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Approved', 'Processing', 'Confirmed', 'Ready for Delivery', 'ReadyForDispatch', 'Assigned', 'In Transit', 'Delivered', 'Cancelled', 'Paid'],
        default: 'Pending'
    },
    paymentMethod: { type: String },
    paymentIntentId: { type: String },
    salesRep: { type: Schema.Types.ObjectId, ref: 'User' },
    driver: { type: Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['Normal', 'High'], default: 'Normal' },
    deliveryCenter: {
        type: String,
        required: true,
        enum: ['North', 'South', 'East', 'West', 'Central'],
        default: 'Central'
    },
    orderDate: { type: Date, default: Date.now },
    currentLocation: {
        lat: Number,
        lng: Number,
        updatedAt: { type: Date, default: Date.now }
    },
    sentToLogistics: { type: Boolean, default: false },
    sentAt: { type: Date },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export default mongoose.model<IOrder>('Order', OrderSchema);
