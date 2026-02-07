import mongoose, { Schema, Document } from 'mongoose';

export interface IGameEntry extends Document {
  gameId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  boughtChips: number;
  leftChips: number;
  updatedAt: Date;
}

const GameEntrySchema = new Schema<IGameEntry>({
  gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
  playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  boughtChips: { type: Number, default: 0 },
  leftChips: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

GameEntrySchema.index({ gameId: 1, playerId: 1 }, { unique: true });

export default mongoose.models.GameEntry || mongoose.model<IGameEntry>('GameEntry', GameEntrySchema);
