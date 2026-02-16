# REPAIR_LOG.md - Sistem Denetim Raporu

## Tarih: 14 Şubat 2026

## 1. Mevcut Backend Endpoint'ler (Çalışan)

| Endpoint | Tip | Durum |
|---|---|---|
| `auth.me` | query | Çalışıyor |
| `auth.logout` | mutation | Çalışıyor |
| `order.create` | mutation | Çalışıyor (statik data.ts'den fiyat hesaplıyor) |
| `newsletter.subscribe` | mutation | Çalışıyor |
| `contact.send` | mutation | Çalışıyor |
| `stockAlert.create` | mutation | Çalışıyor |
| `products.list` | query | Çalışıyor (DB'den) |
| `categories.list` | query | Çalışıyor (DB'den) |
| `admin.dashboard` | query | Çalışıyor |
| `admin.orders.list` | query | Çalışıyor |
| `admin.products.list` | query | Çalışıyor |
| `admin.customers.list` | query | Çalışıyor |
| `/api/health` | REST GET | Çalışıyor |
| `/api/status` | REST GET | Çalışıyor |

## 2. Tespit Edilen Sorunlar

### Kritik (P0)
1. **Frontend hala statik data.ts kullanıyor** - Home, ProductDetail, CategoryPage veritabanından değil statik dosyadan veri çekiyor
2. **Sipariş fiyat hesaplama statik data.ts'den** - Backend order.create statik veriden fiyat hesaplıyor, DB'den hesaplamalı
3. **Eksik tablolar** - Goals, Ingredients, GoalIngredients, ProductIngredients, SiteSettings, PageSEO tabloları yok
4. **Admin panel ürün ekleme/düzenleme** - Sadece listeleme ve silme var, create/update mutation eksik

### Önemli (P1)
5. **Dinamik site ayarları yok** - Logo, slider, genel ayarlar hardcoded
6. **SEO yönetim modülü yok** - Admin panelden meta tag düzenlenemez
7. **Supplement Sihirbazı statik** - Veritabanı tabanlı öneri motoru yok
8. **Dinamik sitemap.xml yok** - Statik dosya, ürün eklenince güncellenmez

### İyileştirme (P2)
9. **TL formatlama tutarsız** - Bazı yerlerde Intl.NumberFormat kullanılmıyor
10. **robots.txt** - /yonetim-paneli ve /odeme disallow edilmeli

## 3. Onarım Planı

### Adım 1: Şema Genişletme
- Goals, Ingredients, GoalIngredients, ProductIngredients tabloları ekle
- SiteSettings tablosu ekle
- PageSEO tablosu ekle
- Products tablosuna meta_title, meta_description, keywords ekle

### Adım 2: Backend API Genişletme
- admin.products.create ve admin.products.update mutation'ları ekle
- admin.siteSettings CRUD ekle
- admin.seo CRUD ekle
- wizard.recommend query ekle

### Adım 3: Frontend Entegrasyon
- Home, ProductDetail, CategoryPage'i trpc.products'dan veri çekecek şekilde güncelle
- Admin panele site ayarları ve SEO modülleri ekle
- Supplement Sihirbazı'nı veritabanı tabanlı yap

### Adım 4: SEO/GEO
- Dinamik sitemap.xml endpoint'i
- robots.txt güncelle
- TL formatlama standardize et
