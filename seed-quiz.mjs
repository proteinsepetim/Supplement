import { drizzle } from "drizzle-orm/mysql2";
import { categories, quizQuestions, quizOptions } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seedData() {
  console.log("🌱 Seeding categories...");
  
  // Kategorileri oluştur
  const categoryData = [
    { name: "Protein Tozları", slug: "protein-tozlari", description: "Kas gelişimi için protein takviyeleri", sortOrder: 1 },
    { name: "Karbonhidrat", slug: "karbonhidrat", description: "Enerji ve kilo alma için karbonhidrat takviyeleri", sortOrder: 2 },
    { name: "Kilo Alma", slug: "kilo-alma", description: "Sağlıklı kilo almak isteyenler için", sortOrder: 3 },
    { name: "Kilo Verme", slug: "kilo-verme", description: "Yağ yakımı ve kilo kontrolü için", sortOrder: 4 },
    { name: "Amino Asitler", slug: "amino-asitler", description: "BCAA, Glutamine ve diğer amino asitler", sortOrder: 5 },
    { name: "Kreatin", slug: "kreatin", description: "Güç ve performans artırıcı", sortOrder: 6 },
    { name: "Ön Antrenman", slug: "on-antrenman", description: "Pre-workout enerji takviyeleri", sortOrder: 7 },
    { name: "Vitaminler", slug: "vitaminler", description: "Genel sağlık için vitamin ve mineraller", sortOrder: 8 },
  ];

  const insertedCategories = [];
  for (const cat of categoryData) {
    const [result] = await db.insert(categories).values(cat).$returningId();
    insertedCategories.push({ ...cat, id: result.id });
    console.log(`✅ Kategori eklendi: ${cat.name} (ID: ${result.id})`);
  }

  console.log("\n🌱 Seeding quiz questions...");

  // Soru 1: Hedef
  const [q1] = await db.insert(quizQuestions).values({
    questionText: "Ana hedefiniz nedir?",
    questionType: "single",
    sortOrder: 1,
  }).$returningId();
  console.log(`✅ Soru eklendi: Ana hedefiniz nedir? (ID: ${q1.id})`);

  const proteinCat = insertedCategories.find(c => c.slug === "protein-tozlari");
  const kiloAlmaCat = insertedCategories.find(c => c.slug === "kilo-alma");
  const kiloVermeCat = insertedCategories.find(c => c.slug === "kilo-verme");
  const kreatinCat = insertedCategories.find(c => c.slug === "kreatin");

  await db.insert(quizOptions).values([
    {
      questionId: q1.id,
      optionText: "Kas Kütlesi Artırmak",
      targetCategoryId: proteinCat?.id || null,
      sortOrder: 1,
    },
    {
      questionId: q1.id,
      optionText: "Kilo Almak",
      targetCategoryId: kiloAlmaCat?.id || null,
      sortOrder: 2,
    },
    {
      questionId: q1.id,
      optionText: "Kilo Vermek / Yağ Yakmak",
      targetCategoryId: kiloVermeCat?.id || null,
      sortOrder: 3,
    },
    {
      questionId: q1.id,
      optionText: "Performans Artırmak",
      targetCategoryId: kreatinCat?.id || null,
      sortOrder: 4,
    },
  ]);
  console.log("✅ Soru 1 seçenekleri eklendi");

  // Soru 2: Cinsiyet
  const [q2] = await db.insert(quizQuestions).values({
    questionText: "Cinsiyetiniz nedir?",
    questionType: "single",
    sortOrder: 2,
  }).$returningId();
  console.log(`✅ Soru eklendi: Cinsiyetiniz nedir? (ID: ${q2.id})`);

  await db.insert(quizOptions).values([
    {
      questionId: q2.id,
      optionText: "Erkek",
      targetCategoryId: null, // Cinsiyet kategori yönlendirmesi yapmaz, sadece filtreleme için
      sortOrder: 1,
    },
    {
      questionId: q2.id,
      optionText: "Kadın",
      targetCategoryId: null,
      sortOrder: 2,
    },
  ]);
  console.log("✅ Soru 2 seçenekleri eklendi");

  // Soru 3: Antrenman Sıklığı
  const [q3] = await db.insert(quizQuestions).values({
    questionText: "Haftada kaç gün antrenman yapıyorsunuz?",
    questionType: "single",
    sortOrder: 3,
  }).$returningId();
  console.log(`✅ Soru eklendi: Haftada kaç gün antrenman yapıyorsunuz? (ID: ${q3.id})`);

  const onAntrenmanCat = insertedCategories.find(c => c.slug === "on-antrenman");
  const aminoCat = insertedCategories.find(c => c.slug === "amino-asitler");

  await db.insert(quizOptions).values([
    {
      questionId: q3.id,
      optionText: "1-2 Gün (Başlangıç)",
      targetCategoryId: proteinCat?.id || null,
      sortOrder: 1,
    },
    {
      questionId: q3.id,
      optionText: "3-4 Gün (Orta Seviye)",
      targetCategoryId: aminoCat?.id || null,
      sortOrder: 2,
    },
    {
      questionId: q3.id,
      optionText: "5+ Gün (İleri Seviye)",
      targetCategoryId: onAntrenmanCat?.id || null,
      sortOrder: 3,
    },
  ]);
  console.log("✅ Soru 3 seçenekleri eklendi");

  console.log("\n🎉 Seed işlemi tamamlandı!");
  console.log("\n📋 Özet:");
  console.log(`- ${categoryData.length} kategori eklendi`);
  console.log("- 3 quiz sorusu eklendi");
  console.log("- 9 seçenek eklendi");
  console.log("\n💡 Admin panelinden (/admin/quiz) soruları ve seçenekleri yönetebilirsiniz.");
  
  process.exit(0);
}

seedData().catch((err) => {
  console.error("❌ Seed hatası:", err);
  process.exit(1);
});
