/*
 * Header - Athletic Precision Design
 * Top bar, logo, mega menü, arama, bildirim, favori, hesap, sepet
 * Mobil hamburger menü
 */
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { categories } from '@/lib/data';
import { useCart } from '@/contexts/CartContext';
import { useSearch } from '@/contexts/SearchContext';
import NotificationDropdown from './NotificationDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Header() {
  const [location] = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const { setIsSearchOpen } = useSearch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(null);
  }, [location]);

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      {/* Top Bar */}
      <div className="bg-[#1B2A4A] text-white text-xs py-1.5 hidden md:block">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>%100 Orijinal Ürün Garantisi</span>
            <span className="text-gray-400">|</span>
            <span>Aynı Gün Kargo</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Güvenli Ödeme</span>
            <span className="text-gray-400">|</span>
            <span>300 TL Üzeri Ücretsiz Kargo</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-[#FF6B35] rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-black text-lg">P</span>
            </div>
            <span className="font-heading font-bold text-lg text-[#1B2A4A] hidden sm:block">
              Protein<span className="text-[#FF6B35]">Market</span>
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex flex-1 max-w-xl items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:border-[#FF6B35] transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Ürün, marka veya kategori ara...</span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setIsSearchOpen(true)} className="md:hidden p-2 hover:bg-gray-50 rounded-lg">
              <Search className="w-5 h-5 text-[#1B2A4A]" />
            </button>
            <NotificationDropdown />
            <Link href="/favoriler" className="p-2 hover:bg-gray-50 rounded-lg relative">
              <Heart className="w-5 h-5 text-[#1B2A4A]" />
            </Link>
            <button onClick={() => toast('Giriş sistemi yakında aktif olacak!')} className="p-2 hover:bg-gray-50 rounded-lg hidden sm:block">
              <User className="w-5 h-5 text-[#1B2A4A]" />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="p-2 hover:bg-gray-50 rounded-lg relative">
              <ShoppingCart className="w-5 h-5 text-[#1B2A4A]" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#FF6B35] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 hover:bg-gray-50 rounded-lg">
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#1B2A4A]" /> : <Menu className="w-5 h-5 text-[#1B2A4A]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation (Desktop) */}
      <nav className="hidden lg:block border-t border-gray-100">
        <div className="container">
          <div className="flex items-center gap-0">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(cat.id)}
                onMouseLeave={() => setMegaMenuOpen(null)}
              >
                <Link
                  href={`/kategori/${cat.slug}`}
                  className={`flex items-center gap-1 px-3 py-3 text-sm font-heading font-semibold transition-colors whitespace-nowrap ${
                    location.includes(cat.slug) ? 'text-[#FF6B35]' : 'text-[#1B2A4A] hover:text-[#FF6B35]'
                  }`}
                >
                  {cat.name}
                  {cat.subcategories.length > 0 && <ChevronDown className="w-3 h-3" />}
                </Link>

                {/* Mega Menu Dropdown */}
                <AnimatePresence>
                  {megaMenuOpen === cat.id && cat.subcategories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 bg-white border border-gray-100 rounded-lg shadow-xl py-2 min-w-[200px] z-50"
                    >
                      {cat.subcategories.map(sub => (
                        <Link
                          key={sub.id}
                          href={`/kategori/${cat.slug}/${sub.slug}`}
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-[#FF6B35] hover:bg-orange-50 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <Link href="/markalar" className="px-3 py-3 text-sm font-heading font-semibold text-[#1B2A4A] hover:text-[#FF6B35] transition-colors whitespace-nowrap">
              Markalar
            </Link>
            <Link href="/supplement-sihirbazi" className="px-3 py-3 text-sm font-heading font-semibold text-[#FF6B35] hover:text-orange-600 transition-colors whitespace-nowrap">
              Supplement Sihirbazı
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="container py-4 space-y-1 max-h-[70vh] overflow-y-auto">
              <div className="flex gap-2 mb-3">
                <button onClick={() => { setMobileMenuOpen(false); toast('Giriş sistemi yakında aktif olacak!'); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 rounded-lg text-sm font-medium text-[#1B2A4A]">
                  <User className="w-4 h-4 text-[#FF6B35]" />
                  Hesabım
                </button>
              </div>

              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 text-[#1B2A4A] font-heading font-semibold rounded-lg hover:bg-gray-50">Anasayfa</Link>
              {categories.map(cat => (
                <div key={cat.id}>
                  <Link href={`/kategori/${cat.slug}`} onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 text-[#1B2A4A] font-heading font-semibold rounded-lg hover:bg-gray-50">
                    {cat.name}
                  </Link>
                  <div className="ml-8 space-y-0.5">
                    {cat.subcategories.map(sub => (
                      <Link key={sub.id} href={`/kategori/${cat.slug}/${sub.slug}`} onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-sm text-gray-500 hover:text-[#FF6B35] rounded">
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <Link href="/markalar" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 text-[#1B2A4A] font-heading font-semibold rounded-lg hover:bg-gray-50">Markalar</Link>
                <Link href="/supplement-sihirbazi" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 text-[#1B2A4A] font-heading font-semibold rounded-lg hover:bg-gray-50">Supplement Sihirbazı</Link>
                <Link href="/karsilastir" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 text-[#1B2A4A] font-heading font-semibold rounded-lg hover:bg-gray-50">Karşılaştır</Link>
                <Link href="/paket-olustur" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 text-[#FF6B35] font-heading font-semibold rounded-lg hover:bg-gray-50">Paket Oluştur</Link>
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 text-gray-500 font-heading font-semibold rounded-lg hover:bg-gray-50">Yönetim Paneli</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
