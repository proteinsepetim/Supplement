/*
 * ProductCard - Athletic Precision Design
 * Favori kalp, servis başı fiyat, skor badge, sepete ekleme animasyonu
 */
import { Link } from 'wouter';
import { ShoppingCart, Star, TrendingUp, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Product } from '@/lib/data';
import { getBrandById } from '@/lib/data';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useNotifications();
  const defaultVariant = product.variants.find(v => v.stock > 0) || product.variants[0];
  const brand = getBrandById(product.brandId);
  const discount = defaultVariant.oldPrice
    ? Math.round(((defaultVariant.oldPrice - defaultVariant.price) / defaultVariant.oldPrice) * 100)
    : 0;
  const costPerServing = defaultVariant.servings > 0
    ? (defaultVariant.price / defaultVariant.servings).toFixed(0)
    : null;
  const avgScore = product.scoreCard
    ? Math.round((product.scoreCard.effect + product.scoreCard.taste + product.scoreCard.price + product.scoreCard.mixing) / 4)
    : null;
  const favorited = isFavorite(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, defaultVariant);
    toast.success(`${product.name} sepete eklendi!`, {
      description: `${defaultVariant.flavor} - ${defaultVariant.weight}`,
      action: {
        label: 'Sepete Git',
        onClick: () => window.location.href = '/sepet',
      },
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 relative"
    >
      <Link href={`/urun/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />

          {/* Favori Kalp */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <Heart className={`w-4 h-4 transition-colors ${favorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
          </button>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">%{discount} İNDİRİM</span>
            )}
            {product.isNew && (
              <span className="bg-[#1B2A4A] text-white text-[10px] font-bold px-2 py-0.5 rounded">YENİ</span>
            )}
            {product.isBestseller && (
              <span className="bg-[#FF6B35] text-white text-[10px] font-bold px-2 py-0.5 rounded">ÇOK SATAN</span>
            )}
          </div>

          {/* Skor Badge */}
          {avgScore && (
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#FF6B35]" />
              <span className="text-xs font-bold text-[#1B2A4A]">{avgScore}/10</span>
            </div>
          )}

          {/* Stokta Yok Overlay */}
          {defaultVariant.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-heading font-bold text-sm">Stokta Yok</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        {brand && (
          <Link href={`/marka/${brand.slug}`} className="text-[11px] text-[#FF6B35] font-semibold uppercase tracking-wider hover:underline">
            {brand.name}
          </Link>
        )}
        <Link href={`/urun/${product.slug}`}>
          <h3 className="font-heading font-semibold text-sm text-[#1B2A4A] mt-0.5 line-clamp-2 hover:text-[#FF6B35] transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Cost per serving */}
        {costPerServing && (
          <div className="mt-1.5 text-[10px] text-gray-500 bg-gray-50 rounded px-2 py-0.5 inline-block">
            Servis Başı: <span className="font-bold text-[#1B2A4A]">{costPerServing} TL</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-2">
          <div>
            {defaultVariant.oldPrice && (
              <span className="text-xs text-gray-400 line-through block">{defaultVariant.oldPrice.toLocaleString('tr-TR')} TL</span>
            )}
            <span className="font-heading font-bold text-lg text-[#1B2A4A]">{defaultVariant.price.toLocaleString('tr-TR')} <span className="text-sm">TL</span></span>
          </div>
          {defaultVariant.stock > 0 ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="w-9 h-9 bg-[#FF6B35] text-white rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
            </motion.button>
          ) : (
            <span className="text-[10px] text-red-500 font-medium">Tükendi</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
