import { drizzle } from 'drizzle-orm/mysql2';
import { categories, products, productVariants } from '../drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

const categoriesData = [
  { id: 'protein-tozu', name: 'Protein Tozu', slug: 'protein-tozu', description: 'Kas gelişimi için protein takviyeleri', icon: 'Dumbbell' },
  { id: 'performans-guc', name: 'Performans & Güç', slug: 'performans-guc', description: 'Performans artırıcı takviyeler', icon: 'Zap' },
  { id: 'kilo-hacim', name: 'Kilo & Hacim', slug: 'kilo-hacim', description: 'Kilo ve hacim kazanımı için', icon: 'TrendingUp' },
  { id: 'amino-asit', name: 'Amino Asit', slug: 'amino-asit', description: 'BCAA ve amino asit takviyeleri', icon: 'Pill' },
];

const productsData = [
  {
    id: 'whey-protein-2000gr',
    name: 'Whey Protein 2000 Gr',
    slug: 'whey-protein-2000gr',
    description: 'Yüksek kaliteli whey protein konsantresi. Her serviste 23g protein içerir.',
    brandId: 'proteinmarket',
    categoryId: 'protein-tozu',
    basePrice: 359900, // 3599 TL in cents
    rating: 47,
    reviewCount: 342,
    imageUrl: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9',
    tags: JSON.stringify(['Whey', 'Protein', 'Kas Gelişimi']),
    nutritionFacts: JSON.stringify({ protein: 23, carbs: 3, fat: 1.5, calories: 120 }),
    isActive: 'true'
  },
  {
    id: 'kreatin-monohidrat-500gr',
    name: 'Kreatin Monohidrat 500 Gr',
    slug: 'kreatin-monohidrat-500gr',
    description: 'Saf kreatin monohidrat. Performans ve güç artışı için.',
    brandId: 'optimum-nutrition',
    categoryId: 'performans-guc',
    basePrice: 109900,
    rating: 48,
    reviewCount: 567,
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d',
    tags: JSON.stringify(['Kreatin', 'Performans', 'Güç']),
    nutritionFacts: JSON.stringify({ creatine: 5000 }),
    isActive: 'true'
  },
  {
    id: 'bcaa-411-300gr',
    name: 'BCAA 4:1:1 300 Gr',
    slug: 'bcaa-411-300gr',
    description: 'Dallanmış zincirli amino asitler. Kas korunması ve toparlanma.',
    brandId: 'bigjoy',
    categoryId: 'amino-asit',
    basePrice: 84900,
    rating: 46,
    reviewCount: 234,
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5',
    tags: JSON.stringify(['BCAA', 'Amino Asit', 'Toparlanma']),
    nutritionFacts: JSON.stringify({ leucine: 4000, isoleucine: 1000, valine: 1000 }),
    isActive: 'true'
  },
];

const variantsData = [
  // Whey Protein variants
  { id: 'whey-2000-chocolate', productId: 'whey-protein-2000gr', sku: 'WP-2000-CHC', name: '2000g Çikolata', size: '2000g', flavor: 'Çikolata', price: 359900, stock: 150, imageUrl: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9', isActive: 'true' },
  { id: 'whey-2000-vanilla', productId: 'whey-protein-2000gr', sku: 'WP-2000-VAN', name: '2000g Vanilya', size: '2000g', flavor: 'Vanilya', price: 359900, stock: 120, imageUrl: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9', isActive: 'true' },
  { id: 'whey-1000-chocolate', productId: 'whey-protein-2000gr', sku: 'WP-1000-CHC', name: '1000g Çikolata', size: '1000g', flavor: 'Çikolata', price: 189900, stock: 200, imageUrl: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9', isActive: 'true' },
  // Kreatin variants
  { id: 'kreatin-500-unflavored', productId: 'kreatin-monohidrat-500gr', sku: 'KR-500-UNF', name: '500g Aromasız', size: '500g', flavor: 'Aromasız', price: 109900, stock: 180, imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d', isActive: 'true' },
  // BCAA variants
  { id: 'bcaa-300-lemon', productId: 'bcaa-411-300gr', sku: 'BCAA-300-LEM', name: '300g Limon', size: '300g', flavor: 'Limon', price: 84900, stock: 90, imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5', isActive: 'true' },
  { id: 'bcaa-300-orange', productId: 'bcaa-411-300gr', sku: 'BCAA-300-ORA', name: '300g Portakal', size: '300g', flavor: 'Portakal', price: 84900, stock: 75, imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5', isActive: 'true' },
];

async function seed() {
  console.log('🌱 Seeding database...');
  
  try {
    // Insert categories
    console.log('📁 Inserting categories...');
    await db.insert(categories).values(categoriesData);
    console.log(`✅ ${categoriesData.length} categories inserted`);
    
    // Insert products
    console.log('📦 Inserting products...');
    await db.insert(products).values(productsData);
    console.log(`✅ ${productsData.length} products inserted`);
    
    // Insert product variants
    console.log('🎨 Inserting product variants...');
    await db.insert(productVariants).values(variantsData);
    console.log(`✅ ${variantsData.length} variants inserted`);
    
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

seed();
