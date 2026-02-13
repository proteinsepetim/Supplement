/*
 * Home Page - Athletic Precision Design
 * Hero slider, kategoriler, bestseller, supplement sihirbazı CTA, kampanya banner
 * Newsletter, sosyal kanıt, müşteri yorumları bölümleri eklendi
 */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { ChevronRight, Clock, Truck, Shield, Award, Zap, ArrowRight, Dumbbell, Flame, TrendingUp, Pill, Cookie, Shirt, Gift, Tag, Percent, Star, Users, Package, Mail, CheckCircle } from 'lucide-react';
import { products, categories, brands, campaigns } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const HERO_BANNER_1 = 'https://private-us-east-1.manuscdn.com/sessionFile/Ap796PH8GtTpKpQgjkfMDs/sandbox/f7hlQElW7PWg8tRhOWLqvM-img-1_1770600194000_na1fn_aGVyby1iYW5uZXItMQ.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQXA3OTZQSDhHdFRwS3BRZ2prZk1Ecy9zYW5kYm94L2Y3aGxRRWxXN1BXZzh0UmhPV0xxdk0taW1nLTFfMTc3MDYwMDE5NDAwMF9uYTFmbl9hR1Z5YnkxaVlXNXVaWEl0TVEuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=czn5qLPOJlRhGCSRp8Rm49JLqNq5OnL5mjLaJYSAKmG~woE1JvZGpY9n0TWK2DaYY7jrHAG5KHYTqEWyKDhTHEzF6dQ7ZYyReKSLzDMJhIAyM1iH6E4PVhIZiKj7DH2GpkMVPm5GWkFTa2yWKCfsgFrJ7icIAtu7ySf9CaF3l8tbpYqddtNBzlRkEUOuvVOGLxSFCCYxo1ZhY6sgJ6PTTC9lP7~RDKwjtnk9D9cpNRcC-a3BYTBfuuJwY2ciBLYezseWQtfRO9gkmTCwb8BenuCN3PQBMnoyFWx6cAJBt1f3VCa2dXZK~-M-UrTPrP7vXvdYs-jt8o4wDh5uagtqKw__';
const HERO_BANNER_2 = 'https://private-us-east-1.manuscdn.com/sessionFile/Ap796PH8GtTpKpQgjkfMDs/sandbox/f7hlQElW7PWg8tRhOWLqvM-img-2_1770600203000_na1fn_aGVyby1iYW5uZXItMg.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQXA3OTZQSDhHdFRwS3BRZ2prZk1Ecy9zYW5kYm94L2Y3aGxRRWxXN1BXZzh0UmhPV0xxdk0taW1nLTJfMTc3MDYwMDIwMzAwMF9uYTFmbl9hR1Z5YnkxaVlXNXVaWEl0TWcuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ngdsA7THoz-wMOQjf4IvZsjTsyIZc91qooXtlSxREkT1GuSxOYuuVLlqndoBduDxo-E~0~0IFVzF7H-CVEAbY9Q7coLAhzTILkihKkhx9w389TTlIxhEHsD0vTKthlpIYXCCEO6s7K18QPjXTD~p~hwv~owpGxqUFV4S8fq7NqbENQERnPz6TJVaZ3OlYG-moQjW0zMaypwqEzXulwXQygkCqBWNpzt6UXxsp2nQlINeZ3trl8gMBzsg9y87fzFb6f8TOPzNVYQ8f4Mn0-kpkIYgJ9~yKAe7OZvPyHyR6p1fFg9WZdMceoULQ65aSJ6335f8j0DAIOwpzNcSdvE~PQ__';
const PROMO_BANNER = 'https://private-us-east-1.manuscdn.com/sessionFile/Ap796PH8GtTpKpQgjkfMDs/sandbox/f7hlQElW7PWg8tRhOWLqvM-img-3_1770600198000_na1fn_cHJvbW8tYmFubmVy.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQXA3OTZQSDhHdFRwS3BRZ2prZk1Ecy9zYW5kYm94L2Y3aGxRRWxXN1BXZzh0UmhPV0xxdk0taW1nLTNfMTc3MDYwMDE5ODAwMF9uYTFmbl9jSEp2Ylc4dFltRnVibVZ5LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Mk6wOAEB9gWfToLEJyLMhgskJMuqao2ha0o9S4cEcQbclkPpamTqqvcJzlvv611nnuRNtkzFuvYEI87PsLa1qDv2QKJtuA83HdOl8VkkjqeDWxiU0AKwiyJg8uTWLSWqWZQdP~sFQyKNvMdmuLMc9nlTQuJ-WvUDSD2RX2ITSEtRnLB1-cnbeBrDmFevD~5-nuk2CZh8LXS27c3GvXltInM7JHI3rYrs3gqlSx9a9U5wSYN~0GOOyRca-fHotFbddf-9vBThK1NPFw5OGIXc~zaWQpeKK-ZTKW7t501pS5YcciblTGhw6-ZPYNIaE2LsN-GXViwmO-9T1WzcdE64SA__';

// Lucide icon mapping for categories
const categoryIcons: Record<string, React.ElementType> = {
  'Dumbbell': Dumbbell,
  'Zap': Zap,
  'Flame': Flame,
  'TrendingUp': TrendingUp,
  'Bolt': Zap,
  'Pill': Pill,
  'Cookie': Cookie,
  'Shirt': Shirt,
};

// Campaign icon mapping
const campaignIcons: Record<string, React.ElementType> = {
  'bogo': Gift,
  'percentage': Percent,
  'gift': Gift,
  'freeShipping': Truck,
  'tiered': Tag,
};

// Müşteri yorumları
const testimonials = [
  { name: 'Ahmet K.', avatar: 'A', rating: 5, text: 'Ürünler orijinal ve kargo çok hızlı. 2 yıldır buradan alışveriş yapıyorum, hiç sorun yaşamadım.', product: 'Whey Protein 2000gr' },
  { name: 'Elif D.', avatar: 'E', rating: 5, text: 'Supplement Sihirbazı özelliği harika! Bana tam ihtiyacım olan ürünleri önerdi. Teşekkürler!', product: 'BCAA 4:1:1' },
  { name: 'Murat Y.', avatar: 'M', rating: 5, text: 'Fiyatlar piyasanın altında ve kampanyalar çok avantajlı. Paket oluştur özelliği de süper.', product: 'Kreatin Monohidrat' },
  { name: 'Zeynep A.', avatar: 'Z', rating: 4, text: 'Besin değerleri tablosu ve skor kartı sayesinde ürünleri karşılaştırmak çok kolay.', product: 'İzole Protein' },
];

function ShippingCountdown() {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(16, 0, 0, 0);
      if (now > cutoff) cutoff.setDate(cutoff.getDate() + 1);
      const diff = cutoff.getTime() - now.getTime();
      setTime({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2a3d5c] text-white py-2">
      <div className="container flex items-center justify-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-[#FF6B35]" />
        <span className="font-heading font-semibold">
          <span className="text-[#FF6B35] font-bold">{String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}</span>
          {' '}içinde sipariş ver, <span className="text-[#FF6B35]">BUGÜN KARGODA!</span>
        </span>
      </div>
    </div>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      toast.success('Bültenimize başarıyla kayıt oldunuz!');
    }
  };

  return (
    <section className="py-12 bg-gradient-to-br from-[#1B2A4A] via-[#1f3158] to-[#2a3d5c] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF6B35] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF6B35] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 bg-[#FF6B35]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-[#FF6B35]" />
          </div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-2">Fırsatları Kaçırma!</h2>
          <p className="text-gray-300 text-sm mb-6">E-bültenimize abone ol, özel indirimlerden ve yeni ürünlerden ilk sen haberdar ol. İlk alışverişinde <span className="text-[#FF6B35] font-bold">%10 indirim</span> hediye!</p>
          {submitted ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-heading font-semibold">Kayıt başarılı! İndirim kodunuz e-postanıza gönderildi.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
                required
              />
              <button type="submit" className="px-6 py-3 bg-[#FF6B35] text-white rounded-xl font-heading font-bold text-sm hover:bg-orange-600 transition-colors whitespace-nowrap shadow-lg shadow-orange-500/20">
                Abone Ol
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSlides = useMemo(() => [
    { image: HERO_BANNER_1, title: 'Premium Sporcu Gıdaları', subtitle: 'Orijinal ürün garantisi ile Türkiye\'nin en güvenilir sporcu gıdaları mağazası', cta: 'Alışverişe Başla', link: '/kategori/protein-tozu' },
    { image: HERO_BANNER_2, title: 'Hedefine Ulaş', subtitle: 'Profesyonel formüller, bilimsel destekli takviyeler ile performansını zirveye taşı', cta: 'Ürünleri Keşfet', link: '/kategori/performans-guc' },
  ], []);

  useEffect(() => {
    const interval = setInterval(() => setHeroIndex(i => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const bestsellers = products.filter(p => p.isBestseller);
  const newProducts = products.filter(p => p.isNew);
  const featuredBrands = brands.filter(b => b.featured);

  return (
    <div>
      <ShippingCountdown />

      {/* Hero Section */}
      <section className="relative h-[420px] md:h-[500px] overflow-hidden">
        {heroSlides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`}>
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A]/80 via-[#1B2A4A]/50 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: i === heroIndex ? 1 : 0, x: i === heroIndex ? 0 : -30 }} transition={{ duration: 0.6 }}
                  className="max-w-lg">
                  <h1 className="font-heading font-black text-3xl md:text-5xl text-white leading-tight">{slide.title}</h1>
                  <p className="text-gray-200 mt-3 text-sm md:text-base leading-relaxed">{slide.subtitle}</p>
                  <div className="flex gap-3 mt-6">
                    <Link href={slide.link} className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/25">
                      {slide.cta} <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/supplement-sihirbazi" className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-heading font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20">
                      Hedefini Seç
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        ))}
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === heroIndex ? 'bg-[#FF6B35] w-8' : 'bg-white/50'}`} />
          ))}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-gray-100 py-4 hidden md:block">
        <div className="container grid grid-cols-4 gap-4">
          {[
            { icon: Shield, label: '%100 Orijinal', desc: 'Tüm ürünler orijinaldir' },
            { icon: Truck, label: 'Hızlı Kargo', desc: 'Aynı gün kargo imkanı' },
            { icon: Award, label: 'Kalite Garantisi', desc: 'Memnuniyet garantisi' },
            { icon: Zap, label: '7/24 Destek', desc: 'WhatsApp ile ulaşın' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <div>
                <p className="font-heading font-semibold text-sm text-[#1B2A4A]">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories with Lucide Icons */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <h2 className="font-heading font-bold text-xl md:text-2xl text-[#1B2A4A] mb-6">Kategoriler</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {categories.map(cat => {
              const IconComponent = categoryIcons[cat.icon] || Dumbbell;
              return (
                <Link key={cat.id} href={`/kategori/${cat.slug}`}
                  className="bg-white rounded-xl p-4 text-center hover:shadow-md hover:border-[#FF6B35] border border-transparent transition-all group">
                  <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-[#FF6B35]/10 to-[#FF6B35]/5 rounded-xl flex items-center justify-center group-hover:from-[#FF6B35]/20 group-hover:to-[#FF6B35]/10 transition-all">
                    <IconComponent className="w-5 h-5 text-[#FF6B35] group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-heading font-semibold text-[#1B2A4A] group-hover:text-[#FF6B35] transition-colors leading-tight block">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-10">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl md:text-2xl text-[#1B2A4A]">Çok Satanlar</h2>
              <p className="text-xs text-gray-400 mt-0.5">En popüler ürünlerimiz</p>
            </div>
            <Link href="/kategori/protein-tozu" className="text-sm text-[#FF6B35] font-semibold flex items-center gap-1 hover:underline">
              Tümünü Gör <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {bestsellers.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner - Supplement Sihirbazı */}
      <section className="relative overflow-hidden">
        <img src={PROMO_BANNER} alt="Supplement Sihirbazı" className="w-full h-[200px] md:h-[280px] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A]/90 to-transparent flex items-center">
          <div className="container">
            <div className="max-w-md">
              <h2 className="font-heading font-black text-2xl md:text-3xl text-white">Supplement Sihirbazı</h2>
              <p className="text-gray-200 text-sm mt-2">3 soruda sana özel supplement paketi oluşturalım. Hedefine en uygun ürünleri bul!</p>
              <Link href="/supplement-sihirbazi" className="inline-flex items-center gap-2 mt-4 bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25">
                Hemen Başla <Zap className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="py-10 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl md:text-2xl text-[#1B2A4A]">Yeni Ürünler</h2>
              <p className="text-xs text-gray-400 mt-0.5">Son eklenen ürünler</p>
            </div>
            <Link href="/kategori/amino-asit" className="text-sm text-[#FF6B35] font-semibold flex items-center gap-1 hover:underline">
              Tümünü Gör <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {newProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-10 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, value: '50.000+', label: 'Mutlu Müşteri', color: 'from-blue-500/10 to-blue-500/5' },
              { icon: Package, value: '120.000+', label: 'Teslim Edilen Sipariş', color: 'from-green-500/10 to-green-500/5' },
              { icon: Star, value: '4.8/5', label: 'Müşteri Puanı', color: 'from-amber-500/10 to-amber-500/5' },
              { icon: Shield, value: '%100', label: 'Orijinal Ürün', color: 'from-[#FF6B35]/10 to-[#FF6B35]/5' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-7 h-7 text-[#1B2A4A]" />
                </div>
                <p className="font-heading font-black text-2xl md:text-3xl text-[#1B2A4A]">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campaigns */}
      <section className="py-10 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl md:text-2xl text-[#1B2A4A]">Aktif Kampanyalar</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fırsatları kaçırma!</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {campaigns.filter(c => c.active).slice(0, 4).map((campaign, i) => {
              const CampaignIcon = campaignIcons[campaign.type] || Zap;
              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-[#1B2A4A] to-[#2a3d5c] rounded-xl p-5 text-white hover:shadow-xl transition-all hover:-translate-y-1 duration-300 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-[#FF6B35]/20 rounded-lg flex items-center justify-center mb-3">
                    <CampaignIcon className="w-5 h-5 text-[#FF6B35]" />
                  </div>
                  <h3 className="font-heading font-bold text-lg">{campaign.title}</h3>
                  <p className="text-gray-300 text-sm mt-1 leading-relaxed">{campaign.description}</p>
                  {campaign.code && (
                    <div className="mt-3 bg-white/10 rounded-lg px-3 py-2 inline-flex items-center gap-2">
                      <span className="text-xs text-gray-300">Kod:</span>
                      <span className="font-mono font-bold text-[#FF6B35] tracking-wider">{campaign.code}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-10 bg-white">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="font-heading font-bold text-xl md:text-2xl text-[#1B2A4A]">Müşterilerimiz Ne Diyor?</h2>
            <p className="text-xs text-gray-400 mt-1">Gerçek müşteri deneyimleri</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-[#FF6B35]/30 transition-colors"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`w-3.5 h-3.5 ${j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">"{review.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="w-9 h-9 bg-[#1B2A4A] rounded-full flex items-center justify-center">
                    <span className="text-white font-heading font-bold text-sm">{review.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-heading font-semibold text-[#1B2A4A]">{review.name}</p>
                    <p className="text-[10px] text-gray-400">{review.product}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-10 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl md:text-2xl text-[#1B2A4A]">Popüler Markalar</h2>
              <p className="text-xs text-gray-400 mt-0.5">Dünya'nın en iyi markaları</p>
            </div>
            <Link href="/markalar" className="text-sm text-[#FF6B35] font-semibold flex items-center gap-1 hover:underline">
              Tüm Markalar <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredBrands.map((brand, i) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/marka/${brand.slug}`}
                  className="bg-white rounded-xl p-5 text-center hover:shadow-md border border-gray-100 hover:border-[#FF6B35] transition-all group hover:-translate-y-1 duration-300 block">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1B2A4A]/5 to-[#FF6B35]/5 rounded-2xl mx-auto mb-3 flex items-center justify-center group-hover:from-[#FF6B35]/10 group-hover:to-[#FF6B35]/5 transition-all">
                    <span className="font-heading font-black text-xl text-[#1B2A4A] group-hover:text-[#FF6B35] transition-colors">{brand.name.charAt(0)}</span>
                  </div>
                  <p className="font-heading font-semibold text-sm text-[#1B2A4A] group-hover:text-[#FF6B35] transition-colors">{brand.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{brand.country}</p>
                  <p className="text-[10px] text-[#FF6B35] font-semibold mt-1">{products.filter(p => p.brandId === brand.id).length} ürün</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}
