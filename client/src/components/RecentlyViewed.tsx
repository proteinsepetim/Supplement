/*
 * RecentlyViewed - Son Görüntülenen Ürünler
 * Yatay kaydırmalı ürün bandı
 */
import { Link } from 'wouter';
import { Clock } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { products } from '@/lib/data';

export default function RecentlyViewed() {
  const { recentlyViewed } = useNotifications();

  const viewedProducts = recentlyViewed
    .map(id => products.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 8);

  if (viewedProducts.length === 0) return null;

  return (
    <section className="py-8 bg-white border-t border-gray-100">
      <div className="container">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#FF6B35]" />
          <h2 className="font-heading font-bold text-lg text-[#1B2A4A]">Son Görüntülenen Ürünler</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {viewedProducts.map(product => {
            if (!product) return null;
            const variant = product.variants[0];
            return (
              <Link
                key={product.id}
                href={`/urun/${product.slug}`}
                className="shrink-0 w-36 bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-[#1B2A4A] line-clamp-2 leading-tight group-hover:text-[#FF6B35] transition-colors">{product.name}</p>
                  <p className="text-sm font-bold text-[#FF6B35] mt-1">{variant.price.toLocaleString('tr-TR')} TL</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
