# ProteinMarket TODO

## Faz 1: Veritabanı ve Temel Yapı
- [x] Veritabanı şeması (categories, products, productVariants, orders, orderItems, newsletter, stockAlerts, siteSettings, pageSeo, ibans, legalPages, turkeyLocations)
- [x] Tema yapılandırması (renkler, fontlar, dark/light)
- [x] Global CSS değişkenleri ve Tailwind ayarları

## Faz 2: Backend API
- [x] Ürün router'ları (list, bySlug, byCategory, search)
- [x] Kategori router'ları (list, bySlug)
- [x] Sipariş router'ları (create, track, myOrders)
- [x] Newsletter router
- [x] İletişim formu router
- [x] Stok uyarı router
- [x] Site ayarları router (public read)
- [x] SEO router (byRoute)
- [x] IBAN router (public list)
- [x] Yasal sayfa router
- [ ] PayTR ödeme entegrasyonu (token, callback)
- [x] Dosya yükleme router (S3)
- [ ] E-posta servisi (sipariş onay, kargo bildirim)
- [x] Admin dashboard istatistikleri
- [x] Admin sipariş yönetimi (list, updateStatus, getDetail)
- [x] Admin ürün yönetimi (CRUD)
- [x] Admin varyant yönetimi (CRUD, stok güncelleme)
- [x] Admin kategori yönetimi
- [x] Admin müşteri listesi
- [x] Admin newsletter listesi
- [x] Admin stok uyarıları listesi
- [x] Admin site ayarları yönetimi
- [x] Admin SEO yönetimi
- [x] Admin IBAN yönetimi
- [x] Admin yasal sayfa yönetimi
- [ ] Admin PayTR ayarları

## Faz 3: Admin Paneli UI
- [x] Admin dashboard sayfası (istatistikler, grafikler)
- [x] Admin site ayarları sayfası (logo, favicon, renkler, footer, iletişim)
- [x] Admin ürün yönetimi sayfası (liste, ekleme, düzenleme)
- [x] Admin varyant yönetimi sayfası
- [x] Admin kategori yönetimi sayfası
- [x] Admin sipariş yönetimi sayfası (liste, detay, durum güncelleme)
- [x] Admin müşteri listesi sayfası
- [x] Admin IBAN yönetimi sayfası
- [ ] Admin SEO yönetimi sayfası
- [x] Admin yasal sayfa düzenleme sayfası
- [ ] Admin PayTR ayarları sayfası
- [x] Admin newsletter yönetimi sayfası
- [x] Admin dosya yükleme bileşeni

## Faz 4: Frontend Mağaza
- [x] Ana sayfa (hero, kategoriler, öne çıkan ürünler, markalar)
- [x] Ürün listesi sayfası (filtreleme, sıralama, sayfalama)
- [x] Ürün detay sayfası (varyant seçimi, dinamik fiyat, stok durumu)
- [x] Kategori sayfası
- [x] Marka sayfaları
- [x] Arama sonuçları sayfası
- [x] Header (mobil sheet menü, accordion alt kategoriler)
- [x] Footer (dinamik, admin tarafından yönetilen)
- [x] Toast bildirimleri (sepete ekleme vb.)

## Faz 5: Sepet ve Ödeme
- [x] Sepet sayfası (ürün listesi, miktar güncelleme, silme)
- [x] 3 adımlı checkout stepper (Adres → Kargo → Ödeme)
- [ ] Türkiye il/ilçe seçimi (adres formunda)
- [x] Sticky sipariş tamamla barı (mobil)
- [ ] PayTR iFrame ödeme sayfası
- [x] Havale/EFT ödeme seçeneği (IBAN gösterimi)
- [ ] Kapıda ödeme seçeneği
- [x] Sipariş onay sayfası
- [x] Sipariş takip sayfası

## Faz 6: SEO, Yasal ve Mobil
- [ ] Sayfa bazlı SEO meta etiketleri
- [ ] JSON-LD yapılandırılmış veri (ürün, breadcrumb)
- [x] robots.txt ve sitemap.xml
- [x] Gizlilik politikası sayfası
- [x] Mesafeli satış sözleşmesi sayfası
- [x] İptal ve iade koşulları sayfası
- [ ] SSS sayfası
- [ ] Hakkımızda sayfası
- [x] İletişim sayfası
- [x] Mobil optimizasyon (44px touch targets, responsive)

## Faz 7: Test ve Dağıtım
- [x] Vitest testleri
- [x] Checkpoint kaydetme
- [ ] GitHub'a push
- [x] README.md dokümantasyonu
