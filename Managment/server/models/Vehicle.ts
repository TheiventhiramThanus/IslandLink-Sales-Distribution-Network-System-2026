import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    vehicleId: {
        type: String,
        required: [true, 'Vehicle ID is required'],
        unique: true,
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Vehicle model is required'],
        trim: true
    },
    licensePlate: {
        type: String,
        required: [true, 'License plate is required'],
        unique: true,
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Vehicle type is required'],
        enum: ['Van', 'Truck', 'Car', 'Motorcycle', 'Other'],
        default: 'Van'
    },
    status: {
        type: String,
        required: [true, 'Vehicle status is required'],
        enum: ['Active', 'Inactive', 'Under Maintenance'],
        default: 'Active'
    },
    distributionCenter: {
        type: String,
        required: [true, 'Distribution center is required'],
        enum: ['North', 'South', 'East', 'West', 'Central'],
        default: 'Central'
    },
    vehiclePhoto: {
        type: String, // Store as URL or Base64 for simplicity
        default: ''
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
