import mongoose, { Schema, Document } from 'mongoose';
export interface IGame extends Document {
  title: string;
  date?: Date;
  status: 'OPEN' | 'CLOSED';
  createdAt: Date;
  closedAt?: Date;
  bankCost?: number;
}

const GameSchema = new Schema<IGame>({
  title: { type: String, required: true },
  date: { type: Date },
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  createdAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  bankCost: { type: Number },
});

export default mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);
