import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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

// E-commerce tables
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
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
  basePrice: int("basePrice").notNull(), // in cents
  rating: int("rating").default(0),
  reviewCount: int("reviewCount").default(0),
  imageUrl: varchar("imageUrl", { length: 500 }),
  tags: text("tags"), // JSON array
  nutritionFacts: text("nutritionFacts"), // JSON object
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const productVariants = mysqlTable("product_variants", {
  id: varchar("id", { length: 50 }).primaryKey(),
  productId: varchar("productId", { length: 50 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "2000g Çikolata"
  size: varchar("size", { length: 50 }), // e.g., "2000g"
  flavor: varchar("flavor", { length: 50 }), // e.g., "Çikolata"
  price: int("price").notNull(), // in cents
  stock: int("stock").default(0).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  userId: int("userId"), // nullable for guest checkout
  status: mysqlEnum("status", ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  // Customer info
  customerName: varchar("customerName", { length: 200 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  // Address
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }),
  zipCode: varchar("zipCode", { length: 10 }),
  // Pricing
  subtotal: int("subtotal").notNull(), // in cents
  shippingCost: int("shippingCost").notNull(),
  codFee: int("codFee").default(0).notNull(),
  total: int("total").notNull(),
  // Shipping & Payment
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
  unitPrice: int("unitPrice").notNull(), // in cents
  lineTotal: int("lineTotal").notNull(), // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

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