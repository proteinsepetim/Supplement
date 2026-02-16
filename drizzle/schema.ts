import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ===== E-COMMERCE TABLES =====

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  metaTitle: varchar("metaTitle", { length: 200 }),
  metaDescription: text("metaDescription"),
  keywords: varchar("keywords", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const products = mysqlTable("products", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  brandId: varchar("brandId", { length: 50 }).notNull(),
  categoryId: varchar("categoryId", { length: 50 }).notNull(),
  basePrice: int("basePrice").notNull(), // in kuruş (cents)
  rating: int("rating").default(0),
  reviewCount: int("reviewCount").default(0),
  imageUrl: varchar("imageUrl", { length: 500 }),
  tags: text("tags"), // JSON array
  nutritionFacts: text("nutritionFacts"), // JSON object
  servingSize: varchar("servingSize", { length: 50 }),
  servingsPerContainer: int("servingsPerContainer"),
  usageInstructions: text("usageInstructions"),
  metaTitle: varchar("metaTitle", { length: 200 }),
  metaDescription: text("metaDescription"),
  keywords: varchar("keywords", { length: 500 }),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const productVariants = mysqlTable("product_variants", {
  id: varchar("id", { length: 50 }).primaryKey(),
  productId: varchar("productId", { length: 50 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  size: varchar("size", { length: 50 }),
  flavor: varchar("flavor", { length: 50 }),
  price: int("price").notNull(), // in kuruş
  stock: int("stock").default(0).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ===== ORDER TABLES =====

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  userId: int("userId"),
  status: mysqlEnum("status", ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
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
  total: int("total").notNull(),
  shippingMethod: varchar("shippingMethod", { length: 50 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: varchar("productId", { length: 50 }).notNull(),
  variantId: varchar("variantId", { length: 50 }).notNull(),
  productName: varchar("productName", { length: 200 }).notNull(),
  variantName: varchar("variantName", { length: 100 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(),
  lineTotal: int("lineTotal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== NEWSLETTER & STOCK ALERTS =====

export const newsletter = mysqlTable("newsletter", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const stockAlerts = mysqlTable("stock_alerts", {
  id: int("id").autoincrement().primaryKey(),
  productId: varchar("productId", { length: 50 }).notNull(),
  variantId: varchar("variantId", { length: 50 }),
  email: varchar("email", { length: 320 }).notNull(),
  isNotified: mysqlEnum("isNotified", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== SUPPLEMENT WIZARD TABLES =====

export const wizardGoals = mysqlTable("wizard_goals", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const wizardIngredients = mysqlTable("wizard_ingredients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const goalIngredients = mysqlTable("goal_ingredients", {
  id: int("id").autoincrement().primaryKey(),
  goalId: int("goalId").notNull(),
  ingredientId: int("ingredientId").notNull(),
  relevanceScore: int("relevanceScore").default(5).notNull(), // 1-10 scale
});

export const productIngredients = mysqlTable("product_ingredients", {
  id: int("id").autoincrement().primaryKey(),
  productId: varchar("productId", { length: 50 }).notNull(),
  ingredientId: int("ingredientId").notNull(),
  amountPerServing: varchar("amountPerServing", { length: 50 }),
});

// ===== SITE SETTINGS (Dynamic CMS) =====

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue"),
  settingType: mysqlEnum("settingType", ["text", "image", "json", "boolean", "number"]).default("text").notNull(),
  description: varchar("description", { length: 255 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ===== PAGE SEO (Dynamic Meta Tags) =====

export const pageSeo = mysqlTable("page_seo", {
  id: int("id").autoincrement().primaryKey(),
  pageRoute: varchar("pageRoute", { length: 200 }).notNull().unique(),
  pageTitle: varchar("pageTitle", { length: 200 }),
  metaTitle: varchar("metaTitle", { length: 200 }),
  metaDescription: text("metaDescription"),
  ogImage: varchar("ogImage", { length: 500 }),
  keywords: varchar("keywords", { length: 500 }),
  noIndex: mysqlEnum("noIndex", ["true", "false"]).default("false").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ===== WIZARD SESSIONS (Analytics) =====

export const wizardSessions = mysqlTable("wizard_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  goalId: int("goalId"),
  gender: varchar("gender", { length: 20 }),
  ageRange: varchar("ageRange", { length: 20 }),
  trainingFrequency: varchar("trainingFrequency", { length: 50 }),
  recommendedProducts: text("recommendedProducts"), // JSON array of product IDs
  addedToCart: mysqlEnum("addedToCart", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ===== TYPE EXPORTS =====

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export type Newsletter = typeof newsletter.$inferSelect;
export type InsertNewsletter = typeof newsletter.$inferInsert;
export type StockAlert = typeof stockAlerts.$inferSelect;
export type InsertStockAlert = typeof stockAlerts.$inferInsert;
export type WizardGoal = typeof wizardGoals.$inferSelect;
export type InsertWizardGoal = typeof wizardGoals.$inferInsert;
export type WizardIngredient = typeof wizardIngredients.$inferSelect;
export type InsertWizardIngredient = typeof wizardIngredients.$inferInsert;
export type GoalIngredient = typeof goalIngredients.$inferSelect;
export type ProductIngredientRow = typeof productIngredients.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type PageSeoRow = typeof pageSeo.$inferSelect;
export type WizardSession = typeof wizardSessions.$inferSelect;
