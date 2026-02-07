import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  name: string;
  avatar?: string;
  createdAt: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  name: { type: String, required: true, unique: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);
