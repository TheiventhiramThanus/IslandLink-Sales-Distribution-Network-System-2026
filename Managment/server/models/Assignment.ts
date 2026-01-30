import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
    assignmentId: string;
    order: mongoose.Types.ObjectId;
    driver: mongoose.Types.ObjectId;
    vehicle: mongoose.Types.ObjectId;
    assignedBy: mongoose.Types.ObjectId;
    status: 'Assigned' | 'PickedUp' | 'InTransit' | 'Delivered' | 'Failed';
    center: 'North' | 'South' | 'East' | 'West' | 'Central';
    assignedAt: Date;
    completedAt?: Date;
    proofOfDelivery?: {
        photoUrl?: string;
        signatureUrl?: string;
        timestamp?: Date;
    };
    timeline: {
        status: string;
        timestamp: Date;
        note?: string;
        location?: string;
    }[];
    verificationStatus?: boolean;
    notes?: string;
}

const AssignmentSchema: Schema = new Schema({
    assignmentId: { type: String, required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        required: true,
        enum: ['Assigned', 'PickedUp', 'InTransit', 'Delivered', 'Failed'],
        default: 'Assigned'
    },
    center: {
        type: String,
        required: true,
        enum: ['North', 'South', 'East', 'West', 'Central']
    },
    assignedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    proofOfDelivery: {
        photoUrl: { type: String },
        signatureUrl: { type: String },
        timestamp: { type: Date }
    },
    timeline: [{
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
        location: { type: String }
    }],
    verificationStatus: { type: Boolean, default: false },
    notes: { type: String }
}, {
    timestamps: true
});

// Index to help with conflict checking
AssignmentSchema.index({ driver: 1, status: 1 });
AssignmentSchema.index({ vehicle: 1, status: 1 });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
