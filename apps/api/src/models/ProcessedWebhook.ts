import mongoose, { Document, Schema } from 'mongoose';

export interface IProcessedWebhook extends Document {
  eventId: string;
  createdAt: Date;
}

const processedWebhookSchema = new Schema<IProcessedWebhook>({
  eventId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: '30d' } // Auto delete after 30 days
});

export const ProcessedWebhook = mongoose.models.ProcessedWebhook || mongoose.model<IProcessedWebhook>('ProcessedWebhook', processedWebhookSchema);
