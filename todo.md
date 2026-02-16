
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
- [x] Admin panel modern UI (React 19, Tailwind v4, shadcn/ui, recharts)
- [x] RBAC (Rol Tabanlı Erişim) - admin/user rolleri (protectedProcedure + role check)
- [ ] Chat-to-Data widget (doğal dil ile veri sorgulama) - sonraki adım
- [x] Sipariş yönetimi, ürün CRUD, stok güncelleme (backend + frontend)

### FAZ 3: Supplement Sihirbazı
- [x] Öneri algoritması (recommendationEngine) - mevcut, çalışıyor
- [x] Çok adımlı form (cinsiyet → hedef → sıklık → bütçe → sonuç)
- [x] "Tümünü Sepete Ekle" butonu - çalışıyor

### FAZ 4: SEO/GEO
- [x] Dinamik JSON-LD (Product, FAQPage, LocalBusiness, ItemList, OfferCatalog şemaları)
- [x] LocalBusiness şeması anasayfaya eklendi
- [x] Meta etiketler güncelleme (useDocumentHead hook)
- [ ] ipinfo.io geo-tespit entegrasyonu (sonraki adım)

## Master Prompt - Anahtar Teslim E-Ticaret

### FAZ 1: Sistem Denetimi ve Onarım
- [x] Mevcut veri akışı haritalama (frontend↔backend endpoint eşleşmesi)
- [x] REPAIR_LOG.md oluşturma (tespit edilen her kırık endpoint)
- [x] Şema normalizasyonu: Goals, Ingredients, GoalIngredients, ProductIngredients tabloları (15 tablo migrate edildi)
- [x] SiteSettings tablosu (logo, slider, genel ayarlar)
- [x] PageSEO tablosu (dinamik meta etiketleri)
- [x] Seed verileri eklendi (wizard goals, ingredients, site settings)
- [ ] API controller'ları frontend beklentisine uygun JSON döndürecek şekilde güncelleme (devam ediyor)

### FAZ 2: Gelişmiş Admin Paneli
- [x] Backend API'leri eklendi (admin.settings, admin.seo, admin.products, admin.orders)
- [ ] Frontend admin paneli güncelleme (devam edecek)
- [ ] Dinamik site ayarları modülü (logo/slider yükleme → S3)
- [ ] SEO yönetim modülü (sayfa bazlı meta_title, meta_description)
- [ ] Gelişmiş ürün yönetimi (varyasyon desteği, stok takibi)
- [ ] Sipariş yönetimi (durum güncelleme, filtreleme)
- [ ] Müşteri listesi ve detayları

### FAZ 3: Supplement Sihirbazı (Öneri Motoru)
- [ ] WizardGoals tablosu (Kas Yapma, Yağ Yakma, Enerji vb.)
- [ ] WizardIngredients tablosu (Whey, BCAA, L-Karnitin vb.)
- [ ] GoalIngredients many-to-many ilişki tablosu
- [ ] ProductIngredients many-to-many ilişki tablosu
- [ ] Backend öneri algoritması (hedef→bileşen→ürün sorgusu)
- [ ] Frontend stepper UI (cinsiyet→hedef→yoğunluk→sonuç)
- [ ] "Hepsini Sepete Ekle" butonu

### FAZ 4: SEO/GEO Konfigürasyonu
- [ ] Dinamik sitemap.xml oluşturucu (ürün/kategori eklendikçe güncellenir)
- [ ] robots.txt güncelleme (/yonetim-paneli, /odeme, /hesap disallow)
- [ ] JSON-LD Schema.org/Product tüm ürün sayfalarında
- [ ] Intl.NumberFormat('tr-TR') ile TL formatlama
- [ ] hreflang ve canonical etiketler

### FAZ 5: Test ve Doğrulama
- [ ] Vitest testleri (admin API, sihirbaz API, ürün CRUD)
- [ ] Tarayıcı doğrulama (tüm sayfalar)
- [ ] TypeScript hatasız derleme

## GitHub & Supabase Entegrasyonu
- [ ] Backend API'lerini test etme (TypeScript, vitest)
- [ ] Projeyi GitHub'a yükleme (proteinsepetim/Supplement repository)
- [ ] Supabase projesi oluşturma
- [ ] Supabase veritabanı bağlantı string'ini .env'e ekleme
- [ ] Drizzle migration'ları Supabase'e push etme
- [ ] Seed verilerini Supabase'e aktarma
- [ ] Bağlantıyı test etme

## Veritabanı Durumu
- [x] TiDB/MySQL veritabanı aktif ve çalışıyor (Manus tarafından yönetiliyor)
- [x] 15 tablo migrate edildi ve seed verileri yüklendi
- [x] Test hatalarını düzeltme (newsletter, stockAlert, product variant) - 24/24 test başarılı
- [ ] Frontend'i database API'lerine bağlama (sonraki faz - büyük refactoring gerekiyor)
  - ProductCard component'ini database type'larına uyarlama
  - Variants join ile çekme
  - Type definitions güncelleme
- [x] GitHub'a son değişiklikleri push etme
