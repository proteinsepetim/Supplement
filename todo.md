
- [ ] S3 dosya depolama backend route'ları (upload, list, delete, presigned URL)
- [ ] Frontend dosya yükleme bileşeni (drag & drop, progress bar)
- [ ] Admin panelde dosya yönetimi sekmesi
- [ ] Ürün görselleri S3 entegrasyonu
- [ ] Dosya depolama testleri (vitest)

## Production-Ready Geliştirme
### FAZ 1: Güvenlik Sertleştirme
- [x] Bağımlılık taraması ve güncelleme
- [x] Input sanitizasyon (Zod validasyon + HTML strip) - XSS ve injection koruması
- [x] Backend sipariş router'ı ile güvenli fiyat hesaplama
- [x] Hassas veri sızıntısı kontrolü (loglarda PAN/CVV yok)

### FAZ 2: İş Mantığı ve Backend
- [x] Fiyat/vergi/kargo hesaplamalarını backend'e taşıma (order.create procedure)
- [x] Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu checkbox'ları (zorunlu)
- [x] Newsletter, contact, stockAlert backend procedure'ları
- [x] Zod schema ile tüm input validasyonu

### FAZ 3: UX/UI Optimizasyonu
- [x] Footer tıbbi sorumluluk reddi (disclaimer)
- [x] Mobil sticky bottom bar (Sepete Ekle / Ödemeye Geç) - MobileStickyBar bileşeni
- [x] Aroma/gramaj seçenekleri min 44px dokunma alanı
- [x] Besin değerleri tablosu (zebra çizgili, stillendirilmiş)

### FAZ 4: Test ve Doğrulama
- [x] 24 kapsamlı test senaryosu yazılıp çalıştırıldı (vitest - tümü başarılı)
- [x] TypeScript hatasız derleme doğrulandı
- [x] Tüm değişikliklerin raporlanması

## Bildirim Sistemi
- [x] Kapsamlı NotificationContext (stok, fiyat, kampanya, sipariş, duyuru)
- [x] NotificationDropdown bileşeni (filtre, silme, link navigasyonu)
- [x] NotificationsPage (tam sayfa, filtre, arama, toplu işlem)
- [x] NotificationPreferencesPage (bildirim tercihleri, push notification izni)
- [x] PushNotificationBanner bileşeni
- [x] Admin panel bildirim yönetimi sekmesi

## Legal Sayfalar & SEO
- [x] StaticPage bileşeni (KVKK, Gizlilik, İade, Kargo, Mesafeli Satış, Hakkımızda, İletişim, SSS)
- [x] useDocumentHead hook'u (meta tags, canonical, schema JSON-LD)
- [x] robots.txt ve sitemap.xml
- [x] CheckoutPage yasal sözleşme checkbox'ları (zorunlu)

## Backend API & Responsive Fixes
- [x] Health check endpoint (/api/health) ekleme
- [x] CORS yapılandırması kontrolü ve düzeltme
- [x] Frontend API bağlantılarına try-catch error handling ekleme
- [x] Mobil viewport modal/form responsive sorunlarını çözme (< 768px)
- [x] Tüm API endpoint'lerini test etme

## Veritabanı Bağlantısı ve Entegrasyon
- [x] Veritabanı şeması oluşturma (products, orders, order_items, categories, newsletter, stock_alerts)
- [x] Veritabanı bağlantısını test etme
- [x] Tabloları migrate etme (pnpm db:push) - 8 tablo başarıyla oluşturuldu
- [x] Örnek ürün verilerini veritabanına aktarma (seed) - 4 kategori, 3 ürün, 6 varyant
- [x] Backend API'leri oluşturma (trpc.products, trpc.categories)
- [ ] Frontend'i veritabanından veri çekecek şekilde güncelleme (sonraki adım)

## Anahtar Teslim Satışa Hazır - Yeni Görevler

### FAZ 1: Onarım ve Stabilizasyon
- [x] 100vh → 100dvh değişimi (@supports ile global CSS)
- [x] useLockBodyScroll hook'u oluşturma (modal/menü açıkken body scroll kilitleme)
- [x] Bildirim dropdown mobilde sola taşma sorunu düzeltme (Portal + bottom sheet)
- [x] Modal/bildirim z-index ve positioning düzeltme (z-[9999] + fixed)
- [x] Responsive modal/form padding ve centering

### FAZ 1B: Auth & Giriş Sistemi
- [x] Üye olma/giriş çalışır hale getirme (Manus OAuth entegrasyonu)
- [x] "Yakında aktif" mesajını kaldırma, gerçek login akışı
- [x] Admin paneli ana sayfadan kaldırıp gizli link yapma (/yonetim-paneli)
- [x] Header'daki kullanıcı ikonu login/profil akışı (avatar + dropdown menü)

### FAZ 2: Admin Panel 2026
- [ ] Admin panel modern UI (React 19, Tailwind v4, shadcn/ui)
- [ ] RBAC (Rol Tabanlı Erişim) - admin/user rolleri
- [ ] Chat-to-Data widget (doğal dil ile veri sorgulama)
- [ ] Sipariş yönetimi, ürün CRUD, stok güncelleme

### FAZ 3: Supplement Sihirbazı
- [ ] Öneri algoritması (recommendationEngine)
- [ ] Çok adımlı modal form (cinsiyet/yaş/kilo/boy → hedef → diyet → sonuç)
- [ ] "Hepsini Sepete Ekle" butonu

### FAZ 4: SEO/GEO
- [ ] Dinamik JSON-LD (Product, FAQPage, LocalBusiness şemaları)
- [ ] ipinfo.io geo-tespit entegrasyonu (ücretsiz)
- [ ] Meta etiketler güncelleme
