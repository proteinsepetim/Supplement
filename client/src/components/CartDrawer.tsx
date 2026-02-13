/*
 * CartDrawer - Sağdan açılan mini sepet
 * Kademeli hediye barı, cross-sell önerileri
 */
import { X, Plus, Minus, Trash2, Gift, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { campaigns, products, getBrandById } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';

function TieredGiftBar({ total }: { total: number }) {
  const tieredCampaign = campaigns.find(c => c.type === 'tiered' && c.active);
  if (!tieredCampaign?.tiers) return null;
  const tiers = tieredCampaign.tiers;
  const maxThreshold = tiers[tiers.length - 1].threshold;
  const progress = Math.min((total / maxThreshold) * 100, 100);
  const nextTier = tiers.find(t => t.threshold > total);
  const unlockedTiers = tiers.filter(t => t.threshold <= total);

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-100">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-4 h-4 text-[#FF6B35]" />
        <span className="text-xs font-semibold text-[#1B2A4A]">Kademeli Hediye Sistemi</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2 relative">
        <div className="bg-gradient-to-r from-[#FF6B35] to-orange-400 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        {tiers.map((tier, i) => (
          <div key={i} className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white"
            style={{ left: `${(tier.threshold / maxThreshold) * 100}%`, transform: 'translate(-50%, -50%)', backgroundColor: total >= tier.threshold ? '#FF6B35' : '#d1d5db' }} />
        ))}
      </div>
      {unlockedTiers.length > 0 && (
        <div className="text-[10px] text-green-600 font-medium mb-1">
          Kazandınız: {unlockedTiers.map(t => t.reward).join(', ')}
        </div>
      )}
      {nextTier && (
        <p className="text-[11px] text-gray-600">
          <span className="font-bold text-[#FF6B35]">{(nextTier.threshold - total).toLocaleString('tr-TR')} TL</span> daha ekleyin → {nextTier.reward}
        </p>
      )}
    </div>
  );
}

function CrossSellSection() {
  const { items, addItem } = useCart();
  const cartCategories = items.map(i => i.product.category);
  const suggestions = products
    .filter(p => !cartCategories.includes(p.category) && !items.some(i => i.product.id === p.id))
    .slice(0, 2);

  if (suggestions.length === 0 || items.length === 0) return null;

  return (
    <div className="border-t border-gray-100 pt-3 mt-3">
      <p className="text-xs font-semibold text-[#1B2A4A] mb-2">Birlikte alın, daha çok kazanın!</p>
      {suggestions.map(product => {
        const defaultVariant = product.variants.find(v => v.stock > 0) || product.variants[0];
        const brand = getBrandById(product.brandId);
        return (
          <div key={product.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#1B2A4A] truncate">{product.name}</p>
              <p className="text-[10px] text-gray-400">{brand?.name}</p>
            </div>
            <button
              onClick={() => addItem(product, defaultVariant)}
              className="text-[10px] bg-[#FF6B35] text-white px-2 py-1 rounded font-bold hover:bg-orange-600 transition-colors shrink-0"
            >
              + Ekle
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[61] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#FF6B35]" />
                <h2 className="font-heading font-bold text-lg text-[#1B2A4A]">Sepetim ({totalItems})</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="font-heading font-semibold text-gray-400">Sepetiniz boş</p>
                  <p className="text-sm text-gray-300 mt-1">Hemen alışverişe başlayın!</p>
                </div>
              ) : (
                <>
                  <TieredGiftBar total={totalPrice} />
                  <div className="mt-3 space-y-3">
                    {items.map(item => {
                      const brand = getBrandById(item.product.brandId);
                      return (
                        <div key={item.variant.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                          <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#FF6B35] font-medium">{brand?.name}</p>
                            <p className="text-sm font-heading font-semibold text-[#1B2A4A] truncate">{item.product.name}</p>
                            <p className="text-[10px] text-gray-400">{item.variant.flavor} - {item.variant.weight}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center border border-gray-200 rounded bg-white">
                                <button onClick={() => updateQuantity(item.variant.id, item.quantity - 1)} className="p-1">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.variant.id, item.quantity + 1)} className="p-1">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-sm font-heading font-bold text-[#1B2A4A]">
                                {(item.variant.price * item.quantity).toLocaleString('tr-TR')} TL
                              </span>
                            </div>
                          </div>
                          <button onClick={() => removeItem(item.variant.id)} className="p-1 text-gray-300 hover:text-red-500 self-start">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <CrossSellSection />
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-[#1B2A4A]">Toplam</span>
                  <span className="font-heading font-black text-xl text-[#FF6B35]">{totalPrice.toLocaleString('tr-TR')} TL</span>
                </div>
                <Link
                  href="/sepet"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full text-center bg-[#1B2A4A] text-white py-3 rounded-lg font-heading font-bold text-sm hover:bg-[#2a3d5c] transition-colors"
                >
                  Sepete Git
                </Link>
                <Link
                  href="/odeme"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full text-center bg-[#FF6B35] text-white py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                >
                  Ödemeye Geç
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
