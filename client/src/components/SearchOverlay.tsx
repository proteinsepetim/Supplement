import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Search, X } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { searchProducts, getBrandById } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchOverlay() {
  const { isSearchOpen, setIsSearchOpen } = useSearch();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const results = query.length >= 2 ? searchProducts(query) : [];

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsSearchOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setIsSearchOpen]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-20 px-4">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Ürün, marka veya kategori ara..." className="flex-1 text-lg outline-none placeholder:text-gray-300" />
              <button onClick={() => setIsSearchOpen(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            {query.length >= 2 && (
              <div className="max-h-[60vh] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <p className="font-heading font-semibold">Sonuç bulunamadı</p>
                    <p className="text-sm mt-1">Farklı bir arama terimi deneyin</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {results.map(product => (
                      <Link key={product.id} href={`/urun/${product.slug}`} onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">{getBrandById(product.brandId)?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#FF6B35]">{product.variants[0].price.toLocaleString('tr-TR')} TL</p>
                          {product.variants[0].oldPrice && (
                            <p className="text-xs text-gray-400 line-through">{product.variants[0].oldPrice.toLocaleString('tr-TR')} TL</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            {query.length < 2 && (
              <div className="p-6 text-center text-gray-400 text-sm">
                En az 2 karakter yazarak aramaya başlayın
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
