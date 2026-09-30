import mongoose, { Document, Schema } from 'mongoose';

export interface IBlock extends Document {
  blocker: mongoose.Types.ObjectId;
  blocked: mongoose.Types.ObjectId;
  createdAt: Date;
}

const blockSchema = new Schema<IBlock>(
  {
    blocker: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blocked: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export const Block = mongoose.models.Block || mongoose.model<IBlock>('Block', blockSchema);
