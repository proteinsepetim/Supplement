/*
 * ProteinMarket - Veri Katmanı
 * Tüm ürünler, kategoriler, markalar, kampanyalar ve yardımcı fonksiyonlar
 */

// ===== TYPES =====
export interface NutritionFact {
  label: string;
  per100g: string;
  perServing: string;
}

export interface ScoreCard {
  effect: number;   // 1-10
  taste: number;    // 1-10
  price: number;    // 1-10
  mixing: number;   // 1-10
}

export interface FlavorMeter {
  sweetness: number;    // 1-5
  mixability: number;   // 1-5
  naturalness: number;  // 1-5
}

export interface ProductVariant {
  id: string;
  flavor: string;
  weight: string;
  price: number;
  oldPrice?: number;
  stock: number;
  servings: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  brandId: string;
  image: string;
  images: string[];
  variants: ProductVariant[];
  nutrition: NutritionFact[];
  scoreCard?: ScoreCard;
  flavorMeter?: FlavorMeter;
  rating: number;
  reviewCount: number;
  isBestseller: boolean;
  isNew: boolean;
  tags: string[];
  skt: string; // Son kullanma tarihi
  freeFrom: string[];
  crossSellIds: string[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string;
  description: string;
  featured: boolean;
}

export interface CampaignTier {
  threshold: number;
  reward: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'bogo' | 'percentage' | 'gift' | 'freeShipping' | 'tiered';
  code?: string;
  active: boolean;
  tiers?: CampaignTier[];
}

// ===== CATEGORIES =====
export const categories: Category[] = [
  {
    id: 'protein', name: 'Protein Tozu', slug: 'protein-tozu', icon: 'Dumbbell',
    subcategories: [
      { id: 'whey', name: 'Whey Protein', slug: 'whey-protein' },
      { id: 'isolate', name: 'İzole Protein', slug: 'izole-protein' },
      { id: 'casein', name: 'Kazein Protein', slug: 'kazein-protein' },
      { id: 'vegan', name: 'Vegan Protein', slug: 'vegan-protein' },
    ]
  },
  {
    id: 'performance', name: 'Performans & Güç', slug: 'performans-guc', icon: 'Zap',
    subcategories: [
      { id: 'preworkout', name: 'Pre-Workout', slug: 'pre-workout' },
      { id: 'creatine', name: 'Kreatin', slug: 'kreatin' },
      { id: 'bcaa', name: 'BCAA', slug: 'bcaa' },
    ]
  },
  {
    id: 'weight', name: 'Kilo & Hacim', slug: 'kilo-hacim', icon: 'Flame',
    subcategories: [
      { id: 'gainer', name: 'Gainer', slug: 'gainer' },
      { id: 'fatburner', name: 'Yağ Yakıcı', slug: 'yag-yakici' },
      { id: 'lcarnitine', name: 'L-Karnitin', slug: 'l-karnitin' },
    ]
  },
  {
    id: 'amino', name: 'Amino Asit', slug: 'amino-asit', icon: 'TrendingUp',
    subcategories: [
      { id: 'eaa', name: 'EAA', slug: 'eaa' },
      { id: 'glutamine', name: 'Glutamin', slug: 'glutamin' },
      { id: 'arginine', name: 'Arjinin', slug: 'arjinin' },
    ]
  },
  {
    id: 'energy', name: 'Enerji & Dayanıklılık', slug: 'enerji-dayaniklilik', icon: 'Bolt',
    subcategories: [
      { id: 'caffeine', name: 'Kafein', slug: 'kafein' },
      { id: 'energybar', name: 'Enerji Barı', slug: 'enerji-bari' },
    ]
  },
  {
    id: 'vitamin', name: 'Vitamin & Mineral', slug: 'vitamin-mineral', icon: 'Pill',
    subcategories: [
      { id: 'multivitamin', name: 'Multivitamin', slug: 'multivitamin' },
      { id: 'omega3', name: 'Omega-3', slug: 'omega-3' },
      { id: 'vitaminD', name: 'Vitamin D', slug: 'vitamin-d' },
      { id: 'zinc', name: 'Çinko & Magnezyum', slug: 'cinko-magnezyum' },
    ]
  },
  {
    id: 'snack', name: 'Sağlıklı Atıştırmalık', slug: 'saglikli-atistirmalik', icon: 'Cookie',
    subcategories: [
      { id: 'proteinbar', name: 'Protein Bar', slug: 'protein-bar' },
      { id: 'peanutbutter', name: 'Fıstık Ezmesi', slug: 'fistik-ezmesi' },
      { id: 'oatmeal', name: 'Yulaf', slug: 'yulaf' },
    ]
  },
  {
    id: 'health', name: 'Sağlık & Yaşam', slug: 'saglik-yasam', icon: 'TrendingUp',
    subcategories: [
      { id: 'collagen', name: 'Kolajen', slug: 'kolajen' },
      { id: 'probiotic', name: 'Probiyotik', slug: 'probiyotik' },
    ]
  },
  {
    id: 'accessories', name: 'Fitness Aksesuarları', slug: 'fitness-aksesuarlari', icon: 'Shirt',
    subcategories: [
      { id: 'shaker', name: 'Shaker', slug: 'shaker' },
      { id: 'gloves', name: 'Eldiven', slug: 'eldiven' },
      { id: 'belt', name: 'Kemer', slug: 'kemer' },
    ]
  },
];

// ===== BRANDS =====
export const brands: Brand[] = [
  { id: 'hardline', name: 'Hardline', slug: 'hardline', country: 'Türkiye', description: 'Türkiye\'nin lider sporcu gıdaları markası', featured: true },
  { id: 'bigjoy', name: 'BigJoy', slug: 'bigjoy', country: 'Türkiye', description: 'Yüksek kaliteli sporcu besinleri', featured: true },
  { id: 'optimum', name: 'Optimum Nutrition', slug: 'optimum-nutrition', country: 'ABD', description: 'Dünya\'nın en çok satan protein markası', featured: true },
  { id: 'myprotein', name: 'Myprotein', slug: 'myprotein', country: 'İngiltere', description: 'Avrupa\'nın 1 numaralı online spor beslenme markası', featured: true },
  { id: 'muscletech', name: 'MuscleTech', slug: 'muscletech', country: 'ABD', description: 'Bilim destekli sporcu gıdaları', featured: true },
  { id: 'bsn', name: 'BSN', slug: 'bsn', country: 'ABD', description: 'Finish First - Premium sporcu besinleri', featured: true },
  { id: 'proteinmarket', name: 'ProteinMarket', slug: 'proteinmarket', country: 'Türkiye', description: 'Kendi markamız, en uygun fiyat garantisi', featured: true },
  { id: 'dymatize', name: 'Dymatize', slug: 'dymatize', country: 'ABD', description: 'Atletler için geliştirilmiş formüller', featured: false },
  { id: 'cellucor', name: 'Cellucor', slug: 'cellucor', country: 'ABD', description: 'C4 Pre-Workout ile tanınan marka', featured: false },
  { id: 'universal', name: 'Universal Nutrition', slug: 'universal-nutrition', country: 'ABD', description: '1977\'den beri sporcu beslenmesi', featured: false },
];

// ===== NUTRITION DEFAULTS =====
const defaultNutrition: NutritionFact[] = [
  { label: 'Enerji', per100g: '380 kcal', perServing: '114 kcal' },
  { label: 'Protein', per100g: '76.7 g', perServing: '23 g' },
  { label: 'Karbonhidrat', per100g: '8.0 g', perServing: '2.4 g' },
  { label: '- Şeker', per100g: '6.3 g', perServing: '1.9 g' },
  { label: 'Yağ', per100g: '6.3 g', perServing: '1.9 g' },
  { label: '- Doymuş Yağ', per100g: '3.8 g', perServing: '1.1 g' },
  { label: 'Lif', per100g: '0.5 g', perServing: '0.15 g' },
  { label: 'Tuz', per100g: '0.7 g', perServing: '0.21 g' },
];

const creatineNutrition: NutritionFact[] = [
  { label: 'Enerji', per100g: '0 kcal', perServing: '0 kcal' },
  { label: 'Kreatin Monohidrat', per100g: '100 g', perServing: '5 g' },
  { label: 'Protein', per100g: '0 g', perServing: '0 g' },
  { label: 'Karbonhidrat', per100g: '0 g', perServing: '0 g' },
  { label: 'Yağ', per100g: '0 g', perServing: '0 g' },
];

const bcaaNutrition: NutritionFact[] = [
  { label: 'Enerji', per100g: '10 kcal', perServing: '5 kcal' },
  { label: 'L-Lösin', per100g: '40 g', perServing: '4 g' },
  { label: 'L-İzolösin', per100g: '10 g', perServing: '1 g' },
  { label: 'L-Valin', per100g: '10 g', perServing: '1 g' },
  { label: 'Karbonhidrat', per100g: '2 g', perServing: '0.2 g' },
];

// ===== PRODUCTS =====
export const products: Product[] = [
  {
    id: 'whey-protein-2000',
    name: 'Whey Protein 2000 Gr',
    slug: 'whey-protein-2000gr',
    description: 'Yüksek kaliteli whey protein konsantresi. Her serviste 23g protein içerir. Hızlı emilim, mükemmel tat ve kolay karışım.',
    category: 'protein',
    subcategory: 'whey',
    brandId: 'proteinmarket',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'wp-2000-choc', flavor: 'Çikolata', weight: '2000g', price: 3599, oldPrice: 4299, stock: 45, servings: 66, sku: 'PM-WP-2000-CHC' },
      { id: 'wp-2000-van', flavor: 'Vanilya', weight: '2000g', price: 3599, oldPrice: 4299, stock: 30, servings: 66, sku: 'PM-WP-2000-VAN' },
      { id: 'wp-2000-str', flavor: 'Çilek', weight: '2000g', price: 3599, oldPrice: 4299, stock: 22, servings: 66, sku: 'PM-WP-2000-STR' },
      { id: 'wp-2000-ban', flavor: 'Muz', weight: '2000g', price: 3599, oldPrice: 4299, stock: 15, servings: 66, sku: 'PM-WP-2000-BAN' },
      { id: 'wp-1000-choc', flavor: 'Çikolata', weight: '1000g', price: 1999, oldPrice: 2399, stock: 50, servings: 33, sku: 'PM-WP-1000-CHC' },
      { id: 'wp-500-choc', flavor: 'Çikolata', weight: '500g', price: 1099, oldPrice: 1299, stock: 60, servings: 16, sku: 'PM-WP-500-CHC' },
    ],
    nutrition: defaultNutrition,
    scoreCard: { effect: 8, taste: 9, price: 9, mixing: 8 },
    flavorMeter: { sweetness: 4, mixability: 5, naturalness: 3 },
    rating: 4.7,
    reviewCount: 342,
    isBestseller: true,
    isNew: false,
    tags: ['protein', 'whey', 'kas yapımı'],
    skt: '30.05.2027',
    freeFrom: ['Aspartam', 'GDO', 'Koruyucu', 'Renklendirici'],
    crossSellIds: ['creatine-mono-500', 'bcaa-411-300', 'shaker-pro'],
  },
  {
    id: 'isolate-protein-1800',
    name: 'İzole Whey Protein 1800 Gr',
    slug: 'izole-whey-protein-1800gr',
    description: 'Saf izole whey protein. Düşük yağ ve karbonhidrat, yüksek protein oranı. Laktoz hassasiyeti olanlar için ideal.',
    category: 'protein',
    subcategory: 'isolate',
    brandId: 'hardline',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'ip-1800-choc', flavor: 'Çikolata', weight: '1800g', price: 4299, oldPrice: 4999, stock: 25, servings: 60, sku: 'HL-IP-1800-CHC' },
      { id: 'ip-1800-van', flavor: 'Vanilya', weight: '1800g', price: 4299, oldPrice: 4999, stock: 18, servings: 60, sku: 'HL-IP-1800-VAN' },
    ],
    nutrition: [
      { label: 'Enerji', per100g: '370 kcal', perServing: '111 kcal' },
      { label: 'Protein', per100g: '86 g', perServing: '25.8 g' },
      { label: 'Karbonhidrat', per100g: '3.0 g', perServing: '0.9 g' },
      { label: 'Yağ', per100g: '2.0 g', perServing: '0.6 g' },
      { label: 'Tuz', per100g: '0.5 g', perServing: '0.15 g' },
    ],
    scoreCard: { effect: 9, taste: 8, price: 7, mixing: 9 },
    flavorMeter: { sweetness: 3, mixability: 5, naturalness: 4 },
    rating: 4.8,
    reviewCount: 189,
    isBestseller: true,
    isNew: false,
    tags: ['protein', 'izole', 'düşük yağ'],
    skt: '15.08.2027',
    freeFrom: ['Laktoz', 'Gluten', 'GDO'],
    crossSellIds: ['creatine-mono-500', 'glutamine-300'],
  },
  {
    id: 'creatine-mono-500',
    name: 'Kreatin Monohidrat 500 Gr',
    slug: 'kreatin-monohidrat-500gr',
    description: 'Saf kreatin monohidrat. Güç ve performans artışı için bilimsel olarak kanıtlanmış formül.',
    category: 'performance',
    subcategory: 'creatine',
    brandId: 'optimum',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'cm-500-unf', flavor: 'Aromasız', weight: '500g', price: 899, oldPrice: 1099, stock: 80, servings: 100, sku: 'ON-CM-500-UNF' },
      { id: 'cm-300-unf', flavor: 'Aromasız', weight: '300g', price: 599, stock: 65, servings: 60, sku: 'ON-CM-300-UNF' },
    ],
    nutrition: creatineNutrition,
    scoreCard: { effect: 10, taste: 5, price: 9, mixing: 7 },
    rating: 4.9,
    reviewCount: 567,
    isBestseller: true,
    isNew: false,
    tags: ['kreatin', 'güç', 'performans'],
    skt: '20.12.2027',
    freeFrom: ['Şeker', 'Aroma', 'Renklendirici'],
    crossSellIds: ['whey-protein-2000', 'bcaa-411-300'],
  },
  {
    id: 'bcaa-411-300',
    name: 'BCAA 4:1:1 300 Gr',
    slug: 'bcaa-411-300gr',
    description: 'Dallanmış zincirli amino asitler. Kas koruması ve toparlanma desteği. 4:1:1 oranında Lösin, İzolösin, Valin.',
    category: 'amino',
    subcategory: 'eaa',
    brandId: 'bigjoy',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'bcaa-300-fruit', flavor: 'Orman Meyveli', weight: '300g', price: 699, oldPrice: 849, stock: 40, servings: 30, sku: 'BJ-BCAA-300-FRT' },
      { id: 'bcaa-300-lemon', flavor: 'Limon', weight: '300g', price: 699, oldPrice: 849, stock: 35, servings: 30, sku: 'BJ-BCAA-300-LMN' },
      { id: 'bcaa-300-watermelon', flavor: 'Karpuz', weight: '300g', price: 699, oldPrice: 849, stock: 28, servings: 30, sku: 'BJ-BCAA-300-WTR' },
    ],
    nutrition: bcaaNutrition,
    scoreCard: { effect: 8, taste: 8, price: 8, mixing: 9 },
    flavorMeter: { sweetness: 3, mixability: 5, naturalness: 3 },
    rating: 4.5,
    reviewCount: 234,
    isBestseller: true,
    isNew: false,
    tags: ['bcaa', 'amino asit', 'toparlanma'],
    skt: '10.09.2027',
    freeFrom: ['Aspartam', 'GDO'],
    crossSellIds: ['whey-protein-2000', 'glutamine-300'],
  },
  {
    id: 'preworkout-pump',
    name: 'C4 Pre-Workout 390 Gr',
    slug: 'c4-pre-workout-390gr',
    description: 'Antrenman öncesi enerji ve odaklanma formülü. Beta-Alanin, Kafein ve Kreatin Nitrat içerir.',
    category: 'performance',
    subcategory: 'preworkout',
    brandId: 'cellucor',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'pw-390-fruit', flavor: 'Fruit Punch', weight: '390g', price: 1299, oldPrice: 1499, stock: 20, servings: 30, sku: 'CC-C4-390-FP' },
      { id: 'pw-390-blue', flavor: 'Blue Raspberry', weight: '390g', price: 1299, oldPrice: 1499, stock: 15, servings: 30, sku: 'CC-C4-390-BR' },
    ],
    nutrition: [
      { label: 'Enerji', per100g: '15 kcal', perServing: '5 kcal' },
      { label: 'Beta-Alanin', per100g: '12.3 g', perServing: '1.6 g' },
      { label: 'Kreatin Nitrat', per100g: '7.7 g', perServing: '1 g' },
      { label: 'Kafein', per100g: '1.15 g', perServing: '150 mg' },
    ],
    scoreCard: { effect: 9, taste: 7, price: 7, mixing: 8 },
    flavorMeter: { sweetness: 4, mixability: 4, naturalness: 2 },
    rating: 4.6,
    reviewCount: 156,
    isBestseller: false,
    isNew: true,
    tags: ['pre-workout', 'enerji', 'odaklanma'],
    skt: '05.03.2027',
    freeFrom: ['GDO'],
    crossSellIds: ['creatine-mono-500', 'bcaa-411-300'],
  },
  {
    id: 'mass-gainer-3000',
    name: 'Mass Gainer 3000 Gr',
    slug: 'mass-gainer-3000gr',
    description: 'Kilo almak isteyenler için yüksek kalorili formül. Her serviste 50g protein ve 250g karbonhidrat.',
    category: 'weight',
    subcategory: 'gainer',
    brandId: 'bsn',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'mg-3000-choc', flavor: 'Çikolata', weight: '3000g', price: 2499, oldPrice: 2999, stock: 18, servings: 16, sku: 'BSN-MG-3000-CHC' },
      { id: 'mg-3000-van', flavor: 'Vanilya', weight: '3000g', price: 2499, oldPrice: 2999, stock: 12, servings: 16, sku: 'BSN-MG-3000-VAN' },
    ],
    nutrition: [
      { label: 'Enerji', per100g: '380 kcal', perServing: '710 kcal' },
      { label: 'Protein', per100g: '26.7 g', perServing: '50 g' },
      { label: 'Karbonhidrat', per100g: '53.3 g', perServing: '100 g' },
      { label: 'Yağ', per100g: '5.3 g', perServing: '10 g' },
    ],
    scoreCard: { effect: 8, taste: 7, price: 8, mixing: 6 },
    rating: 4.3,
    reviewCount: 98,
    isBestseller: true,
    isNew: false,
    tags: ['gainer', 'kilo alma', 'hacim'],
    skt: '25.07.2027',
    freeFrom: ['GDO'],
    crossSellIds: ['whey-protein-2000', 'creatine-mono-500'],
  },
  {
    id: 'glutamine-300',
    name: 'L-Glutamin 300 Gr',
    slug: 'l-glutamin-300gr',
    description: 'Saf L-Glutamin amino asit. Kas toparlanması ve bağışıklık sistemi desteği.',
    category: 'amino',
    subcategory: 'glutamine',
    brandId: 'hardline',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'glut-300-unf', flavor: 'Aromasız', weight: '300g', price: 549, oldPrice: 649, stock: 55, servings: 60, sku: 'HL-GLT-300-UNF' },
    ],
    nutrition: [
      { label: 'Enerji', per100g: '0 kcal', perServing: '0 kcal' },
      { label: 'L-Glutamin', per100g: '100 g', perServing: '5 g' },
    ],
    scoreCard: { effect: 8, taste: 5, price: 9, mixing: 8 },
    rating: 4.6,
    reviewCount: 145,
    isBestseller: false,
    isNew: true,
    tags: ['glutamin', 'amino asit', 'toparlanma'],
    skt: '18.11.2027',
    freeFrom: ['Şeker', 'Aroma', 'Renklendirici', 'GDO'],
    crossSellIds: ['bcaa-411-300', 'whey-protein-2000'],
  },
  {
    id: 'gold-standard-whey',
    name: 'Gold Standard 100% Whey 2270 Gr',
    slug: 'gold-standard-whey-2270gr',
    description: 'Dünyanın en çok satan whey proteini. Her serviste 24g protein, 5.5g BCAA.',
    category: 'protein',
    subcategory: 'whey',
    brandId: 'optimum',
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'gs-2270-dchoc', flavor: 'Double Rich Chocolate', weight: '2270g', price: 5499, oldPrice: 6299, stock: 20, servings: 74, sku: 'ON-GS-2270-DRC' },
      { id: 'gs-2270-van', flavor: 'Vanilla Ice Cream', weight: '2270g', price: 5499, oldPrice: 6299, stock: 15, servings: 74, sku: 'ON-GS-2270-VIC' },
      { id: 'gs-908-dchoc', flavor: 'Double Rich Chocolate', weight: '908g', price: 2499, oldPrice: 2899, stock: 35, servings: 29, sku: 'ON-GS-908-DRC' },
    ],
    nutrition: [
      { label: 'Enerji', per100g: '375 kcal', perServing: '120 kcal' },
      { label: 'Protein', per100g: '78 g', perServing: '24 g' },
      { label: 'Karbonhidrat', per100g: '9.4 g', perServing: '3 g' },
      { label: 'Yağ', per100g: '3.4 g', perServing: '1 g' },
      { label: 'BCAA', per100g: '17.2 g', perServing: '5.5 g' },
    ],
    scoreCard: { effect: 9, taste: 9, price: 6, mixing: 9 },
    flavorMeter: { sweetness: 4, mixability: 5, naturalness: 3 },
    rating: 4.9,
    reviewCount: 892,
    isBestseller: true,
    isNew: false,
    tags: ['protein', 'whey', 'gold standard'],
    skt: '12.04.2027',
    freeFrom: ['GDO'],
    crossSellIds: ['creatine-mono-500', 'shaker-pro'],
  },
  {
    id: 'fatburner-thermo',
    name: 'Thermo Fat Burner 120 Kapsül',
    slug: 'thermo-fat-burner-120',
    description: 'Termojenik yağ yakıcı formül. Yeşil çay ekstresi, L-Karnitin ve Kafein içerir.',
    category: 'weight',
    subcategory: 'fatburner',
    brandId: 'muscletech',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'fb-120', flavor: 'Kapsül', weight: '120 Kapsül', price: 799, oldPrice: 999, stock: 30, servings: 60, sku: 'MT-FB-120' },
    ],
    nutrition: [
      { label: 'Yeşil Çay Ekstresi', per100g: '-', perServing: '500 mg' },
      { label: 'L-Karnitin', per100g: '-', perServing: '500 mg' },
      { label: 'Kafein', per100g: '-', perServing: '200 mg' },
    ],
    scoreCard: { effect: 7, taste: 5, price: 8, mixing: 10 },
    rating: 4.2,
    reviewCount: 87,
    isBestseller: false,
    isNew: true,
    tags: ['yağ yakıcı', 'termojenik', 'diyet'],
    skt: '01.06.2027',
    freeFrom: ['Gluten', 'Laktoz'],
    crossSellIds: ['bcaa-411-300', 'glutamine-300'],
  },
  {
    id: 'multivitamin-daily',
    name: 'Daily Multivitamin 120 Tablet',
    slug: 'daily-multivitamin-120',
    description: 'Günlük vitamin ve mineral ihtiyacınızı karşılayan kapsamlı formül. 25 farklı vitamin ve mineral.',
    category: 'vitamin',
    subcategory: 'multivitamin',
    brandId: 'optimum',
    image: 'https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'mv-120', flavor: 'Tablet', weight: '120 Tablet', price: 449, stock: 70, servings: 60, sku: 'ON-MV-120' },
    ],
    nutrition: [
      { label: 'Vitamin A', per100g: '-', perServing: '900 mcg' },
      { label: 'Vitamin C', per100g: '-', perServing: '90 mg' },
      { label: 'Vitamin D', per100g: '-', perServing: '25 mcg' },
      { label: 'Vitamin E', per100g: '-', perServing: '15 mg' },
      { label: 'Çinko', per100g: '-', perServing: '11 mg' },
    ],
    scoreCard: { effect: 8, taste: 5, price: 9, mixing: 10 },
    rating: 4.5,
    reviewCount: 203,
    isBestseller: false,
    isNew: true,
    tags: ['vitamin', 'mineral', 'günlük'],
    skt: '30.09.2027',
    freeFrom: ['GDO', 'Gluten'],
    crossSellIds: ['whey-protein-2000', 'omega3-fish-oil'],
  },
  {
    id: 'omega3-fish-oil',
    name: 'Omega-3 Balık Yağı 100 Kapsül',
    slug: 'omega3-balik-yagi-100',
    description: 'Yüksek EPA ve DHA içerikli balık yağı. Kalp ve beyin sağlığı için.',
    category: 'vitamin',
    subcategory: 'omega3',
    brandId: 'myprotein',
    image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'o3-100', flavor: 'Kapsül', weight: '100 Kapsül', price: 349, oldPrice: 449, stock: 90, servings: 100, sku: 'MP-O3-100' },
    ],
    nutrition: [
      { label: 'Balık Yağı', per100g: '-', perServing: '1000 mg' },
      { label: 'EPA', per100g: '-', perServing: '360 mg' },
      { label: 'DHA', per100g: '-', perServing: '240 mg' },
    ],
    scoreCard: { effect: 8, taste: 4, price: 9, mixing: 10 },
    rating: 4.4,
    reviewCount: 178,
    isBestseller: false,
    isNew: false,
    tags: ['omega-3', 'balık yağı', 'sağlık'],
    skt: '15.01.2028',
    freeFrom: ['GDO'],
    crossSellIds: ['multivitamin-daily'],
  },
  {
    id: 'protein-bar-box',
    name: 'Protein Bar 12\'li Kutu',
    slug: 'protein-bar-12li',
    description: 'Her barda 20g protein. Lezzetli atıştırmalık, spor çantanızdan eksik olmasın.',
    category: 'snack',
    subcategory: 'proteinbar',
    brandId: 'bigjoy',
    image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'pb-12-choc', flavor: 'Çikolata Fıstık', weight: '12x60g', price: 599, oldPrice: 719, stock: 40, servings: 12, sku: 'BJ-PB-12-CHC' },
      { id: 'pb-12-cookie', flavor: 'Cookie & Cream', weight: '12x60g', price: 599, oldPrice: 719, stock: 32, servings: 12, sku: 'BJ-PB-12-CC' },
    ],
    nutrition: [
      { label: 'Enerji', per100g: '350 kcal', perServing: '210 kcal' },
      { label: 'Protein', per100g: '33 g', perServing: '20 g' },
      { label: 'Karbonhidrat', per100g: '35 g', perServing: '21 g' },
      { label: 'Yağ', per100g: '13 g', perServing: '8 g' },
    ],
    scoreCard: { effect: 7, taste: 9, price: 7, mixing: 10 },
    rating: 4.6,
    reviewCount: 312,
    isBestseller: true,
    isNew: false,
    tags: ['protein bar', 'atıştırmalık'],
    skt: '20.08.2027',
    freeFrom: ['GDO'],
    crossSellIds: ['whey-protein-2000'],
  },
  {
    id: 'shaker-pro',
    name: 'Pro Shaker 700ml',
    slug: 'pro-shaker-700ml',
    description: 'BPA-free, sızdırmaz kapak, karıştırma topu dahil. Protein shake hazırlamak için ideal.',
    category: 'accessories',
    subcategory: 'shaker',
    brandId: 'proteinmarket',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'shaker-700-black', flavor: 'Siyah', weight: '700ml', price: 149, stock: 120, servings: 0, sku: 'PM-SH-700-BLK' },
      { id: 'shaker-700-orange', flavor: 'Turuncu', weight: '700ml', price: 149, stock: 95, servings: 0, sku: 'PM-SH-700-ORG' },
    ],
    nutrition: [],
    rating: 4.8,
    reviewCount: 456,
    isBestseller: false,
    isNew: false,
    tags: ['shaker', 'aksesuar'],
    skt: '-',
    freeFrom: ['BPA'],
    crossSellIds: ['whey-protein-2000'],
  },
  {
    id: 'impact-whey-myprotein',
    name: 'Impact Whey Protein 2500 Gr',
    slug: 'impact-whey-protein-2500gr',
    description: 'Avrupa\'nın en çok satan whey proteini. 21g protein, düşük yağ ve şeker.',
    category: 'protein',
    subcategory: 'whey',
    brandId: 'myprotein',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'iw-2500-choc', flavor: 'Çikolata', weight: '2500g', price: 3999, oldPrice: 4799, stock: 22, servings: 100, sku: 'MP-IW-2500-CHC' },
      { id: 'iw-2500-van', flavor: 'Vanilya', weight: '2500g', price: 3999, oldPrice: 4799, stock: 18, servings: 100, sku: 'MP-IW-2500-VAN' },
      { id: 'iw-1000-choc', flavor: 'Çikolata', weight: '1000g', price: 1799, oldPrice: 2099, stock: 40, servings: 40, sku: 'MP-IW-1000-CHC' },
    ],
    nutrition: defaultNutrition,
    scoreCard: { effect: 8, taste: 8, price: 9, mixing: 8 },
    flavorMeter: { sweetness: 3, mixability: 4, naturalness: 3 },
    rating: 4.6,
    reviewCount: 678,
    isBestseller: true,
    isNew: false,
    tags: ['protein', 'whey', 'impact'],
    skt: '22.06.2027',
    freeFrom: ['GDO'],
    crossSellIds: ['creatine-mono-500', 'shaker-pro'],
  },
  {
    id: 'nitrotech-whey',
    name: 'Nitro-Tech Whey Gold 2270 Gr',
    slug: 'nitrotech-whey-gold-2270gr',
    description: 'Peptid ve izolat bazlı premium whey protein. Her serviste 24g protein.',
    category: 'protein',
    subcategory: 'whey',
    brandId: 'muscletech',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&h=800&fit=crop',
    ],
    variants: [
      { id: 'nt-2270-choc', flavor: 'Double Rich Chocolate', weight: '2270g', price: 4999, oldPrice: 5799, stock: 14, servings: 71, sku: 'MT-NT-2270-DRC' },
    ],
    nutrition: defaultNutrition,
    scoreCard: { effect: 9, taste: 8, price: 6, mixing: 8 },
    flavorMeter: { sweetness: 4, mixability: 4, naturalness: 3 },
    rating: 4.7,
    reviewCount: 234,
    isBestseller: false,
    isNew: true,
    tags: ['protein', 'whey', 'nitrotech'],
    skt: '08.05.2027',
    freeFrom: ['GDO'],
    crossSellIds: ['creatine-mono-500', 'bcaa-411-300'],
  },
];

// ===== CAMPAIGNS =====
export const campaigns: Campaign[] = [
  {
    id: 'bogo-protein',
    title: '2 Al 1 Öde',
    description: 'Seçili protein ürünlerinde 2 al 1 öde fırsatı! Stoklar ile sınırlıdır.',
    type: 'bogo',
    code: 'BOGO2025',
    active: true,
  },
  {
    id: 'cart-discount',
    title: 'Sepette %20 İndirim',
    description: '500 TL ve üzeri alışverişlerde sepette ekstra %20 indirim.',
    type: 'percentage',
    code: 'SEPET20',
    active: true,
  },
  {
    id: 'shaker-gift',
    title: 'Shaker Hediye',
    description: '1000 TL üzeri alışverişlerde ProteinMarket Pro Shaker hediye!',
    type: 'gift',
    active: true,
  },
  {
    id: 'tiered-gifts',
    title: 'Kademeli Hediye',
    description: 'Sepet tutarına göre hediyeler kazan! Ne kadar çok alırsan o kadar çok hediye.',
    type: 'tiered',
    active: true,
    tiers: [
      { threshold: 500, reward: 'Tek Kullanımlık Whey' },
      { threshold: 1000, reward: 'Pro Shaker' },
      { threshold: 2000, reward: 'Spor Havlusu' },
      { threshold: 3000, reward: 'Spor Çantası' },
    ],
  },
  {
    id: 'hardline-discount',
    title: 'Hardline %15',
    description: 'Tüm Hardline ürünlerinde %15 indirim! Kod ile geçerlidir.',
    type: 'percentage',
    code: 'HARDLINE15',
    active: true,
  },
];

// ===== QUIZ OPTIONS =====
export const flavorOptions = [
  { id: 'chocolate', label: 'Çikolata', emoji: '🍫' },
  { id: 'vanilla', label: 'Vanilya', emoji: '🍦' },
  { id: 'strawberry', label: 'Çilek', emoji: '🍓' },
  { id: 'banana', label: 'Muz', emoji: '🍌' },
  { id: 'unflavored', label: 'Aromasız', emoji: '💧' },
];

export const goalOptions = [
  { id: 'muscle', label: 'Kas Yapmak', emoji: '💪', icon: 'Dumbbell' },
  { id: 'fat-loss', label: 'Yağ Yakmak', emoji: '🔥', icon: 'Flame' },
  { id: 'endurance', label: 'Dayanıklılık', emoji: '🏃', icon: 'TrendingUp' },
  { id: 'health', label: 'Genel Sağlık', emoji: '❤️', icon: 'Heart' },
];

// ===== HELPER FUNCTIONS =====
export function getBrandById(id: string): Brand | undefined {
  return brands.find(b => b.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const category = categories.find(c => c.slug === categorySlug);
  if (!category) return [];
  return products.filter(p => p.category === category.id);
}

export function getProductsByBrand(brandId: string): Product[] {
  return products.filter(p => p.brandId === brandId);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q)) ||
    getBrandById(p.brandId)?.name.toLowerCase().includes(q)
  );
}
