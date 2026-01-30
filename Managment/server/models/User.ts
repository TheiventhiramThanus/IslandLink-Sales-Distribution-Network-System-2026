import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'sales' | 'inventory' | 'logistics' | 'driver' | 'manager' | 'customer';
    status: 'Active' | 'Inactive';
    lastLogin?: Date;
    company?: string;
    phone?: string;
    address?: string;
    image?: string;

    // Driver-specific fields
    vehicleNumber?: string;
    vehicleType?: string;
    vehiclePhoto?: string;
    licenseNumber?: string;
    licensePhoto?: string;
    nicNumber?: string;
    nicPhoto?: string;
    approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
    rejectionReason?: string;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: '' },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'sales', 'inventory', 'logistics', 'driver', 'manager', 'customer']
    },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    lastLogin: { type: Date, default: Date.now },
    company: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    image: { type: String, default: '' },

    // Driver-specific fields
    vehicleNumber: { type: String, default: '' },
    vehicleType: { type: String, default: '' },
    vehiclePhoto: { type: String, default: '' },
    licenseNumber: { type: String, default: '' },
    licensePhoto: { type: String, default: '' },
    nicNumber: { type: String, default: '' },
    nicPhoto: { type: String, default: '' },
    approvalStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    rejectionReason: { type: String, default: '' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date }
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);

