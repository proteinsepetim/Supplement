/*
 * Footer - Athletic Precision Design
 * Gelişmiş footer: ödeme yöntemleri (demo etiketi), sosyal medya, güvenlik rozetleri
 * Legal sayfalar gerçek route'lara bağlı
 */
import { Link } from 'wouter';
import { Phone, Mail, MapPin, Shield, Lock, CreditCard, Truck, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { categories, brands } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="bg-[#1B2A4A] text-white">
      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-[#FF6B35] font-heading font-black text-lg">P</span>
              </div>
              <span className="font-heading font-bold text-lg">Protein<span className="text-[#FF6B35]">Market</span></span>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">Sporcu gıdaları ve takviye ürünleri mağazası. Orijinal ürün garantisi ile hizmetinizdeyiz.</p>
            <div className="space-y-2.5 text-sm text-gray-300">
              <a href="tel:+905001234567" className="flex items-center gap-2.5 hover:text-[#FF6B35] transition-colors"><Phone className="w-4 h-4 text-[#FF6B35]" /> 0500 123 45 67</a>
              <a href="mailto:info@proteinmarket.com" className="flex items-center gap-2.5 hover:text-[#FF6B35] transition-colors"><Mail className="w-4 h-4 text-[#FF6B35]" /> info@proteinmarket.com</a>
              <span className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-[#FF6B35]" /> İstanbul, Türkiye</span>
            </div>
            {/* Social Media */}
            <div className="flex items-center gap-2 mt-5">
              {[
                { icon: Instagram, label: 'Instagram', href: '#' },
                { icon: Facebook, label: 'Facebook', href: '#' },
                { icon: Twitter, label: 'Twitter', href: '#' },
                { icon: Youtube, label: 'Youtube', href: '#' },
              ].map((social, i) => (
                <a key={i} href={social.href} aria-label={social.label}
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#FF6B35] transition-colors group">
                  <social.icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-[#FF6B35]">Kategoriler</h3>
            <ul className="space-y-2.5">
              {categories.slice(0, 8).map(cat => (
                <li key={cat.id}>
                  <Link href={`/kategori/${cat.slug}`} className="text-sm text-gray-300 hover:text-[#FF6B35] transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-[#FF6B35]">Popüler Markalar</h3>
            <ul className="space-y-2.5">
              {brands.filter(b => b.featured).map(brand => (
                <li key={brand.id}>
                  <Link href={`/marka/${brand.slug}`} className="text-sm text-gray-300 hover:text-[#FF6B35] transition-colors">{brand.name}</Link>
                </li>
              ))}
              <li><Link href="/markalar" className="text-sm text-[#FF6B35] font-semibold hover:text-white transition-colors">Tüm Markalar &rarr;</Link></li>
            </ul>
          </div>

          {/* Info - Legal sayfalar gerçek route'lara bağlı */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-[#FF6B35]">Bilgi & Yardım</h3>
            <ul className="space-y-2.5">
              <li><Link href="/sayfa/hakkimizda" className="text-sm text-gray-300 hover:text-[#FF6B35] transition-colors">Hakkımızda</Link></li>
              <li><Link href="/sayfa/iletisim" className="text-sm text-gray-300 hover:text-[#FF6B35] transition-colors">İletişim</Link></li>
              <li><Link href="/sayfa/kargo-teslimat" className="text-sm text-gray-300 hover:text-[#FF6B35] transition-colors">Kargo ve Teslimat</Link></li>
              <li><Link href="/sayfa/iade-degisim" className="text-sm text-gray-300 hover:text-[#FF6B35] transition-colors">İade ve Değişim</Link></li>
              <li><Link href="/sayfa/gizlilik-politikasi" className="text-sm text-gray-300 hover:text-[#FF6B35] transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/sayfa/kvkk" className="text-sm text-gray-300 hover:text-[#FF6B35] transition-colors">KVKK Aydınlatma Metni</Link></li>
              <li><Link href="/sayfa/mesafeli-satis" className="text-sm text-gray-300 hover:text-[#FF6B35] transition-colors">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="/sayfa/sss" className="text-sm text-gray-300 hover:text-[#FF6B35] transition-colors">Sıkça Sorulan Sorular</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trust & Payment Section */}
      <div className="border-t border-white/10">
        <div className="container py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Payment Methods */}
            <div>
              <p className="text-xs text-gray-400 mb-3 font-heading font-semibold uppercase tracking-wider">Ödeme Yöntemleri</p>
              <div className="flex items-center gap-3 flex-wrap">
                {['Visa', 'Mastercard', 'Troy'].map(method => (
                  <div key={method} className="bg-white/10 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-300 font-medium">{method}</span>
                  </div>
                ))}
                <div className="bg-white/10 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-300 font-medium">Havale/EFT</span>
                </div>
              </div>
            </div>

            {/* Security Badges */}
            <div className="md:text-right">
              <p className="text-xs text-gray-400 mb-3 font-heading font-semibold uppercase tracking-wider">Güvenlik</p>
              <div className="flex items-center gap-3 md:justify-end flex-wrap">
                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                  <Lock className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs text-gray-300 font-medium">256-bit SSL</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-gray-300 font-medium">3D Secure</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span className="text-xs text-gray-300 font-medium">Sigortalı Kargo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="border-t border-white/10">
        <div className="container py-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-[10px] leading-relaxed text-gray-400">
              <strong className="text-gray-300">Yasal Uyarı:</strong> Bu sitede yer alan ürünler gıda takviyesidir ve herhangi bir hastalığı teşhis, tedavi veya önleme amacı taşımaz. Ürün açıklamaları üretici bilgilerine dayanmaktadır ve Sağlık Bakanlığı tarafından değerlendirilmemiştir. Herhangi bir takviye kullanmadan önce sağlık uzmanınıza danışmanızı öneririz. Hamilelik, emzirme döneminde veya kronik bir rahatsızlığınız varsa mutlaka doktorunuza başvurun. Ürünlerin etkileri kişiden kişiye farklılık gösterebilir.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} ProteinMarket. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/sayfa/gizlilik-politikasi" className="hover:text-[#FF6B35] transition-colors">Gizlilik Politikası</Link>
            <span>|</span>
            <Link href="/sayfa/mesafeli-satis" className="hover:text-[#FF6B35] transition-colors">Kullanım Koşulları</Link>
            <span>|</span>
            <Link href="/sayfa/kvkk" className="hover:text-[#FF6B35] transition-colors">KVKK</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
