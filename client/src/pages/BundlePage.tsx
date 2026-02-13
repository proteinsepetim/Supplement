/*
 * BundlePage - Kendi Paketini Yap
 * Müşteri kendi paketini oluşturup %15 indirim alır
 * Lucide ikon entegrasyonu düzeltildi
 */
import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { ChevronRight, Plus, X, ShoppingCart, Package, Percent, Dumbbell, Zap, Flame, TrendingUp, Pill, Cookie, Shirt } from 'lucide-react';
import { products, categories, getBrandById, type Product } from '@/lib/data';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const MIN_ITEMS = 3;
const DISCOUNT_PERCENT = 15;

const categoryIcons: Record<string, React.ElementType> = {
  'Dumbbell': Dumbbell,
  'Zap': Zap,
  'Flame': Flame,
  'TrendingUp': TrendingUp,
  'Bolt': Zap,
  'Pill': Pill,
  'Cookie': Cookie,
  'Shirt': Shirt,
};

export default function BundlePage() {
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const { addItem } = useCart();

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => !selectedItems.some(s => s.id === p.id));
    if (activeCategory) result = result.filter(p => p.category === activeCategory);
    return result;
  }, [activeCategory, selectedItems]);

  const totalPrice = selectedItems.reduce((s, p) => s + p.variants[0].price, 0);
  const discountedPrice = Math.round(totalPrice * (1 - DISCOUNT_PERCENT / 100));
  const savings = totalPrice - discountedPrice;
  const canCheckout = selectedItems.length >= MIN_ITEMS;

  const addToBundle = (product: Product) => {
    if (selectedItems.length < 6) {
      setSelectedItems([...selectedItems, product]);
      toast.success(`${product.name} pakete eklendi!`);
    }
  };

  const removeFromBundle = (id: string) => {
    setSelectedItems(selectedItems.filter(p => p.id !== id));
  };

  const handleAddAllToCart = () => {
    selectedItems.forEach(product => {
      const variant = product.variants.find(v => v.stock > 0) || product.variants[0];
      addItem(product, variant);
    });
    toast.success(`${selectedItems.length} ürün sepete eklendi! %${DISCOUNT_PERCENT} paket indirimi uygulandı.`);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B2A4A] font-medium">Kendi Paketini Yap</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/5 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Package className="w-8 h-8 text-[#FF6B35]" />
          </motion.div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-[#1B2A4A]">Kendi Paketini Yap</h1>
          <p className="text-gray-500 text-sm mt-2">En az {MIN_ITEMS} ürün seç, <span className="text-[#FF6B35] font-bold">%{DISCOUNT_PERCENT} indirim</span> kazan!</p>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-6 h-6 bg-[#1B2A4A] text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span> Ürün Seç</span>
            <span className="w-8 h-px bg-gray-200" />
            <span className="flex items-center gap-1.5"><span className="w-6 h-6 bg-[#1B2A4A] text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span> Paketi Oluştur</span>
            <span className="w-8 h-px bg-gray-200" />
            <span className="flex items-center gap-1.5"><span className="w-6 h-6 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</span> İndirim Kazan</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            {/* Category Filter with Lucide Icons */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
              <button onClick={() => setActiveCategory('')}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all duration-200 flex items-center gap-1.5 ${
                  !activeCategory ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-md shadow-orange-200' : 'bg-white text-gray-600 border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35]'
                }`}>
                Tümü
              </button>
              {categories.map(cat => {
                const IconComponent = categoryIcons[cat.icon] || Dumbbell;
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all duration-200 flex items-center gap-1.5 ${
                      activeCategory === cat.id ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-md shadow-orange-200' : 'bg-white text-gray-600 border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35]'
                    }`}>
                    <IconComponent className="w-3.5 h-3.5" />
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white border border-gray-100 rounded-xl p-3 hover:border-[#FF6B35] hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-50">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      {selectedItems.length >= 6 && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <span className="bg-white text-gray-600 text-[10px] font-bold px-2 py-1 rounded">Paket Dolu</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-[#FF6B35] font-semibold uppercase tracking-wider">{getBrandById(product.brandId)?.name}</p>
                    <p className="text-xs font-heading font-semibold text-[#1B2A4A] line-clamp-2 mt-0.5 leading-tight">{product.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-[#1B2A4A]">{product.variants[0].price.toLocaleString('tr-TR')} TL</span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => addToBundle(product)}
                        disabled={selectedItems.length >= 6}
                        className="w-8 h-8 bg-[#FF6B35] text-white rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Bundle Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-36 shadow-sm">
              <h2 className="font-heading font-bold text-lg text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#FF6B35]" /> Paketim ({selectedItems.length}/6)
              </h2>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{selectedItems.length} / {MIN_ITEMS} ürün</span>
                  <span className={canCheckout ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                    {canCheckout ? '✓ İndirim aktif!' : `${MIN_ITEMS - selectedItems.length} ürün daha ekle`}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${canCheckout ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-[#FF6B35] to-orange-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((selectedItems.length / MIN_ITEMS) * 100, 100)}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {selectedItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">Henüz ürün eklenmedi</p>
                  <p className="text-xs text-gray-300 mt-1">Soldan ürün seçerek başlayın</p>
                </div>
              ) : (
                <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
                  <AnimatePresence>
                    {selectedItems.map(product => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-2.5 bg-gray-50 rounded-lg p-2.5"
                      >
                        <img src={product.image} alt={product.name} className="w-11 h-11 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1B2A4A] truncate">{product.name}</p>
                          <p className="text-[10px] text-gray-400">{product.variants[0].price.toLocaleString('tr-TR')} TL</p>
                        </div>
                        <button onClick={() => removeFromBundle(product.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {selectedItems.length > 0 && (
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ara Toplam</span>
                    <span className={canCheckout ? 'line-through text-gray-400' : 'font-semibold text-[#1B2A4A]'}>{totalPrice.toLocaleString('tr-TR')} TL</span>
                  </div>
                  {canCheckout && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center gap-1"><Percent className="w-3 h-3" /> Paket İndirimi</span>
                        <span className="font-semibold">-{savings.toLocaleString('tr-TR')} TL</span>
                      </div>
                      <div className="flex justify-between font-heading font-bold text-lg pt-1">
                        <span className="text-[#1B2A4A]">Ödenecek</span>
                        <span className="text-[#FF6B35]">{discountedPrice.toLocaleString('tr-TR')} TL</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddAllToCart}
                disabled={!canCheckout}
                className="w-full mt-4 py-3.5 bg-[#FF6B35] text-white rounded-xl font-heading font-bold text-sm hover:bg-orange-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-orange-200/50"
              >
                <ShoppingCart className="w-4 h-4" />
                {canCheckout ? 'Paketi Sepete Ekle' : `${MIN_ITEMS - selectedItems.length} ürün daha ekle`}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
