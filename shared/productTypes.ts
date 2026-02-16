/**
 * Shared Product Types
 * Database ve Frontend arasında ortak kullanılacak type definitions
 */

export interface DbProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  size: string | null;
  flavor: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: 'true' | 'false';
  createdAt: Date;
  updatedAt: Date;
}

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brandId: string;
  categoryId: string;
  basePrice: number;
  rating: number | null;
  reviewCount: number | null;
  imageUrl: string | null;
  tags: string | null; // JSON array
  nutritionFacts: string | null; // JSON object
  servingSize: string | null;
  servingsPerContainer: number | null;
  usageInstructions: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  isActive: 'true' | 'false';
  createdAt: Date;
  updatedAt: Date;
  variants: DbProductVariant[];
}

/**
 * Frontend-friendly Product type
 * Database type'ını frontend'de kullanılabilir hale getirir
 */
export interface FrontendProductVariant {
  id: string;
  sku: string;
  flavor: string;
  weight: string;
  price: number;
  oldPrice?: number;
  stock: number;
  servings: number;
  image: string;
}

export interface NutritionFact {
  label: string;
  per100g: string;
  perServing: string;
}

export interface FrontendProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  brandId: string;
  category: string;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  variants: FrontendProductVariant[];
  tags: string[];
  nutritionFacts: any;
  nutrition: NutritionFact[];
  usageInstructions?: string;
  isBestseller: boolean;
  isNew: boolean;
  skt: string;
  freeFrom: string[];
  crossSellIds: string[];
  scoreCard?: {
    effect: number;
    taste: number;
    price: number;
    mixing: number;
  };
  flavorMeter?: {
    sweetness: number;
    mixability: number;
    naturalness: number;
  };
}

/**
 * Adapter: Database Product → Frontend Product
 */
export function adaptDbProductToFrontend(dbProduct: DbProduct): FrontendProduct {
  const tags = dbProduct.tags ? JSON.parse(dbProduct.tags) : [];
  const nutritionFacts = dbProduct.nutritionFacts ? JSON.parse(dbProduct.nutritionFacts) : {};
  
  const frontendVariants: FrontendProductVariant[] = dbProduct.variants.map(v => ({
    id: v.id,
    sku: v.sku,
    flavor: v.flavor || 'Aromasız',
    weight: v.size || '1000g',
    price: v.price,
    oldPrice: undefined, // TODO: Add oldPrice to database schema
    stock: v.stock,
    servings: dbProduct.servingsPerContainer || 30,
    image: v.imageUrl || dbProduct.imageUrl || '',
  }));

  // Convert nutritionFacts to NutritionFact array
  const nutrition: NutritionFact[] = [];
  if (nutritionFacts && typeof nutritionFacts === 'object') {
    Object.entries(nutritionFacts).forEach(([key, value]) => {
      nutrition.push({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        per100g: String(value) + 'g',
        perServing: String(value) + 'g',
      });
    });
  }

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description || '',
    brandId: dbProduct.brandId,
    category: dbProduct.categoryId,
    image: dbProduct.imageUrl || '',
    images: [dbProduct.imageUrl || ''],
    rating: dbProduct.rating || 0,
    reviewCount: dbProduct.reviewCount || 0,
    variants: frontendVariants,
    tags,
    nutritionFacts,
    nutrition,
    usageInstructions: dbProduct.usageInstructions || undefined,
    isBestseller: (dbProduct.rating || 0) >= 45,
    isNew: new Date().getTime() - new Date(dbProduct.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000, // New if created within 30 days
    skt: '2026-12-31', // TODO: Add to database schema
    freeFrom: [], // TODO: Add to database schema
    crossSellIds: [], // TODO: Add to database schema
  };
}
