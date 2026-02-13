/*
 * CartPage - Athletic Precision Design
 * Tam sepet sayfası, kademeli hediye barı, hediye seçimi modülü, cross-sell
 */
import { useState } from 'react';
import { Link } from 'wouter';
import { Trash2, Plus, Minus, Gift, ShoppingBag, ChevronRight, Truck, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { campaigns, products, getBrandById } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';

const GIFT_OPTIONS = [
  { id: 'shaker', name: 'Shaker (700ml)', image: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?w=100&h=100&fit=crop' },
  { id: 'funnel', name: 'Taşınabilir Huni', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
  { id: 'sample', name: 'Tek Kullanımlık Whey', image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2c4d8?w=100&h=100&fit=crop' },
];

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const freeShippingThreshold = 300;
  const giftThreshold = 2000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);
  const showGiftSelection = totalPrice >= giftThreshold;

  // Tiered gift campaign
  const tieredCampaign = campaigns.find(c => c.type === 'tiered' && c.active);
  const tiers = tieredCampaign?.tiers || [];
  const maxThreshold = tiers.length > 0 ? tiers[tiers.length - 1].threshold : 5000;
  const progress = Math.min((totalPrice / maxThreshold) * 100, 100);
  const unlockedTiers = tiers.filter(t => t.threshold <= totalPrice);
  const nextTier = tiers.find(t => t.threshold > totalPrice);

  const crossSellProducts = products.filter(p => !items.some(i => i.product.id === p.id)).slice(0, 4);

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'DUR5') {
      setCouponApplied(true);
    }
  };

  const discountAmount = couponApplied ? Math.round(totalPrice * 0.05) : 0;
  const finalTotal = totalPrice - discountAmount;

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="w-20 h-20 mx-auto text-gray-200 mb-6" />
        <h1 className="font-heading font-bold text-2xl text-[#1B2A4A] mb-2">Sepetiniz Boş</h1>
        <p className="text-gray-500 mb-6">Hemen alışverişe başlayın ve en iyi sporcu gıdalarını keşfedin!</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors">
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B2A4A] font-medium">Sepetim</span>
          </nav>
        </div>
      </div>

      <div className="container py-6">
        <h1 className="font-heading font-bold text-2xl text-[#1B2A4A] mb-6">Sepetim ({items.length} Ürün)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Bar */}
            {remainingForFreeShipping > 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">
                    Ücretsiz kargoya <span className="text-[#FF6B35]">{remainingForFreeShipping.toLocaleString('tr-TR')} TL</span> kaldı!
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${Math.min((totalPrice / freeShippingThreshold) * 100, 100)}%` }} />
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Ücretsiz kargo kazandınız!</span>
              </div>
            )}

            {/* Tiered Gift Progress */}
            {tiers.length > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-[#FF6B35]" />
                  <span className="text-sm font-heading font-bold text-[#1B2A4A]">Kademeli Hediye Sistemi</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2 relative">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }}
                    className="bg-gradient-to-r from-[#FF6B35] to-orange-400 h-3 rounded-full" />
                  {tiers.map((tier, i) => (
                    <div key={i} className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ left: `${(tier.threshold / maxThreshold) * 100}%`, transform: 'translate(-50%, -50%)', backgroundColor: totalPrice >= tier.threshold ? '#FF6B35' : '#d1d5db' }}>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-2">
                  {tiers.map((tier, i) => (
                    <span key={i} className={totalPrice >= tier.threshold ? 'text-[#FF6B35] font-bold' : ''}>{tier.threshold.toLocaleString('tr-TR')} TL</span>
                  ))}
                </div>
                {unlockedTiers.length > 0 && (
                  <p className="text-xs text-green-600 font-medium">Kazandığınız hediyeler: {unlockedTiers.map(t => t.reward).join(', ')}</p>
                )}
                {nextTier && (
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-bold text-[#FF6B35]">{(nextTier.threshold - totalPrice).toLocaleString('tr-TR')} TL</span> daha ekleyin → {nextTier.reward}
                  </p>
                )}
              </div>
            )}

            {/* Cart Items */}
            {items.map(item => {
              const brand = getBrandById(item.product.brandId);
              return (
                <div key={item.variant.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4">
                  <Link href={`/urun/${item.product.slug}`}>
                    <img src={item.product.image} alt={item.product.name} className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    {brand && <span className="text-[10px] text-[#FF6B35] font-semibold uppercase">{brand.name}</span>}
                    <Link href={`/urun/${item.product.slug}`}>
                      <h3 className="font-heading font-semibold text-sm text-[#1B2A4A] hover:text-[#FF6B35] transition-colors">{item.product.name}</h3>
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{item.variant.flavor} - {item.variant.weight}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                        <button onClick={() => updateQuantity(item.variant.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-50"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.variant.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="text-right">
                        {item.variant.oldPrice && <span className="text-xs text-gray-400 line-through block">{(item.variant.oldPrice * item.quantity).toLocaleString('tr-TR')} TL</span>}
                        <span className="font-heading font-bold text-[#1B2A4A]">{(item.variant.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.variant.id)} className="self-start p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {/* Gift Selection */}
            {showGiftSelection && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-green-600" />
                  <span className="font-heading font-bold text-sm text-green-800">Tebrikler! Hediyenizi Seçin</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {GIFT_OPTIONS.map(gift => (
                    <button key={gift.id} onClick={() => setSelectedGift(gift.id)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        selectedGift === gift.id ? 'border-green-500 bg-green-100' : 'border-gray-200 bg-white hover:border-green-300'
                      }`}>
                      <img src={gift.image} alt={gift.name} className="w-12 h-12 rounded mx-auto mb-1 object-cover" />
                      <span className="text-xs font-medium text-gray-700">{gift.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-36 space-y-4">
              <h2 className="font-heading font-bold text-lg text-[#1B2A4A]">Sipariş Özeti</h2>

              {/* Coupon */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">İndirim Kodu</label>
                <div className="flex gap-2">
                  <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                    placeholder="Kod girin" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" disabled={couponApplied} />
                  <button onClick={handleApplyCoupon} disabled={couponApplied}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${couponApplied ? 'bg-green-100 text-green-700' : 'bg-[#1B2A4A] text-white hover:bg-[#2a3d5c]'}`}>
                    {couponApplied ? '✓' : 'Uygula'}
                  </button>
                </div>
                {couponApplied && <p className="text-xs text-green-600 mt-1 font-medium">DUR5 kodu uygulandı! %5 indirim</p>}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ara Toplam</span>
                  <span className="font-medium">{totalPrice.toLocaleString('tr-TR')} TL</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim (DUR5)</span>
                    <span>-{discountAmount.toLocaleString('tr-TR')} TL</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Kargo</span>
                  <span className={totalPrice >= freeShippingThreshold ? 'text-green-600 font-medium' : 'font-medium'}>
                    {totalPrice >= freeShippingThreshold ? 'Ücretsiz' : '29,90 TL'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-heading font-bold text-lg text-[#1B2A4A]">Toplam</span>
                <span className="font-heading font-bold text-2xl text-[#FF6B35]">{finalTotal.toLocaleString('tr-TR')} TL</span>
              </div>

              <Link href="/odeme" className="block w-full text-center py-3.5 bg-[#FF6B35] text-white rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors">
                Ödemeye Geç
              </Link>
              <Link href="/" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-[#FF6B35] transition-colors">
                <ArrowLeft className="w-4 h-4" /> Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>

        {/* Cross-sell */}
        {crossSellProducts.length > 0 && (
          <section className="mt-10 pt-8 border-t border-gray-100">
            <h2 className="font-heading font-bold text-xl text-[#1B2A4A] mb-6">Bununla İyi Gider</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {crossSellProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
