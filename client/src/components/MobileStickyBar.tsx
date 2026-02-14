/*
 * MobileStickyBar - Mobil cihazlarda sabit alt bar
 * Ürün detay sayfasında: Sepete Ekle butonu + fiyat
 * Sepet sayfasında: Ödemeye Geç butonu + toplam
 * Min 44px dokunma alanı, safe-area desteği
 */
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'wouter';

interface MobileStickyBarProps {
  mode: 'product' | 'cart';
  price?: number;
  onAddToCart?: () => void;
  disabled?: boolean;
  label?: string;
}

export default function MobileStickyBar({ mode, price, onAddToCart, disabled, label }: MobileStickyBarProps) {
  const { totalPrice, totalItems } = useCart();

  if (mode === 'product') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-40 lg:hidden safe-area-bottom">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1">
            {price !== undefined && (
              <span className="font-heading font-black text-xl text-[#1B2A4A]">
                {price.toLocaleString('tr-TR')} TL
              </span>
            )}
          </div>
          <button
            onClick={onAddToCart}
            disabled={disabled}
            className="flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-xl font-heading font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 min-h-[44px] min-w-[44px]"
          >
            <ShoppingCart className="w-5 h-5" />
            {label || 'Sepete Ekle'}
          </button>
        </div>
      </div>
    );
  }

  // Cart mode
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-40 lg:hidden safe-area-bottom">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1">
          <p className="text-xs text-gray-400">{totalItems} ürün</p>
          <span className="font-heading font-black text-xl text-[#FF6B35]">
            {totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </span>
        </div>
        <Link
          href="/odeme"
          className="flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-xl font-heading font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 min-h-[44px] min-w-[44px]"
        >
          Ödemeye Geç <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
