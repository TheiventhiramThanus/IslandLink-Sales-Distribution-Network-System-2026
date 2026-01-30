import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'Assignment' | 'Alert' | 'System' | 'OrderUpdate';
    read: boolean;
    relatedId?: mongoose.Types.ObjectId; // ID of the Assignment or Order
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['Assignment', 'Alert', 'System', 'OrderUpdate'],
        default: 'System'
    },
    read: { type: Boolean, default: false },
    relatedId: { type: Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
