import mongoose, { Document, Schema } from 'mongoose';

export interface IGPSTracking extends Document {
    deliveryId: mongoose.Types.ObjectId;
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
    timestamp: Date;
}

const GPSTrackingSchema: Schema = new Schema({
    deliveryId: { type: Schema.Types.ObjectId, ref: 'Delivery', required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number },
    heading: { type: Number },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Index for fast retrieval of latest location
GPSTrackingSchema.index({ deliveryId: 1, timestamp: -1 });

export default mongoose.model<IGPSTracking>('GPSTracking', GPSTrackingSchema);
