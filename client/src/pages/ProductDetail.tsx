/*
 * ProductDetail - Athletic Precision Design
 * Ürün detay sayfası: galeri, varyasyon seçimi, skor kartı, aroma metresi,
 * besin değerleri, orijinallik sorgulama, cross-sell, abonelik
 */
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import {
  ChevronRight, ShoppingCart, Heart, Shield, Truck, Package, Star,
  TrendingUp, Check, X, Minus, Plus, RotateCcw, Zap, AlertTriangle
} from 'lucide-react';
import { getProductBySlug, getBrandById, getProductById, products, type Product, type ProductVariant } from '@/lib/data';
import { useCart } from '@/contexts/CartContext';
import { useNotifications } from '@/contexts/NotificationContext';
import ProductCard from '@/components/ProductCard';
import StockAlertModal from '@/components/StockAlertModal';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

function ScoreBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="bg-gradient-to-r from-[#FF6B35] to-orange-400 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-[#1B2A4A] w-8 text-right">{value}/{max}</span>
    </div>
  );
}

function FlavorBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} className={`w-6 h-3 rounded-sm ${i < value ? 'bg-[#FF6B35]' : 'bg-gray-200'}`} />
        ))}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const params = useParams<{ slug: string }>();
  const product = getProductBySlug(params.slug || '');
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite, addRecentlyViewed } = useNotifications();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'nutrition' | 'reviews'>('desc');
  const [subscribe, setSubscribe] = useState(false);
  const [stockAlertOpen, setStockAlertOpen] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authResult, setAuthResult] = useState<'idle' | 'checking' | 'success' | 'fail'>('idle');

  useEffect(() => {
    if (product) {
      const defaultVar = product.variants.find(v => v.stock > 0) || product.variants[0];
      setSelectedVariant(defaultVar);
      addRecentlyViewed(product.id);
      window.scrollTo(0, 0);
    }
  }, [product?.id]);

  const brand = product ? getBrandById(product.brandId) : null;
  const category = product ? product.category : '';
  const favorited = product ? isFavorite(product.id) : false;

  const costPerServing = selectedVariant && selectedVariant.servings > 0
    ? (selectedVariant.price / selectedVariant.servings).toFixed(0)
    : null;

  const discount = selectedVariant?.oldPrice
    ? Math.round(((selectedVariant.oldPrice - selectedVariant.price) / selectedVariant.oldPrice) * 100)
    : 0;

  const crossSellProducts = useMemo(() => {
    if (!product) return [];
    return product.crossSellIds.map(id => getProductById(id)).filter(Boolean) as Product[];
  }, [product]);

  const sameBrandProducts = useMemo(() => {
    if (!product) return [];
    return products.filter(p => p.brandId === product.brandId && p.id !== product.id).slice(0, 4);
  }, [product]);

  // Unique flavors and weights
  const flavors = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set(product.variants.map(v => v.flavor)));
  }, [product]);

  const weights = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set(product.variants.map(v => v.weight)));
  }, [product]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    if (selectedVariant.stock === 0) {
      setStockAlertOpen(true);
      return;
    }
    const finalPrice = subscribe ? selectedVariant.price * 0.9 : selectedVariant.price;
    addItem(product, { ...selectedVariant, price: finalPrice }, quantity);
    toast.success(`${product.name} sepete eklendi!`, {
      description: `${selectedVariant.flavor} - ${selectedVariant.weight} x ${quantity}`,
    });
  };

  const handleAuthCheck = () => {
    if (!authCode.trim()) return;
    setAuthResult('checking');
    setTimeout(() => {
      setAuthResult(authCode.length >= 6 ? 'success' : 'fail');
    }, 1500);
  };

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading font-bold text-2xl text-[#1B2A4A] mb-4">Ürün Bulunamadı</h1>
        <p className="text-gray-500 mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors">
          Anasayfaya Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/kategori/${category}`} className="hover:text-[#FF6B35] capitalize">{category === 'protein' ? 'Protein Tozu' : category}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B2A4A] font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-3">
              <img
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? 'border-[#FF6B35]' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Brand */}
            {brand && (
              <Link href={`/marka/${brand.slug}`} className="text-sm text-[#FF6B35] font-semibold uppercase tracking-wider hover:underline">
                {brand.name}
              </Link>
            )}
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-[#1B2A4A] mt-1">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating} ({product.reviewCount} değerlendirme)</span>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-end gap-3">
              <span className="font-heading font-black text-3xl text-[#1B2A4A]">
                {selectedVariant ? selectedVariant.price.toLocaleString('tr-TR') : product.variants[0].price.toLocaleString('tr-TR')} TL
              </span>
              {selectedVariant?.oldPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">{selectedVariant.oldPrice.toLocaleString('tr-TR')} TL</span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">%{discount}</span>
                </>
              )}
            </div>

            {/* Cost per serving */}
            {costPerServing && (
              <div className="mt-2 text-sm text-gray-500">
                Servis Başı: <span className="font-bold text-[#1B2A4A]">{costPerServing} TL</span>
                <span className="text-gray-400 ml-1">({selectedVariant?.servings} servis)</span>
              </div>
            )}

            {/* SKT */}
            <div className="mt-2 text-xs text-gray-400">SKT: {product.skt}</div>

            {/* Flavor Selection */}
            {flavors.length > 1 && (
              <div className="mt-5">
                <p className="text-sm font-heading font-semibold text-[#1B2A4A] mb-2">Aroma</p>
                <div className="flex flex-wrap gap-2">
                  {flavors.map(flavor => (
                    <button
                      key={flavor}
                      onClick={() => {
                        const v = product.variants.find(v => v.flavor === flavor && v.weight === selectedVariant?.weight) ||
                                  product.variants.find(v => v.flavor === flavor);
                        if (v) setSelectedVariant(v);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        selectedVariant?.flavor === flavor
                          ? 'border-[#FF6B35] bg-orange-50 text-[#FF6B35]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weight Selection */}
            {weights.length > 1 && (
              <div className="mt-4">
                <p className="text-sm font-heading font-semibold text-[#1B2A4A] mb-2">Gramaj</p>
                <div className="flex flex-wrap gap-2">
                  {weights.map(weight => (
                    <button
                      key={weight}
                      onClick={() => {
                        const v = product.variants.find(v => v.weight === weight && v.flavor === selectedVariant?.flavor) ||
                                  product.variants.find(v => v.weight === weight);
                        if (v) setSelectedVariant(v);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        selectedVariant?.weight === weight
                          ? 'border-[#FF6B35] bg-orange-50 text-[#FF6B35]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {weight}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subscribe & Save */}
            <div className="mt-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={subscribe} onChange={e => setSubscribe(e.target.checked)}
                  className="w-4 h-4 rounded border-green-300 text-green-600 focus:ring-green-500" />
                <div>
                  <span className="text-sm font-heading font-bold text-green-700">Her Ay Gönder & %10 Tasarruf Et</span>
                  <p className="text-xs text-green-600 mt-0.5">Düzenli teslimat ile her ay otomatik gönderilir. İstediğiniz zaman iptal edin.</p>
                </div>
              </label>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-gray-50">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-heading font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 hover:bg-gray-50">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#FF6B35] text-white py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <ShoppingCart className="w-5 h-5" />
                {selectedVariant?.stock === 0 ? 'Stok Bildirimi Al' : 'Sepete Ekle'}
              </button>
              <button
                onClick={() => product && toggleFavorite(product.id)}
                className={`p-3 rounded-lg border transition-colors ${
                  favorited ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { icon: Shield, label: 'Orijinal Ürün' },
                { icon: Truck, label: 'Hızlı Kargo' },
                { icon: Package, label: 'Güvenli Paket' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                  <badge.icon className="w-4 h-4 text-[#FF6B35]" />
                  <span className="text-xs font-medium text-[#1B2A4A]">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Free From */}
            {product.freeFrom.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.freeFrom.map((item, i) => (
                  <span key={i} className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium border border-green-100">
                    {item} İçermez
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Score Card & Flavor Meter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {product.scoreCard && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-heading font-bold text-lg text-[#1B2A4A] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
                Skor Kartı
              </h3>
              <div className="space-y-3">
                <ScoreBar label="Etkinlik" value={product.scoreCard.effect} />
                <ScoreBar label="Tat" value={product.scoreCard.taste} />
                <ScoreBar label="Fiyat/Perf." value={product.scoreCard.price} />
                <ScoreBar label="Karışım" value={product.scoreCard.mixing} />
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <span className="font-heading font-black text-2xl text-[#FF6B35]">
                  {Math.round((product.scoreCard.effect + product.scoreCard.taste + product.scoreCard.price + product.scoreCard.mixing) / 4)}/10
                </span>
                <p className="text-xs text-gray-400 mt-0.5">Genel Skor</p>
              </div>
            </div>
          )}

          {product.flavorMeter && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-heading font-bold text-lg text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FF6B35]" />
                Aroma Metresi
              </h3>
              <div className="space-y-4">
                <FlavorBar label="Tatlılık" value={product.flavorMeter.sweetness} />
                <FlavorBar label="Karışabilirlik" value={product.flavorMeter.mixability} />
                <FlavorBar label="Doğallık" value={product.flavorMeter.naturalness} />
              </div>
            </div>
          )}
        </div>

        {/* Tabs: Description, Nutrition, Reviews */}
        <div className="mt-8 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { key: 'desc', label: 'Ürün Açıklaması' },
              { key: 'nutrition', label: 'Besin Değerleri' },
              { key: 'reviews', label: `Yorumlar (${product.reviewCount})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-6 py-3 text-sm font-heading font-semibold transition-colors ${
                  activeTab === tab.key
                    ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'desc' && (
              <div>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Marka</p>
                    <p className="text-sm font-semibold text-[#1B2A4A]">{brand?.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">SKU</p>
                    <p className="text-sm font-semibold text-[#1B2A4A]">{selectedVariant?.sku}</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'nutrition' && product.nutrition.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 font-heading font-semibold text-[#1B2A4A]">Besin Değeri</th>
                      <th className="text-right py-2 font-heading font-semibold text-[#1B2A4A]">100g</th>
                      <th className="text-right py-2 font-heading font-semibold text-[#1B2A4A]">1 Servis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.nutrition.map((n, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-2 text-gray-600">{n.label}</td>
                        <td className="py-2 text-right text-gray-600">{n.per100g}</td>
                        <td className="py-2 text-right font-medium text-[#1B2A4A]">{n.perServing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="text-center py-8 text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="font-heading font-semibold">Henüz yorum yapılmamış</p>
                <p className="text-sm mt-1">Bu ürünü değerlendiren ilk kişi siz olun!</p>
              </div>
            )}
          </div>
        </div>

        {/* Authenticity Check */}
        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-heading font-bold text-lg text-[#1B2A4A] mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#FF6B35]" />
            Orijinallik Sorgulama
          </h3>
          <p className="text-sm text-gray-500 mb-3">Ürün üzerindeki kodu girerek orijinalliğini doğrulayın.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={authCode}
              onChange={e => setAuthCode(e.target.value)}
              placeholder="Ürün kodunu girin..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35]"
            />
            <button onClick={handleAuthCheck} className="px-6 py-2.5 bg-[#1B2A4A] text-white rounded-lg text-sm font-heading font-bold hover:bg-[#2a3d5c] transition-colors">
              Sorgula
            </button>
          </div>
          {authResult === 'checking' && <p className="text-sm text-gray-400 mt-2">Kontrol ediliyor...</p>}
          {authResult === 'success' && (
            <div className="flex items-center gap-2 mt-2 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Bu ürün orijinaldir.</span>
            </div>
          )}
          {authResult === 'fail' && (
            <div className="flex items-center gap-2 mt-2 text-red-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Kod doğrulanamadı. Lütfen tekrar deneyin.</span>
            </div>
          )}
        </div>

        {/* Cross-sell */}
        {crossSellProducts.length > 0 && (
          <div className="mt-8">
            <h3 className="font-heading font-bold text-xl text-[#1B2A4A] mb-4">Bununla İyi Gider</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {crossSellProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Same Brand Products */}
        {sameBrandProducts.length > 0 && (
          <div className="mt-8 mb-8">
            <h3 className="font-heading font-bold text-xl text-[#1B2A4A] mb-4">
              Aynı Marka: {brand?.name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sameBrandProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stock Alert Modal */}
      {product && (
        <StockAlertModal
          isOpen={stockAlertOpen}
          onClose={() => setStockAlertOpen(false)}
          productId={product.id}
          productName={product.name}
        />
      )}
    </div>
  );
}
