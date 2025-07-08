import mongoose, { Schema, Document } from 'mongoose';

// Interfaccia flessibile per i prezzi
export interface IPricing {
  type: 'simple' | 'multiple' | 'range' | 'custom';
  simple?: string; // "€12,90"
  multiple?: {
    small?: string;
    pinta?: string;
    [key: string]: string | undefined;
  };
  range?: string; // "€5,00 / €6,00"
  custom?: string; // per casi speciali
}

export interface IMenuItem extends Document {
  name: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  subcategoryId?: mongoose.Types.ObjectId;
  pricing: IPricing;
  type?: string; // per birre: "Lager 5%", "IPA 5,6%", etc.
  tags: string[]; // ["popular", "special", "vegetarian", etc.]
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['simple', 'multiple', 'range', 'custom']
  },
  simple: String,
  multiple: {
    small: String,
    pinta: String
  },
  range: String,
  custom: String
}, { _id: false });

const MenuItemSchema = new Schema<IMenuItem>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Subcategory'
  },
  pricing: {
    type: PricingSchema,
    required: true
  },
  type: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
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
MenuItemSchema.index({ categoryId: 1, order: 1 });
MenuItemSchema.index({ subcategoryId: 1, order: 1 });
MenuItemSchema.index({ isActive: 1 });
MenuItemSchema.index({ tags: 1 });

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema); 