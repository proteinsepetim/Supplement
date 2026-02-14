
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
