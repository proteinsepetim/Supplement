import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

// ==================== USERS ====================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== CATEGORIES ====================
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  imageUrl: varchar("imageUrl", { length: 500 }),
  parentId: int("parentId"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  metaTitle: varchar("metaTitle", { length: 200 }),
  metaDescription: text("metaDescription"),
  keywords: varchar("keywords", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ==================== BRANDS ====================
export const brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  logoUrl: varchar("logoUrl", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

// ==================== PRODUCTS ====================
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  brandId: int("brandId").notNull(),
  categoryId: int("categoryId").notNull(),
  basePrice: int("basePrice").notNull(), // kuruş cinsinden
  imageUrl: varchar("imageUrl", { length: 500 }),
  images: json("images"), // JSON array of image URLs
  tags: json("tags"), // JSON array of tags
  nutritionFacts: json("nutritionFacts"), // JSON object
  servingSize: varchar("servingSize", { length: 50 }),
  servingsPerContainer: int("servingsPerContainer"),
  servingsCount: int("servingsCount"), // Toplam servis sayısı (servis başı maliyet hesabı için)
  ratingScore: int("ratingScore").default(0), // 0-100 arası puan (10 ile böl = 10 üzerinden)
  usageInstructions: text("usageInstructions"),
  rating: int("rating").default(0),
  reviewCount: int("reviewCount").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  metaTitle: varchar("metaTitle", { length: 200 }),
  metaDescription: text("metaDescription"),
  keywords: varchar("keywords", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ==================== PRODUCT VARIANTS ====================
export const productVariants = mysqlTable("product_variants", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  flavor: varchar("flavor", { length: 100 }),
  size: varchar("size", { length: 50 }),
  attributes: json("attributes"), // JSONB-like: { "Aroma": "Çikolata", "Gramaj": "2.3kg" }
  price: int("price").notNull(), // kuruş cinsinden
  compareAtPrice: int("compareAtPrice"), // indirimli fiyat gösterimi için
  stock: int("stock").default(0).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

// ==================== ORDERS ====================
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  userId: int("userId"),
  status: mysqlEnum("status", ["pending", "paid", "confirmed", "preparing", "shipped", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
  customerName: varchar("customerName", { length: 200 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }),
  zipCode: varchar("zipCode", { length: 10 }),
  subtotal: int("subtotal").notNull(),
  shippingCost: int("shippingCost").notNull(),
  codFee: int("codFee").default(0).notNull(),
  discount: int("discount").default(0).notNull(),
  total: int("total").notNull(),
  shippingMethod: varchar("shippingMethod", { length: 50 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  trackingUrl: varchar("trackingUrl", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ==================== ORDER ITEMS ====================
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  variantId: int("variantId").notNull(),
  productName: varchar("productName", { length: 200 }).notNull(),
  variantName: varchar("variantName", { length: 100 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(),
  lineTotal: int("lineTotal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ==================== NEWSLETTER ====================
export const newsletter = mysqlTable("newsletter", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Newsletter = typeof newsletter.$inferSelect;

// ==================== STOCK ALERTS ====================
export const stockAlerts = mysqlTable("stock_alerts", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  variantId: int("variantId"),
  email: varchar("email", { length: 320 }).notNull(),
  isNotified: boolean("isNotified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockAlert = typeof stockAlerts.$inferSelect;

// ==================== SITE SETTINGS (Singleton) ====================
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue"),
  settingType: mysqlEnum("settingType", ["text", "image", "json", "boolean", "number", "color"]).default("text").notNull(),
  description: varchar("description", { length: 255 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;

// ==================== PAGE SEO ====================
export const pageSeo = mysqlTable("page_seo", {
  id: int("id").autoincrement().primaryKey(),
  pageRoute: varchar("pageRoute", { length: 200 }).notNull().unique(),
  pageTitle: varchar("pageTitle", { length: 200 }),
  metaTitle: varchar("metaTitle", { length: 200 }),
  metaDescription: text("metaDescription"),
  ogImage: varchar("ogImage", { length: 500 }),
  keywords: varchar("keywords", { length: 500 }),
  noIndex: boolean("noIndex").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PageSeo = typeof pageSeo.$inferSelect;

// ==================== IBANS ====================
export const ibans = mysqlTable("ibans", {
  id: int("id").autoincrement().primaryKey(),
  bankName: varchar("bankName", { length: 100 }).notNull(),
  iban: varchar("iban", { length: 50 }).notNull().unique(),
  accountHolder: varchar("accountHolder", { length: 200 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Iban = typeof ibans.$inferSelect;

// ==================== LEGAL PAGES ====================
export const legalPages = mysqlTable("legal_pages", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"),
  isActive: boolean("isActive").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LegalPage = typeof legalPages.$inferSelect;

// ==================== CONTACT MESSAGES ====================
export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;

// ==================== TURKEY LOCATIONS ====================
export const turkeyProvinces = mysqlTable("turkey_provinces", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(),
});

export const turkeyDistricts = mysqlTable("turkey_districts", {
  id: int("id").autoincrement().primaryKey(),
  provinceId: int("provinceId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
});

export type TurkeyProvince = typeof turkeyProvinces.$inferSelect;
export type TurkeyDistrict = typeof turkeyDistricts.$inferSelect;

// ==================== QUIZ (Supplement Sihirbazı) ====================
export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  questionText: varchar("questionText", { length: 500 }).notNull(),
  questionType: mysqlEnum("questionType", ["single", "multiple"]).default("single").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;

export const quizOptions = mysqlTable("quiz_options", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull(),
  optionText: varchar("optionText", { length: 200 }).notNull(),
  optionIcon: varchar("optionIcon", { length: 50 }), // lucide icon name
  categoryIds: json("categoryIds"), // JSON array of category IDs to filter
  tagFilters: json("tagFilters"), // JSON array of tags to match
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizOption = typeof quizOptions.$inferSelect;
export type InsertQuizOption = typeof quizOptions.$inferInsert;

// ==================== CAMPAIGNS (Dinamik Kampanya Motoru) ====================
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  ruleType: mysqlEnum("ruleType", ["min_cart_gift", "buy_x_get_y", "cart_discount_percent", "cart_discount_amount", "free_shipping"]).notNull(),
  // Koşullar
  minCartAmount: int("minCartAmount"), // Minimum sepet tutarı (kuruş)
  requiredCategoryId: int("requiredCategoryId"), // Gerekli kategori
  requiredProductCount: int("requiredProductCount"), // Gerekli ürün adedi
  // Ödüller
  discountPercent: int("discountPercent"), // Yüzde indirim
  discountAmount: int("discountAmount"), // Sabit indirim (kuruş)
  giftProductName: varchar("giftProductName", { length: 200 }), // Hediye ürün adı
  giftProductImage: varchar("giftProductImage", { length: 500 }),
  // Durum
  isActive: boolean("isActive").default(true).notNull(),
  priority: int("priority").default(0).notNull(),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// ==================== SITE ANALYTICS (Satış Hunisi) ====================
export const siteAnalytics = mysqlTable("site_analytics", {
  id: int("id").autoincrement().primaryKey(),
  eventType: mysqlEnum("eventType", ["page_view", "add_to_cart", "checkout_start", "order_complete"]).notNull(),
  sessionId: varchar("sessionId", { length: 100 }),
  userId: int("userId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SiteAnalytic = typeof siteAnalytics.$inferSelect;
