# ProteinMarket TODO

## Faz 1: Veritabanı ve Tema
- [x] Veritabanı şeması (Drizzle ORM)
- [x] Tema ve renk paleti yapılandırması
- [x] Google Fonts entegrasyonu

## Faz 2: Backend API
- [x] tRPC router'ları
- [x] Admin dashboard API
- [x] Ürün CRUD API
- [x] Kategori ve marka CRUD API
- [x] Sipariş yönetimi API
- [x] Site ayarları API
- [x] IBAN yönetimi API
- [x] Yasal sayfalar API
- [x] İletişim formu API
- [x] Newsletter API

## Faz 3: Admin Paneli
- [x] Admin Dashboard sayfası
- [x] Ürün yönetimi sayfası
- [x] Kategori yönetimi sayfası
- [x] Marka yönetimi sayfası
- [x] Sipariş yönetimi sayfası
- [x] Müşteri listesi sayfası
- [x] Site ayarları sayfası
- [x] IBAN yönetimi sayfası
- [x] Yasal sayfa düzenleme
- [x] Mesajlar sayfası
- [x] Newsletter aboneleri sayfası

## Faz 4: Frontend Mağaza
- [x] Ana sayfa (Hero, kategoriler, öne çıkan ürünler, markalar)
- [x] Ürün listeleme sayfası (arama, sıralama)
- [x] Ürün detay sayfası (varyant seçimi, sepete ekleme)
- [x] Kategori sayfası
- [x] Marka sayfası ve marka detay
- [x] Header (mobil sheet menü, arama, sepet)
- [x] Footer (newsletter, sosyal medya, yasal linkler)
- [x] İletişim sayfası
- [x] Yasal sayfalar (gizlilik, sözleşme, iade)

## Faz 5: Sepet ve Ödeme
- [x] Sepet sayfası
- [x] 3 adımlı checkout stepper
- [x] Sticky sipariş tamamla barı
- [x] Havale/EFT ödeme sistemi
- [x] Siparişlerim sayfası
- [x] Sipariş başarı sayfası

## Faz 6: SEO ve Mobil
- [x] robots.txt
- [ ] Hakkımızda sayfası
- [x] İletişim sayfası
- [x] Mobil optimizasyon (44px touch targets, responsive)

## Faz 7: Test ve Dağıtım
- [x] Vitest testleri
- [x] Checkpoint kaydetme
- [x] GitHub'a push
- [x] README.md dokümantasyonu

## Faz 8: Dönüşüm Oranı Artırıcı Özellikler

### 8.1 Akıllı Ürün Kartları
- [x] DB: products tablosuna servingsCount ve ratingScore alanları ekle
- [x] Frontend: Ürün kartlarında "Servis Başı: XX TL" hesaplaması
- [x] Frontend: Puan rozeti (9/10) ve indirim oranı (%15 İndirim) gösterimi
- [x] Backend: Ürün listesinde servis başı maliyet hesaplama

### 8.2 Supplement Sihirbazı (Quiz)
- [x] DB: quizQuestions ve quizOptions tabloları oluştur
- [x] Backend: Quiz soruları CRUD API
- [x] Backend: Cevaplara göre ürün filtreleme mantığı
- [x] Frontend: Step-by-step quiz modal/sayfası
- [x] Admin: Quiz soruları ve seçenekleri yönetim arayüzü
- [x] Frontend: Ana sayfaya Sihirbaz CTA bölümü
- [x] Frontend: Header'a Sihirbaz linki

### 8.3 Dinamik Kampanya Motoru
- [x] DB: campaigns tablosu oluştur (kural türü, koşullar, ödüller)
- [x] Backend: Kampanya CRUD API
- [x] Backend: Sepet kampanya hesaplama mantığı
- [x] Frontend: Sepette kampanya progress bar ve teşvik mesajları
- [x] Admin: Kampanya yönetim arayüzü

### 8.4 Admin Paneli Güncellemeleri
- [x] Admin: Ürün formuna servingsCount ve ratingScore alanları ekle
- [x] Admin: Dashboard'a Satış Hunisi grafiği ekle
- [x] Admin: Quiz yönetimi sayfası
- [x] Admin: Kampanya yönetimi sayfası
- [x] Admin: Analytics sayfası

### 8.5 GitHub Push
- [x] Vitest testleri güncelle (32 test başarılı)
- [x] TypeScript kontrolü
- [x] Checkpoint kaydet
- [ ] GitHub'a push
