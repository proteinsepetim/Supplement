/*
 * CategoryPage - Athletic Precision Design
 * Sol sidebar filtreleme (desktop), bottom sheet (mobil)
 * Marka, fiyat, aroma filtreleri
 */
import { useState, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import { ChevronRight, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { products, categories, brands, getBrandById } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export default function CategoryPage() {
  const params = useParams<{ slug: string; sub?: string }>();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({ brand: true, price: true });

  const category = categories.find(c => c.slug === params.slug);
  const subcategory = params.sub ? category?.subcategories.find(s => s.slug === params.sub) : null;

  const filteredProducts = useMemo(() => {
    let result = products;

    if (category) {
      result = result.filter(p => p.category === category.id);
    }
    if (subcategory) {
      result = result.filter(p => p.subcategory === subcategory.id);
    }
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brandId));
    }
    result = result.filter(p => {
      const minPrice = Math.min(...p.variants.map(v => v.price));
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    switch (sortBy) {
      case 'price-asc':
        return [...result].sort((a, b) => a.variants[0].price - b.variants[0].price);
      case 'price-desc':
        return [...result].sort((a, b) => b.variants[0].price - a.variants[0].price);
      case 'rating':
        return [...result].sort((a, b) => b.rating - a.rating);
      case 'newest':
        return [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      default:
        return [...result].sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }
  }, [category, subcategory, selectedBrands, priceRange, sortBy]);

  const availableBrands = useMemo(() => {
    const brandIds = Array.from(new Set(products.filter(p => !category || p.category === category.id).map(p => p.brandId)));
    return brands.filter(b => brandIds.includes(b.id));
  }, [category]);

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
    );
  };

  const toggleFilter = (key: string) => {
    setExpandedFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const FilterContent = () => (
    <div className="space-y-5">
      {/* Brands */}
      <div>
        <button onClick={() => toggleFilter('brand')} className="flex items-center justify-between w-full mb-2">
          <span className="font-heading font-bold text-sm text-[#1B2A4A]">Marka</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilters.brand ? 'rotate-180' : ''}`} />
        </button>
        {expandedFilters.brand && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {availableBrands.map(brand => (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => toggleBrand(brand.id)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                />
                <span className="text-sm text-gray-600">{brand.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div>
        <button onClick={() => toggleFilter('price')} className="flex items-center justify-between w-full mb-2">
          <span className="font-heading font-bold text-sm text-[#1B2A4A]">Fiyat Aralığı</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilters.price ? 'rotate-180' : ''}`} />
        </button>
        {expandedFilters.price && (
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={10000}
              step={100}
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-[#FF6B35]"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{priceRange[0].toLocaleString('tr-TR')} TL</span>
              <span>{priceRange[1].toLocaleString('tr-TR')} TL</span>
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {(selectedBrands.length > 0 || priceRange[1] < 10000) && (
        <button
          onClick={() => { setSelectedBrands([]); setPriceRange([0, 10000]); }}
          className="w-full text-sm text-[#FF6B35] font-semibold py-2 border border-[#FF6B35] rounded-lg hover:bg-orange-50 transition-colors"
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <ChevronRight className="w-3 h-3" />
            {category ? (
              <>
                <Link href={`/kategori/${category.slug}`} className="hover:text-[#FF6B35]">{category.name}</Link>
                {subcategory && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#1B2A4A] font-medium">{subcategory.name}</span>
                  </>
                )}
              </>
            ) : (
              <span className="text-[#1B2A4A] font-medium">Tüm Ürünler</span>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">
              {subcategory?.name || category?.name || 'Tüm Ürünler'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{filteredProducts.length} ürün bulundu</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-[#1B2A4A] hover:border-[#FF6B35] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtrele
            </button>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-[#1B2A4A] bg-white focus:outline-none focus:border-[#FF6B35]"
            >
              <option value="popular">Popülerlik</option>
              <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
              <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
              <option value="rating">Puan</option>
              <option value="newest">En Yeni</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
              <h3 className="font-heading font-bold text-sm text-[#1B2A4A] mb-4 uppercase tracking-wider">Filtreler</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-heading font-semibold text-lg text-gray-400">Ürün bulunamadı</p>
                <p className="text-sm text-gray-300 mt-1">Filtrelerinizi değiştirmeyi deneyin</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[80vh] overflow-y-auto p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-lg text-[#1B2A4A]">Filtreler</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterContent />
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full mt-4 bg-[#FF6B35] text-white py-3 rounded-lg font-heading font-bold text-sm"
              >
                {filteredProducts.length} Ürünü Göster
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
