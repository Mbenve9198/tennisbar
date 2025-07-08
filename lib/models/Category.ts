import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  emoji: string;
  section: 'hamburger' | 'food' | 'drinks' | 'desserts' | 'info';
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  emoji: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true,
    enum: ['hamburger', 'food', 'drinks', 'desserts', 'info']
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indice per ottimizzare query frequenti
CategorySchema.index({ section: 1, order: 1 });
CategorySchema.index({ isActive: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema); 