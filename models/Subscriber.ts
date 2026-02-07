import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  verified: boolean;
  unsubscribeToken: string;
  createdAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>({
  email: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  unsubscribeToken: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);
