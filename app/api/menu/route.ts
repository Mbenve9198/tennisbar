import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import Subcategory from '@/lib/models/Subcategory';
import MenuItem from '@/lib/models/MenuItem';

export async function GET() {
  try {
    await connectToDatabase();

    // Cache headers per migliorare performance
    const headers = {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      'CDN-Cache-Control': 'max-age=300',
    };

    // Query ottimizzata con aggregation pipeline
    const menuData = await Category.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $sort: { order: 1 }
      },
      {
        $lookup: {
          from: 'subcategories',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$categoryId', '$$categoryId'] },
                    { $eq: ['$isActive', true] }
                  ]
                }
              }
            },
            { $sort: { order: 1 } },
            {
              $lookup: {
                from: 'menuitems',
                let: { subcategoryId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$subcategoryId', '$$subcategoryId'] },
                          { $eq: ['$isActive', true] }
                        ]
                      }
                    }
                  },
                  { $sort: { order: 1 } }
                ],
                as: 'items'
              }
            }
          ],
          as: 'subcategories'
        }
      },
      {
        $lookup: {
          from: 'menuitems',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$categoryId', '$$categoryId'] },
                    { $eq: ['$isActive', true] },
                    { $eq: ['$subcategoryId', null] }
                  ]
                }
              }
            },
            { $sort: { order: 1 } }
          ],
          as: 'items'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          emoji: 1,
          section: 1,
          order: 1,
          subcategories: 1,
          items: 1
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: menuData,
      timestamp: new Date().toISOString()
    }, { headers });

  } catch (error) {
    console.error('Errore nel recupero del menu:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel recupero del menu' },
      { status: 500 }
    );
  }
} 