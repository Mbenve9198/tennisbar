import dotenv from 'dotenv';
// Carica le variabili d'ambiente PRIMA di tutto
dotenv.config({ path: '.env.local' });

import connectToDatabase from '../lib/mongodb';
import Category from '../lib/models/Category';
import Subcategory from '../lib/models/Subcategory';
import MenuItem from '../lib/models/MenuItem';
import {
  hamburgerClassici,
  superHamburger,
  miniPiatti,
  piattiItaliani,
  pinse,
  sandwich,
  piattiGriglia,
  insalate,
  dolci,
  birreSpina,
  bevande,
  viniCocktail,
  caffetteria,
} from '../lib/menu-data';

// Verifica che MONGODB_URI sia caricato
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI non trovato nel file .env.local');
  process.exit(1);
}

interface LegacyMenuItem {
  name: string;
  price: string;
  description?: string;
  popular?: boolean;
  special?: boolean;
  type?: string;
  small?: string;
  pinta?: string;
}

interface LegacyCategoryData {
  category: string;
  items: LegacyMenuItem[];
}

async function migrateMenuData() {
  try {
    console.log('🚀 Inizio migrazione dati menu...');
    
    await connectToDatabase();
    console.log('✅ Connesso al database MongoDB');

    // Pulisco i dati esistenti
    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('🧹 Database pulito');

    // 1. CREO LE CATEGORIE PRINCIPALI
    const categories = [
      { name: 'Hamburger', emoji: '🍔', section: 'hamburger', order: 1 },
      { name: 'Food', emoji: '🍽️', section: 'food', order: 2 },
      { name: 'Drinks', emoji: '🍺', section: 'drinks', order: 3 },
      { name: 'Dolci', emoji: '🍰', section: 'desserts', order: 4 },
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('✅ Categorie create');

    // Mapping per trovare le categorie per nome
    const categoryMap = new Map();
    createdCategories.forEach(cat => {
      categoryMap.set(cat.name, cat._id);
    });

    // 2. CREO LE SOTTOCATEGORIE (per bevande e vini)
    const drinksCategoryId = categoryMap.get('Drinks');
    
    const subcategoriesData = [
      ...bevande.map((cat, index) => ({
        name: cat.category,
        categoryId: drinksCategoryId,
        order: index
      })),
      ...viniCocktail.map((cat, index) => ({
        name: cat.category,
        categoryId: drinksCategoryId,
        order: index + bevande.length
      }))
    ];

    const createdSubcategories = await Subcategory.insertMany(subcategoriesData);
    console.log('✅ Sottocategorie create');

    // Mapping per sottocategorie
    const subcategoryMap = new Map();
    createdSubcategories.forEach(sub => {
      subcategoryMap.set(sub.name, sub._id);
    });

    // 3. MIGRO GLI HAMBURGER
    const hamburgerCategoryId = categoryMap.get('Hamburger');
    let order = 0;

    // Hamburger Classici
    for (const item of hamburgerClassici) {
      await MenuItem.create({
        name: item.name,
        description: item.description,
        categoryId: hamburgerCategoryId,
        pricing: {
          type: 'simple',
          simple: item.price
        },
        tags: item.popular ? ['popular'] : [],
        order: order++
      });
    }

    // Super Hamburger
         for (const item of superHamburger) {
       await MenuItem.create({
         name: item.name,
         description: item.description,
         categoryId: hamburgerCategoryId,
         pricing: {
           type: 'simple',
           simple: item.price
         },
         tags: [
           ...((item as any).popular ? ['popular'] : []),
           ...((item as any).special ? ['special'] : [])
         ],
         order: order++
       });
     }

    console.log('✅ Hamburger migrati');

    // 4. MIGRO IL FOOD
    const foodCategoryId = categoryMap.get('Food');
    order = 0;

    const foodCategories = [
      { name: 'Mini Piatti', items: miniPiatti },
      { name: 'Piatti Italiani', items: piattiItaliani },
      { name: 'Pinse', items: pinse },
      { name: 'Sandwich', items: sandwich },
      { name: 'Piatti Griglia', items: piattiGriglia },
      { name: 'Insalate', items: insalate },
    ];

    for (const category of foodCategories) {
      for (const item of category.items) {
        await MenuItem.create({
          name: item.name,
          description: item.description,
          categoryId: foodCategoryId,
          pricing: {
            type: 'simple',
            simple: item.price
          },
                     tags: [
             ...((item as any).popular ? ['popular'] : []),
             ...((item as any).special ? ['special'] : []),
             category.name.toLowerCase().replace(' ', '-')
           ],
          order: order++
        });
      }
    }

    console.log('✅ Food migrato');

    // 5. MIGRO LE BIRRE ALLA SPINA
    for (const birra of birreSpina) {
      await MenuItem.create({
        name: birra.name,
        type: birra.type,
        categoryId: drinksCategoryId,
        pricing: {
          type: 'multiple',
          multiple: {
            small: birra.small !== '–' ? birra.small : undefined,
            pinta: birra.pinta
          }
        },
        tags: ['birre-spina'],
        order: order++
      });
    }

    console.log('✅ Birre alla spina migrate');

    // 6. MIGRO BEVANDE CON SOTTOCATEGORIE
    for (const category of bevande) {
      const subcategoryId = subcategoryMap.get(category.category);
      let subOrder = 0;
      
      for (const item of category.items) {
        await MenuItem.create({
          name: item.name,
          categoryId: drinksCategoryId,
          subcategoryId: subcategoryId,
          pricing: {
            type: 'simple',
            simple: item.price
          },
          tags: ['bevande'],
          order: subOrder++
        });
      }
    }

    console.log('✅ Bevande migrate');

    // 7. MIGRO VINI E COCKTAIL
    for (const category of viniCocktail) {
      const subcategoryId = subcategoryMap.get(category.category);
      let subOrder = 0;
      
             for (const item of category.items) {
         await MenuItem.create({
           name: item.name,
           description: (item as any).description,
           categoryId: drinksCategoryId,
           subcategoryId: subcategoryId,
           pricing: {
             type: 'simple',
             simple: item.price
           },
           tags: ['vini-cocktail'],
           order: subOrder++
         });
       }
    }

    console.log('✅ Vini e cocktail migrati');

    // 8. MIGRO I DOLCI
    const dolciCategoryId = categoryMap.get('Dolci');
    order = 0;

    for (const item of dolci) {
      await MenuItem.create({
        name: item.name,
        description: item.description,
        categoryId: dolciCategoryId,
        pricing: {
          type: 'simple',
          simple: item.price
        },
        tags: [
          ...(item.popular ? ['popular'] : []),
          'dolci'
        ],
        order: order++
      });
    }

    // Caffetteria
    for (const item of caffetteria) {
      await MenuItem.create({
        name: item.name,
        categoryId: dolciCategoryId,
        pricing: {
          type: 'simple',
          simple: item.price
        },
        tags: ['caffetteria'],
        order: order++
      });
    }

    console.log('✅ Dolci e caffetteria migrati');

    // Statistiche finali
    const stats = {
      categories: await Category.countDocuments(),
      subcategories: await Subcategory.countDocuments(),
      menuItems: await MenuItem.countDocuments()
    };

    console.log('🎉 Migrazione completata!');
    console.log(`📊 Statistiche:
      - Categorie: ${stats.categories}
      - Sottocategorie: ${stats.subcategories}
      - Items del menu: ${stats.menuItems}`);

  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
  } finally {
    process.exit(0);
  }
}

// Esegui la migrazione
migrateMenuData(); 