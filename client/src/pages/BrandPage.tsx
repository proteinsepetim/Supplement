/*
 * BrandPage - Tek marka sayfası
 * Marka bilgisi, ürünleri, filtre
 */
import { useParams, Link } from 'wouter';
import { ChevronRight, Globe, MapPin } from 'lucide-react';
import { brands, products } from '@/lib/data';
import ProductCard from '@/components/ProductCard';

export default function BrandPage() {
  const params = useParams<{ slug: string }>();
  const brand = brands.find(b => b.slug === params.slug);

  if (!brand) return (
    <div className="container py-20 text-center">
      <p className="text-gray-500">Marka bulunamadı.</p>
      <Link href="/markalar" className="text-[#FF6B35] font-semibold mt-4 inline-block">Tüm Markalar</Link>
    </div>
  );

  const brandProducts = products.filter(p => p.brandId === brand.id);

  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/markalar" className="hover:text-[#FF6B35]">Markalar</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B2A4A] font-medium">{brand.name}</span>
          </nav>
        </div>
      </div>

      {/* Brand Header */}
      <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2a3d5c] text-white py-10">
        <div className="container flex items-center gap-6">
          <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shrink-0">
            <span className="font-heading font-black text-3xl text-[#1B2A4A]">{brand.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="font-heading font-bold text-3xl">{brand.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {brand.country}</span>
              <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {brand.slug}.com</span>
            </div>
            {brand.description && <p className="text-gray-300 text-sm mt-2 max-w-xl">{brand.description}</p>}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-xl text-[#1B2A4A]">{brand.name} Ürünleri ({brandProducts.length})</h2>
        </div>
        {brandProducts.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Bu markaya ait ürün bulunmamaktadır.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {brandProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
