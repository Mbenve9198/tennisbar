import { useState, useEffect } from 'react';

export interface MenuPricing {
  type: 'simple' | 'multiple' | 'range' | 'custom';
  simple?: string;
  multiple?: {
    small?: string;
    pinta?: string;
  };
  range?: string;
  custom?: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  pricing: MenuPricing;
  type?: string;
  tags: string[];
  order: number;
  isActive: boolean;
}

export interface Subcategory {
  _id: string;
  name: string;
  order: number;
  items: MenuItem[];
}

export interface MenuCategory {
  _id: string;
  name: string;
  emoji: string;
  section: string;
  order: number;
  subcategories: Subcategory[];
  items: MenuItem[];
}

export interface MenuData {
  hamburger: MenuCategory | null;
  food: MenuCategory | null;
  drinks: MenuCategory | null;
  desserts: MenuCategory | null;
}

interface UseMenuDataReturn {
  menuData: MenuData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMenuData(): UseMenuDataReturn {
  const [menuData, setMenuData] = useState<MenuData>({
    hamburger: null,
    food: null,
    drinks: null,
    desserts: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/menu');
      if (!response.ok) {
        throw new Error('Errore nel caricamento del menu');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Errore sconosciuto');
      }

      // Organizzo i dati per sezione
      const categories = result.data;
      const organizedData: MenuData = {
        hamburger: categories.find((cat: MenuCategory) => cat.section === 'hamburger') || null,
        food: categories.find((cat: MenuCategory) => cat.section === 'food') || null,
        drinks: categories.find((cat: MenuCategory) => cat.section === 'drinks') || null,
        desserts: categories.find((cat: MenuCategory) => cat.section === 'desserts') || null,
      };

      setMenuData(organizedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      console.error('Errore nel caricamento del menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  return {
    menuData,
    loading,
    error,
    refetch: fetchMenuData,
  };
}

// Utility functions per lavorare con i prezzi
export function formatPrice(pricing: MenuPricing, format: 'small' | 'pinta' = 'pinta'): string {
  switch (pricing.type) {
    case 'simple':
      return pricing.simple || '';
    case 'multiple':
      if (format === 'small' && pricing.multiple?.small) {
        return pricing.multiple.small;
      }
      return pricing.multiple?.pinta || '';
    case 'range':
      return pricing.range || '';
    case 'custom':
      return pricing.custom || '';
    default:
      return '';
  }
}

export function hasMultiplePrices(pricing: MenuPricing): boolean {
  return pricing.type === 'multiple' && !!pricing.multiple?.small && !!pricing.multiple?.pinta;
}

// Utility per filtrare items per tag
export function filterItemsByTag(items: MenuItem[], tag: string): MenuItem[] {
  return items.filter(item => item.tags.includes(tag));
}

// Utility per ottenere items popolari
export function getPopularItems(items: MenuItem[]): MenuItem[] {
  return filterItemsByTag(items, 'popular');
}

// Utility per ottenere items speciali
export function getSpecialItems(items: MenuItem[]): MenuItem[] {
  return filterItemsByTag(items, 'special');
} 