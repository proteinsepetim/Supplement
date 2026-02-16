import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function main() {
  const connection = await createConnection(DATABASE_URL);
  const db = drizzle(connection);

  console.log("🌱 Seeding wizard goals...");
  await connection.execute(`
    INSERT IGNORE INTO wizard_goals (name, slug, description, icon, sortOrder, isActive) VALUES
    ('Kas Kütlesi Artırma', 'kas-kutlesi-artirma', 'Kas kütlenizi artırmak ve güçlenmek için ideal takviyeler', 'Dumbbell', 1, 'true'),
    ('Yağ Yakma & Zayıflama', 'yag-yakma', 'Yağ yakımını hızlandırmak ve kilo vermek için takviyeler', 'Flame', 2, 'true'),
    ('Enerji & Performans', 'enerji-performans', 'Antrenman performansınızı artırmak için pre-workout ve enerji takviyeleri', 'Zap', 3, 'true'),
    ('Toparlanma & Onarım', 'toparlanma-onarim', 'Antrenman sonrası kas onarımı ve toparlanma için takviyeler', 'Heart', 4, 'true'),
    ('Genel Sağlık & Bağışıklık', 'genel-saglik', 'Günlük sağlık, bağışıklık ve vitamin ihtiyaçları', 'Shield', 5, 'true'),
    ('Odaklanma & Zihinsel Performans', 'odaklanma', 'Zihinsel berraklık ve odaklanma için nootropik takviyeler', 'Brain', 6, 'true')
  `);

  console.log("🌱 Seeding wizard ingredients...");
  await connection.execute(`
    INSERT IGNORE INTO wizard_ingredients (name, slug, description) VALUES
    ('Whey Protein', 'whey-protein', 'Süt bazlı hızlı emilen protein'),
    ('Kazein Protein', 'kazein-protein', 'Yavaş emilen gece proteini'),
    ('BCAA', 'bcaa', 'Dallı zincirli amino asitler - kas onarımı'),
    ('Kreatin', 'kreatin', 'Güç ve kas hacmi artırıcı'),
    ('L-Karnitin', 'l-karnitin', 'Yağ yakımını destekleyen amino asit'),
    ('CLA', 'cla', 'Konjuge linoleik asit - yağ yakımı'),
    ('Kafein', 'kafein', 'Enerji ve odaklanma artırıcı'),
    ('Beta-Alanin', 'beta-alanin', 'Dayanıklılık artırıcı'),
    ('Glutamin', 'glutamin', 'Kas onarımı ve bağışıklık desteği'),
    ('Omega-3', 'omega-3', 'Balık yağı - genel sağlık'),
    ('Vitamin D', 'vitamin-d', 'Kemik sağlığı ve bağışıklık'),
    ('Multivitamin', 'multivitamin', 'Günlük vitamin ve mineral ihtiyacı'),
    ('Çinko', 'cinko', 'Bağışıklık ve testosteron desteği'),
    ('Magnezyum', 'magnezyum', 'Kas fonksiyonu ve uyku kalitesi'),
    ('Ashwagandha', 'ashwagandha', 'Stres azaltma ve adaptojenik bitki'),
    ('L-Theanin', 'l-theanin', 'Sakin odaklanma amino asiti'),
    ('Koenzim Q10', 'koenzim-q10', 'Hücresel enerji üretimi'),
    ('Probiyotik', 'probiyotik', 'Bağırsak sağlığı ve sindirim')
  `);

  console.log("🌱 Seeding goal-ingredient mappings...");
  // Kas Kütlesi: Whey, Kazein, BCAA, Kreatin, Glutamin
  await connection.execute(`
    INSERT IGNORE INTO goal_ingredients (goalId, ingredientId, relevanceScore) VALUES
    (1, 1, 10), (1, 2, 8), (1, 3, 9), (1, 4, 10), (1, 9, 7),
    (2, 5, 10), (2, 6, 9), (2, 7, 8), (2, 1, 6),
    (3, 7, 10), (3, 8, 9), (3, 4, 8), (3, 3, 7),
    (4, 9, 10), (4, 3, 9), (4, 14, 8), (4, 1, 7),
    (5, 10, 10), (5, 11, 9), (5, 12, 10), (5, 13, 8), (5, 18, 7),
    (6, 7, 8), (6, 16, 10), (6, 15, 9), (6, 17, 7)
  `);

  console.log("🌱 Seeding product-ingredient mappings...");
  // Map existing products to ingredients
  const [products] = await connection.execute("SELECT id, name FROM products");
  for (const product of products) {
    if (product.name.toLowerCase().includes("whey") || product.name.toLowerCase().includes("protein")) {
      await connection.execute(
        `INSERT IGNORE INTO product_ingredients (productId, ingredientId, amountPerServing) VALUES (?, 1, '25g'), (?, 3, '5.5g')`,
        [product.id, product.id]
      );
    }
    if (product.name.toLowerCase().includes("kreatin") || product.name.toLowerCase().includes("creatine")) {
      await connection.execute(
        `INSERT IGNORE INTO product_ingredients (productId, ingredientId, amountPerServing) VALUES (?, 4, '5g')`,
        [product.id]
      );
    }
    if (product.name.toLowerCase().includes("bcaa")) {
      await connection.execute(
        `INSERT IGNORE INTO product_ingredients (productId, ingredientId, amountPerServing) VALUES (?, 3, '7g'), (?, 9, '3g')`,
        [product.id, product.id]
      );
    }
  }

  console.log("🌱 Seeding site settings...");
  await connection.execute(`
    INSERT IGNORE INTO site_settings (settingKey, settingValue, settingType, description) VALUES
    ('site_name', 'ProteinMarket', 'text', 'Site adı'),
    ('site_tagline', 'Premium Sporcu Gıdaları', 'text', 'Site sloganı'),
    ('logo_url', '', 'image', 'Site logosu URL'),
    ('favicon_url', '', 'image', 'Favicon URL'),
    ('hero_slider', '[]', 'json', 'Ana sayfa slider görselleri (JSON array)'),
    ('contact_email', 'info@proteinmarket.com.tr', 'text', 'İletişim e-postası'),
    ('contact_phone', '+90 212 555 0000', 'text', 'İletişim telefonu'),
    ('contact_address', 'İstanbul, Türkiye', 'text', 'İletişim adresi'),
    ('whatsapp_number', '905551234567', 'text', 'WhatsApp numarası'),
    ('free_shipping_threshold', '300', 'number', 'Ücretsiz kargo limiti (TL)'),
    ('standard_shipping_cost', '29.90', 'number', 'Standart kargo ücreti (TL)'),
    ('social_instagram', '', 'text', 'Instagram URL'),
    ('social_twitter', '', 'text', 'Twitter URL'),
    ('social_facebook', '', 'text', 'Facebook URL'),
    ('announcement_bar', 'Bugüne özel: Tüm Hardline ürünlerinde %15 indirim! Kod: HARDLINE15', 'text', 'Duyuru çubuğu metni'),
    ('announcement_active', 'true', 'boolean', 'Duyuru çubuğu aktif mi')
  `);

  console.log("🌱 Seeding page SEO...");
  await connection.execute(`
    INSERT IGNORE INTO page_seo (pageRoute, pageTitle, metaTitle, metaDescription, keywords, noIndex) VALUES
    ('/', 'Ana Sayfa', 'ProteinMarket - Premium Sporcu Gıdaları | Whey Protein, BCAA, Kreatin', 'Türkiye''nin en güvenilir sporcu gıdaları mağazası. Whey protein, BCAA, kreatin, vitamin ve daha fazlası. %100 orijinal ürün garantisi.', 'protein tozu, whey protein, bcaa, kreatin, sporcu gıdaları, supplement', 'false'),
    ('/kategoriler', 'Kategoriler', 'Sporcu Gıdaları Kategorileri | ProteinMarket', 'Protein tozu, amino asit, vitamin, enerji ve performans ürünleri kategorileri.', 'protein tozu, amino asit, vitamin, enerji', 'false'),
    ('/markalar', 'Markalar', 'Sporcu Gıdaları Markaları | ProteinMarket', 'Optimum Nutrition, Hardline, BioTech USA ve daha fazla marka.', 'optimum nutrition, hardline, biotech usa', 'false'),
    ('/supplement-sihirbazi', 'Supplement Sihirbazı', 'Supplement Sihirbazı - Sana Uygun Takviyeyi Bul | ProteinMarket', 'Hedefine göre en uygun supplement paketini bul. Kişiye özel öneri motoru.', 'supplement öneri, takviye seçici, kişiye özel supplement', 'false'),
    ('/sepet', 'Sepetim', 'Sepetim | ProteinMarket', '', '', 'true'),
    ('/odeme', 'Ödeme', 'Güvenli Ödeme | ProteinMarket', '', '', 'true'),
    ('/yonetim-paneli', 'Yönetim Paneli', '', '', '', 'true')
  `);

  console.log("✅ Wizard & settings seed completed!");
  await connection.end();
}

main().catch(console.error);
