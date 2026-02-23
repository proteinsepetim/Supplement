# ProteinMarket Admin Paneli Kullanım Kılavuzu

## 📋 İçindekiler

1. [Giriş](#giriş)
2. [Supplement Sihirbazı (Quiz) Yönetimi](#supplement-sihirbazı-quiz-yönetimi)
3. [Kampanya Yönetimi](#kampanya-yönetimi)
4. [Ürün Yönetimi](#ürün-yönetimi)
5. [Analytics ve Satış Hunisi](#analytics-ve-satış-hunisi)

---

## Giriş

ProteinMarket admin paneline `/admin` URL'sinden erişebilirsiniz. Admin yetkisi olan kullanıcılar tüm yönetim özelliklerine erişebilir.

**Admin Paneli Bölümleri:**
- **Dashboard**: Genel istatistikler ve satış hunisi
- **Ürünler**: Ürün ekleme, düzenleme, stok yönetimi
- **Kategoriler**: Kategori yönetimi
- **Markalar**: Marka yönetimi
- **Siparişler**: Sipariş takibi ve durum güncelleme
- **Müşteriler**: Müşteri listesi
- **Quiz**: Supplement Sihirbazı soru ve seçenek yönetimi
- **Kampanyalar**: Dinamik kampanya kuralları
- **Analytics**: Detaylı satış ve davranış analizleri
- **Ayarlar**: Site ayarları, IBAN, yasal sayfalar

---

## Supplement Sihirbazı (Quiz) Yönetimi

Supplement Sihirbazı, kullanıcılara kişiselleştirilmiş ürün önerileri sunan bir quiz sistemidir.

### Quiz Nasıl Çalışır?

1. Kullanıcı ana sayfadan veya header'dan "Sihirbaz" linkine tıklar
2. 3 adımlı quiz'i tamamlar (Hedef, Cinsiyet, Antrenman Sıklığı)
3. Cevaplara göre sistem otomatik olarak ilgili kategorideki ürünleri gösterir

### Quiz Sorusu Ekleme

**Admin Paneli → Quiz → "Yeni Soru Ekle" Butonu**

**Gerekli Alanlar:**
- **Soru Metni**: Kullanıcıya sorulacak soru (örn: "Ana hedefiniz nedir?")
- **Soru Tipi**: 
  - `single` (Tek seçim) - Kullanıcı sadece bir seçenek seçebilir
  - `multiple` (Çoklu seçim) - Birden fazla seçenek seçilebilir
- **Sıralama**: Sorunun hangi sırada gösterileceği (1, 2, 3...)

### Quiz Seçeneği Ekleme

Her soru için en az 2 seçenek eklenmelidir.

**Gerekli Alanlar:**
- **Seçenek Metni**: Kullanıcının göreceği cevap (örn: "Kas Kütlesi Artırmak")
- **Hedef Kategori**: Bu seçenek seçildiğinde yönlendirilecek kategori
  - Dropdown'dan mevcut kategorilerden birini seçin
  - Örnek: "Kas Kütlesi Artırmak" → "Protein Tozları" kategorisi
- **Sıralama**: Seçeneğin sıra numarası

### Örnek Quiz Yapısı

Sistemde şu anda 3 soru tanımlıdır:

#### Soru 1: Ana hedefiniz nedir?
- **Kas Kütlesi Artırmak** → Protein Tozları kategorisi
- **Kilo Almak** → Kilo Alma kategorisi
- **Kilo Vermek / Yağ Yakmak** → Kilo Verme kategorisi
- **Performans Artırmak** → Kreatin kategorisi

#### Soru 2: Cinsiyetiniz nedir?
- **Erkek** → (Kategori yönlendirmesi yok, sadece filtreleme için)
- **Kadın** → (Kategori yönlendirmesi yok)

#### Soru 3: Haftada kaç gün antrenman yapıyorsunuz?
- **1-2 Gün (Başlangıç)** → Protein Tozları kategorisi
- **3-4 Gün (Orta Seviye)** → Amino Asitler kategorisi
- **5+ Gün (İleri Seviye)** → Ön Antrenman kategorisi

### Quiz Mantığı

**Kategori Yönlendirme Kuralı:**
- Kullanıcının seçtiği seçeneklerin `targetCategoryId` alanları toplanır
- En çok tekrar eden kategori ID'si belirlenir
- O kategorideki ürünler listelenir

**Örnek Senaryo:**
1. Kullanıcı "Kas Kütlesi Artırmak" seçer → Protein Tozları (ID: 1)
2. Kullanıcı "Erkek" seçer → Kategori yok (null)
3. Kullanıcı "5+ Gün" seçer → Ön Antrenman (ID: 7)

Sonuç: Sistem hem Protein Tozları hem Ön Antrenman kategorilerindeki ürünleri gösterir.

### Yeni Soru Ekleme Önerileri

**Eklenebilecek Sorular:**
- "Bütçeniz nedir?" → Ekonomik / Premium kategorilere yönlendirme
- "Alerjiniz var mı?" → Vegan / Laktoz-free ürünlere yönlendirme
- "Antrenman türünüz nedir?" → Cardio / Kuvvet antrenmanı kategorileri

---

## Kampanya Yönetimi

Dinamik kampanya motoru ile sepet bazlı otomatik kampanyalar oluşturabilirsiniz.

### Kampanya Türleri

**Admin Paneli → Kampanyalar → "Yeni Kampanya Ekle"**

#### 1. Sepet Tutarı Kampanyası
**Kural Türü:** `cart_threshold`

**Örnek:** "500 TL üzeri siparişlerde ücretsiz kargo"
- **Koşul Değeri**: 500 (TL)
- **Ödül Türü**: `free_shipping`
- **Ödül Değeri**: 0

**Örnek 2:** "300 TL üzeri siparişlerde Shaker hediye"
- **Koşul Değeri**: 300
- **Ödül Türü**: `free_product`
- **Ödül Değeri**: Shaker ürün ID'si

#### 2. Kategori Bazlı Kampanya
**Kural Türü:** `category_buy_x_get_y`

**Örnek:** "Protein kategorisinden 2 al 1 bedava"
- **Koşul Değeri**: 2 (adet)
- **Hedef Kategori**: Protein Tozları
- **Ödül Türü**: `discount_percentage`
- **Ödül Değeri**: 50 (% indirim 3. ürüne)

#### 3. Genel İndirim Kampanyası
**Kural Türü:** `cart_discount`

**Örnek:** "Tüm sepete %20 ekstra indirim"
- **Koşul Değeri**: 0 (koşulsuz)
- **Ödül Türü**: `discount_percentage`
- **Ödül Değeri**: 20

### Kampanya Alanları

- **Kampanya Adı**: Admin panelinde görünecek isim
- **Açıklama**: Kampanya detayları
- **Kural Türü**: `cart_threshold`, `category_buy_x_get_y`, `cart_discount`
- **Koşul Değeri**: Kampanyanın aktif olması için gerekli değer (TL, adet, vb.)
- **Hedef Kategori ID**: (Opsiyonel) Kategori bazlı kampanyalar için
- **Ödül Türü**: `free_shipping`, `free_product`, `discount_percentage`, `discount_fixed`
- **Ödül Değeri**: İndirim miktarı veya hediye ürün ID'si
- **Aktif**: Kampanyanın şu anda çalışıp çalışmadığı
- **Başlangıç/Bitiş Tarihi**: (Opsiyonel) Kampanya geçerlilik süresi

### Sepette Kampanya Gösterimi

Aktif kampanyalar sepet sayfasında otomatik olarak gösterilir:
- **Progress Bar**: "500 TL'ye 150 TL kaldı - Ücretsiz kargo kazan!"
- **Teşvik Mesajları**: Kullanıcıyı daha fazla alışveriş yapmaya yönlendirir

---

## Ürün Yönetimi

### Yeni Eklenen Alanlar

**Akıllı Ürün Kartları** özelliği için ürünlere iki yeni alan eklenmiştir:

#### Servis Sayısı (servingsCount)
- **Açıklama**: Ürünün kaç servis içerdiği
- **Örnek**: 1 kg Whey Protein → 33 servis
- **Kullanım**: Sistem otomatik olarak "Servis Başı: XX TL" hesaplaması yapar
- **Formül**: `Fiyat / Servis Sayısı`

#### Puan (ratingScore)
- **Açıklama**: Ürünün kalite puanı (0-10 arası)
- **Örnek**: 9.2, 8.5, 7.8
- **Kullanım**: Ürün kartında "9.2/10" rozeti olarak gösterilir
- **Öneri**: Müşteri yorumlarına veya ürün kalitesine göre belirleyin

### Ürün Ekleme/Düzenleme

**Admin Paneli → Ürünler → "Yeni Ürün Ekle"**

**Zorunlu Alanlar:**
- Ürün Adı
- Slug (URL dostu isim)
- Açıklama
- Fiyat
- Stok Miktarı
- Kategori
- **Servis Sayısı** (Yeni!)
- **Puan** (Yeni!)

**Opsiyonel:**
- İndirimli Fiyat (Otomatik olarak indirim yüzdesi hesaplanır)
- Marka
- Görsel (S3'e yüklenir)
- Varyantlar (Tat, gramaj vb.)

---

## Analytics ve Satış Hunisi

### Dashboard - Satış Hunisi Grafiği

**Admin Paneli → Dashboard**

Satış hunisi grafiği, kullanıcıların alışveriş yolculuğunu görselleştirir:

1. **Ziyaret** (Page View): Siteyi ziyaret eden kullanıcı sayısı
2. **Sepet** (Add to Cart): Sepete ürün ekleyen kullanıcı sayısı
3. **Checkout** (Checkout Start): Ödeme sayfasına giden kullanıcı sayısı
4. **Satış** (Order Complete): Siparişi tamamlayan kullanıcı sayısı

**Dönüşüm Oranları:**
- Ziyaret → Sepet: %X
- Sepet → Checkout: %Y
- Checkout → Satış: %Z

### Analytics Sayfası

**Admin Paneli → Analytics**

**Günlük İstatistikler:**
- Son 7, 30 veya 90 günlük veriler
- Event bazlı analiz (page_view, add_to_cart, checkout_start, order_complete)
- Grafik ve tablo görünümü

**Kullanım:**
- Hangi günlerde daha fazla satış olduğunu görün
- Sepet terk oranını analiz edin
- Kampanya etkilerini ölçün

---

## Seed Data Çalıştırma

Sisteme örnek kategoriler ve quiz soruları eklemek için:

```bash
cd /home/ubuntu/protein-market
npx tsx seed-quiz.mjs
```

Bu komut şunları ekler:
- 8 kategori (Protein, Karbonhidrat, Kilo Alma, vb.)
- 3 quiz sorusu
- 9 seçenek (kategori yönlendirmeleri ile)

---

## Sık Sorulan Sorular

### Quiz'e yeni soru ekledim ama görünmüyor?
- Sorunun `sortOrder` değerini kontrol edin
- En az 2 seçenek eklenmiş olmalı
- Sayfayı yenileyin

### Kampanya sepette görünmüyor?
- Kampanyanın "Aktif" olduğundan emin olun
- Başlangıç/Bitiş tarihlerini kontrol edin
- Koşul değerini (sepet tutarı) kontrol edin

### Servis başı maliyet hesaplanmıyor?
- Ürünün `servingsCount` alanının dolu olduğundan emin olun
- Fiyat ve servis sayısı 0'dan büyük olmalı

### Puan rozeti ürün kartında görünmüyor?
- `ratingScore` alanının 0-10 arası bir değer olduğundan emin olun
- Değer `null` ise roze gösterilmez

---

## Destek

Herhangi bir sorunuz için:
- GitHub Issues: [proteinsepetim/Supplement](https://github.com/proteinsepetim/Supplement)
- README.md dosyasını inceleyin
