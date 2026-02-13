/*
 * FavoritesPage - Favori ürünler sayfası
 * Kalp ikonu ile eklenen ürünlerin listesi
 */
import { Link } from 'wouter';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { products } from '@/lib/data';
import ProductCard from '@/components/ProductCard';

export default function FavoritesPage() {
  const { favorites } = useNotifications();

  const favoriteProducts = favorites
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <span>/</span>
            <span className="text-[#1B2A4A] font-medium">Favorilerim</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-[#FF6B35] fill-[#FF6B35]" />
          <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">Favorilerim</h1>
          <span className="bg-[#FF6B35]/10 text-[#FF6B35] text-sm font-bold px-2.5 py-0.5 rounded-full">{favoriteProducts.length}</span>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="font-heading font-bold text-xl text-[#1B2A4A] mb-2">Henüz favori ürününüz yok</h2>
            <p className="text-gray-500 text-sm mb-6">Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors">
              <ShoppingBag className="w-4 h-4" />
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favoriteProducts.map((product, i) => (
                product && <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-[#FF6B35] font-heading font-semibold text-sm hover:underline">
                <ArrowLeft className="w-4 h-4" />
                Alışverişe Devam Et
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
