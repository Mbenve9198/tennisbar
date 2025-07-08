import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import Subcategory from '@/lib/models/Subcategory';
import MenuItem from '@/lib/models/MenuItem';

export async function GET() {
  try {
    await connectToDatabase();

    // Ottengo tutte le categorie attive ordinate
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    // Ottengo tutte le sottocategorie attive
    const subcategories = await Subcategory.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    // Ottengo tutti gli items del menu attivi
    const menuItems = await MenuItem.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    // Organizzo i dati in una struttura gerarchica
    const menuData = categories.map((category: any) => {
      // Sottocategorie per questa categoria
      const categorySubcategories = subcategories.filter(
        (sub: any) => sub.categoryId.toString() === category._id.toString()
      );

      // Items diretti della categoria (senza sottocategoria)
      const directItems = menuItems.filter(
        (item: any) => item.categoryId.toString() === category._id.toString() && !item.subcategoryId
      );

      // Items per sottocategoria
      const subcategoriesWithItems = categorySubcategories.map((subcategory: any) => {
        const subcategoryItems = menuItems.filter(
          (item: any) => item.subcategoryId?.toString() === subcategory._id.toString()
        );

        return {
          ...subcategory,
          items: subcategoryItems
        };
      });

      return {
        ...category,
        subcategories: subcategoriesWithItems,
        items: directItems
      };
    });

    return NextResponse.json({
      success: true,
      data: menuData
    });

  } catch (error) {
    console.error('Errore nel recupero del menu:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel recupero del menu' },
      { status: 500 }
    );
  }
} 