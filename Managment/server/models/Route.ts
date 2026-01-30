import mongoose, { Document, Schema } from 'mongoose';

export interface IRoute extends Document {
    name: string;
    startPoint: {
        address: string;
        lat: number;
        lng: number;
    };
    endPoint: {
        address: string;
        lat: number;
        lng: number;
    };
    stops: {
        address: string;
        lat: number;
        lng: number;
    }[];
    distance: number;
    estimatedTime: string;
}

const RouteSchema: Schema = new Schema({
    name: { type: String, required: true },
    startPoint: {
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    endPoint: {
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    stops: [{
        address: String,
        lat: Number,
        lng: Number
    }],
    distance: { type: Number },
    estimatedTime: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IRoute>('Route', RouteSchema);
