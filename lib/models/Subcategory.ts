import mongoose, { Schema, Document } from 'mongoose';

export interface ISubcategory extends Document {
  name: string;
  categoryId: mongoose.Types.ObjectId;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema = new Schema<ISubcategory>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
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

// Indici per ottimizzare query frequenti
SubcategorySchema.index({ categoryId: 1, order: 1 });
SubcategorySchema.index({ isActive: 1 });

export default mongoose.models.Subcategory || mongoose.model<ISubcategory>('Subcategory', SubcategorySchema); 