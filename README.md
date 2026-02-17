# ProteinMarket - Sporcu Gıdaları E-Ticaret Platformu

Türkiye'nin sporcu gıdaları e-ticaret platformu. Mobil öncelikli tasarım, kapsamlı admin paneli ve güvenli ödeme altyapısı ile tam donanımlı bir e-ticaret çözümü.

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19, TailwindCSS 4, shadcn/ui, Framer Motion |
| Backend | Express.js, tRPC 11, Drizzle ORM |
| Veritabanı | MySQL / TiDB |
| Kimlik Doğrulama | Manus OAuth |
| Dosya Depolama | S3 |
| Dil | TypeScript |

## Özellikler

### Mağaza (Frontend)
- Ana sayfa: Hero bölümü, kategoriler, öne çıkan ürünler, markalar
- Ürün listeleme: Arama, filtreleme, sıralama
- Ürün detay: Varyant seçimi (tat, gramaj), dinamik fiyat, stok durumu
- Kategori ve marka sayfaları
- Sepet yönetimi (localStorage tabanlı)
- 3 adımlı checkout (Teslimat → Ödeme → Özet)
- Sticky sipariş barı (mobil)
- İletişim formu
- Yasal sayfalar (gizlilik, sözleşme, iade)
- Newsletter aboneliği

### Admin Paneli (/admin)
- Dashboard: Sipariş, gelir, müşteri ve ürün istatistikleri
- Ürün yönetimi: CRUD, varyant ekleme/düzenleme, stok takibi
- Kategori yönetimi: Hiyerarşik yapı, görsel yükleme
- Marka yönetimi: Logo, açıklama
- Sipariş yönetimi: Durum güncelleme, kargo takip numarası
- Müşteri listesi
- Site ayarları: Logo, favicon, iletişim, sosyal medya, footer
- IBAN yönetimi: Havale/EFT için banka bilgileri
- Yasal sayfa düzenleme
- Mesajlar ve newsletter aboneleri

### Ödeme Yöntemleri
- Kredi kartı (PayTR entegrasyonu hazır)
- Havale/EFT (admin panelden IBAN yönetimi)

### Mobil Optimizasyon
- Mobil öncelikli tasarım
- Sheet menü (hamburger)
- 44px minimum dokunmatik hedefler
- Sticky sipariş barı
- Responsive grid yapısı

## Kurulum

```bash
# Bağımlılıkları yükle
pnpm install

# Veritabanı şemasını push'la
pnpm db:push

# Geliştirme sunucusunu başlat
pnpm dev
```

## Ortam Değişkenleri

Sistem tarafından otomatik sağlanan değişkenler:
- `DATABASE_URL` - Veritabanı bağlantı dizesi
- `JWT_SECRET` - Oturum imzalama anahtarı
- `VITE_APP_ID` - OAuth uygulama ID'si
- `OWNER_OPEN_ID` - Site sahibi ID'si

## Proje Yapısı

```
client/src/
  pages/           → Sayfa bileşenleri
    admin/          → Admin paneli sayfaları
  components/       → Yeniden kullanılabilir bileşenler
  contexts/         → React context'leri (Cart, Theme)
  lib/              → tRPC client
server/
  routers.ts        → tRPC API endpoint'leri
  db.ts             → Veritabanı sorgu yardımcıları
drizzle/
  schema.ts         → Veritabanı şeması
shared/
  utils.ts          → Paylaşılan yardımcı fonksiyonlar
```

## Test

```bash
pnpm test
```

## Lisans

MIT
