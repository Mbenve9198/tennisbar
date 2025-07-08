import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import Subcategory from '@/lib/models/Subcategory';

export async function GET() {
  try {
    await connectToDatabase();

    // Recupera tutte le categorie attive
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1 })
      .select('_id name emoji section');

    // Recupera tutte le sottocategorie attive con le informazioni della categoria
    const subcategories = await Subcategory.find({ isActive: true })
      .populate('categoryId', 'name')
      .sort({ order: 1 })
      .select('_id name categoryId');

    return NextResponse.json({
      success: true,
      data: {
        categories,
        subcategories
      }
    });

  } catch (error) {
    console.error('Errore nel recupero di categorie e sottocategorie:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel recupero dei dati' },
      { status: 500 }
    );
  }
} 