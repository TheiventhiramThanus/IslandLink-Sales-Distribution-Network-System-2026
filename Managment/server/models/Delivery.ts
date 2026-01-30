import mongoose, { Document, Schema } from 'mongoose';

export interface IDelivery extends Document {
    deliveryId: string;
    orderId: mongoose.Types.ObjectId;
    routeId: mongoose.Types.ObjectId;
    driverId: mongoose.Types.ObjectId;
    vehicleId: mongoose.Types.ObjectId;
    scheduledDate: Date;
    actualDeliveryDate?: Date;
    status: 'Pending' | 'Scheduled' | 'OnTheWay' | 'Delivered' | 'Delayed';
    notes?: string;
}

const DeliverySchema: Schema = new Schema({
    deliveryId: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    scheduledDate: { type: Date, required: true },
    actualDeliveryDate: { type: Date },
    status: {
        type: String,
        enum: ['Pending', 'Scheduled', 'OnTheWay', 'Delivered', 'Delayed'],
        default: 'Scheduled'
    },
    notes: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IDelivery>('Delivery', DeliverySchema);
