var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  addedToCartEnum: () => addedToCartEnum,
  categories: () => categories,
  goalIngredients: () => goalIngredients,
  ibans: () => ibans,
  isActiveEnum: () => isActiveEnum,
  isActiveYNEnum: () => isActiveYNEnum,
  isNotifiedEnum: () => isNotifiedEnum,
  newsletter: () => newsletter,
  noIndexEnum: () => noIndexEnum,
  orderItems: () => orderItems,
  orderStatusEnum: () => orderStatusEnum,
  orders: () => orders,
  pageSeo: () => pageSeo,
  productIngredients: () => productIngredients,
  productVariants: () => productVariants,
  products: () => products,
  roleEnum: () => roleEnum,
  settingTypeEnum: () => settingTypeEnum,
  siteSettings: () => siteSettings,
  stockAlerts: () => stockAlerts,
  users: () => users,
  wizardGoals: () => wizardGoals,
  wizardIngredients: () => wizardIngredients,
  wizardSessions: () => wizardSessions
});
import {
  pgTable,
  pgEnum,
  serial,
  integer,
  text,
  varchar,
  timestamp,
  boolean
} from "drizzle-orm/pg-core";
var roleEnum, users, categories, isActiveEnum, products, productVariants, orderStatusEnum, orders, orderItems, isActiveYNEnum, isNotifiedEnum, newsletter, stockAlerts, wizardGoals, wizardIngredients, goalIngredients, productIngredients, settingTypeEnum, siteSettings, noIndexEnum, pageSeo, addedToCartEnum, wizardSessions, ibans;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    roleEnum = pgEnum("role", ["user", "admin"]);
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      openId: varchar("openId", { length: 64 }).unique(),
      // legacy, artık opsiyonel
      email: varchar("email", { length: 320 }).unique(),
      passwordHash: varchar("passwordHash", { length: 255 }),
      name: text("name"),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: roleEnum("role").default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    categories = pgTable("categories", {
      id: varchar("id", { length: 50 }).primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      slug: varchar("slug", { length: 100 }).notNull().unique(),
      description: text("description"),
      icon: varchar("icon", { length: 50 }),
      metaTitle: varchar("metaTitle", { length: 200 }),
      metaDescription: text("metaDescription"),
      keywords: varchar("keywords", { length: 500 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    isActiveEnum = pgEnum("is_active", ["true", "false"]);
    products = pgTable("products", {
      id: varchar("id", { length: 50 }).primaryKey(),
      name: varchar("name", { length: 200 }).notNull(),
      slug: varchar("slug", { length: 200 }).notNull().unique(),
      description: text("description"),
      brandId: varchar("brandId", { length: 50 }).notNull(),
      categoryId: varchar("categoryId", { length: 50 }).notNull(),
      basePrice: integer("basePrice").notNull(),
      // in kuruş (cents)
      rating: integer("rating").default(0),
      reviewCount: integer("reviewCount").default(0),
      imageUrl: varchar("imageUrl", { length: 500 }),
      tags: text("tags"),
      // JSON array
      nutritionFacts: text("nutritionFacts"),
      // JSON object
      servingSize: varchar("servingSize", { length: 50 }),
      servingsPerContainer: integer("servingsPerContainer"),
      usageInstructions: text("usageInstructions"),
      metaTitle: varchar("metaTitle", { length: 200 }),
      metaDescription: text("metaDescription"),
      keywords: varchar("keywords", { length: 500 }),
      isActive: isActiveEnum("isActive").default("true").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    productVariants = pgTable("product_variants", {
      id: varchar("id", { length: 50 }).primaryKey(),
      productId: varchar("productId", { length: 50 }).notNull(),
      sku: varchar("sku", { length: 100 }).notNull().unique(),
      name: varchar("name", { length: 100 }).notNull(),
      size: varchar("size", { length: 50 }),
      flavor: varchar("flavor", { length: 50 }),
      price: integer("price").notNull(),
      // in kuruş
      stock: integer("stock").default(0).notNull(),
      imageUrl: varchar("imageUrl", { length: 500 }),
      isActive: isActiveEnum("isActive").default("true").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    orderStatusEnum = pgEnum("order_status", [
      "pending",
      "confirmed",
      "preparing",
      "shipped",
      "delivered",
      "cancelled"
    ]);
    orders = pgTable("orders", {
      id: serial("id").primaryKey(),
      orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
      userId: integer("userId"),
      status: orderStatusEnum("status").default("pending").notNull(),
      customerName: varchar("customerName", { length: 200 }).notNull(),
      customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
      customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
      address: text("address").notNull(),
      city: varchar("city", { length: 100 }).notNull(),
      district: varchar("district", { length: 100 }),
      zipCode: varchar("zipCode", { length: 10 }),
      subtotal: integer("subtotal").notNull(),
      shippingCost: integer("shippingCost").notNull(),
      codFee: integer("codFee").default(0).notNull(),
      total: integer("total").notNull(),
      shippingMethod: varchar("shippingMethod", { length: 50 }).notNull(),
      paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
      trackingNumber: varchar("trackingNumber", { length: 100 }),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    orderItems = pgTable("order_items", {
      id: serial("id").primaryKey(),
      orderId: integer("orderId").notNull(),
      productId: varchar("productId", { length: 50 }).notNull(),
      variantId: varchar("variantId", { length: 50 }).notNull(),
      productName: varchar("productName", { length: 200 }).notNull(),
      variantName: varchar("variantName", { length: 100 }).notNull(),
      quantity: integer("quantity").notNull(),
      unitPrice: integer("unitPrice").notNull(),
      lineTotal: integer("lineTotal").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    isActiveYNEnum = pgEnum("is_active_yn", ["true", "false"]);
    isNotifiedEnum = pgEnum("is_notified", ["true", "false"]);
    newsletter = pgTable("newsletter", {
      id: serial("id").primaryKey(),
      email: varchar("email", { length: 320 }).notNull().unique(),
      isActive: isActiveYNEnum("isActive").default("true").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    stockAlerts = pgTable("stock_alerts", {
      id: serial("id").primaryKey(),
      productId: varchar("productId", { length: 50 }).notNull(),
      variantId: varchar("variantId", { length: 50 }),
      email: varchar("email", { length: 320 }).notNull(),
      isNotified: isNotifiedEnum("isNotified").default("false").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    wizardGoals = pgTable("wizard_goals", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      slug: varchar("slug", { length: 100 }).notNull().unique(),
      description: text("description"),
      icon: varchar("icon", { length: 50 }),
      sortOrder: integer("sortOrder").default(0).notNull(),
      isActive: isActiveEnum("isActive").default("true").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    wizardIngredients = pgTable("wizard_ingredients", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      slug: varchar("slug", { length: 100 }).notNull().unique(),
      description: text("description"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    goalIngredients = pgTable("goal_ingredients", {
      id: serial("id").primaryKey(),
      goalId: integer("goalId").notNull(),
      ingredientId: integer("ingredientId").notNull(),
      relevanceScore: integer("relevanceScore").default(5).notNull()
      // 1-10 scale
    });
    productIngredients = pgTable("product_ingredients", {
      id: serial("id").primaryKey(),
      productId: varchar("productId", { length: 50 }).notNull(),
      ingredientId: integer("ingredientId").notNull(),
      amountPerServing: varchar("amountPerServing", { length: 50 })
    });
    settingTypeEnum = pgEnum("setting_type", ["text", "image", "json", "boolean", "number"]);
    siteSettings = pgTable("site_settings", {
      id: serial("id").primaryKey(),
      settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
      settingValue: text("settingValue"),
      settingType: settingTypeEnum("settingType").default("text").notNull(),
      description: varchar("description", { length: 255 }),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    noIndexEnum = pgEnum("no_index", ["true", "false"]);
    pageSeo = pgTable("page_seo", {
      id: serial("id").primaryKey(),
      pageRoute: varchar("pageRoute", { length: 200 }).notNull().unique(),
      pageTitle: varchar("pageTitle", { length: 200 }),
      metaTitle: varchar("metaTitle", { length: 200 }),
      metaDescription: text("metaDescription"),
      ogImage: varchar("ogImage", { length: 500 }),
      keywords: varchar("keywords", { length: 500 }),
      noIndex: noIndexEnum("noIndex").default("false").notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    addedToCartEnum = pgEnum("added_to_cart", ["true", "false"]);
    wizardSessions = pgTable("wizard_sessions", {
      id: serial("id").primaryKey(),
      userId: integer("userId"),
      goalId: integer("goalId"),
      gender: varchar("gender", { length: 20 }),
      ageRange: varchar("ageRange", { length: 20 }),
      trainingFrequency: varchar("trainingFrequency", { length: 50 }),
      recommendedProducts: text("recommendedProducts"),
      // JSON array of product IDs
      addedToCart: addedToCartEnum("addedToCart").default("false").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    ibans = pgTable("ibans", {
      id: serial("id").primaryKey(),
      bankName: varchar("bankName", { length: 100 }).notNull(),
      iban: varchar("iban", { length: 50 }).notNull().unique(),
      accountHolder: varchar("accountHolder", { length: 200 }).notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  default: () => db_default,
  getCategories: () => getCategories,
  getDb: () => getDb,
  getProductBySlug: () => getProductBySlug,
  getProductVariants: () => getProductVariants,
  getProducts: () => getProducts,
  getUserByEmail: () => getUserByEmail,
  getUserById: () => getUserById,
  getUserByOpenId: () => getUserByOpenId,
  upsertUser: () => upsertUser
});
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
function getDb() {
  if (!_db) {
    if (!DATABASE_URL) {
      console.warn("[DB] DATABASE_URL not set \u2013 database features will be unavailable");
      return null;
    }
    const client = postgres(DATABASE_URL);
    _db = drizzle(client, { schema: schema_exports });
  }
  return _db;
}
async function upsertUser(data) {
  const db = getDb();
  if (!db) return;
  if (data.email) {
    const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (existing.length > 0) {
      await db.update(users).set({
        name: data.name ?? existing[0].name,
        lastSignedIn: data.lastSignedIn ?? /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(users.email, data.email));
    } else {
      await db.insert(users).values({
        openId: data.openId ?? data.email,
        email: data.email,
        passwordHash: data.passwordHash ?? null,
        name: data.name ?? null,
        loginMethod: data.loginMethod ?? "email",
        role: data.role ?? "user",
        lastSignedIn: data.lastSignedIn ?? /* @__PURE__ */ new Date()
      });
    }
    return;
  }
  if (data.openId) {
    const existing = await db.select().from(users).where(eq(users.openId, data.openId)).limit(1);
    if (existing.length > 0) {
      await db.update(users).set({
        name: data.name ?? existing[0].name,
        lastSignedIn: data.lastSignedIn ?? /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(users.openId, data.openId));
    } else {
      await db.insert(users).values({
        openId: data.openId,
        email: data.email ?? null,
        passwordHash: data.passwordHash ?? null,
        name: data.name ?? null,
        loginMethod: data.loginMethod ?? null,
        lastSignedIn: data.lastSignedIn ?? /* @__PURE__ */ new Date()
      });
    }
  }
}
async function getUserByOpenId(openId) {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return rows[0] ?? null;
}
async function getUserByEmail(email) {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}
async function getUserById(id) {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}
async function getCategories() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(categories);
}
async function getProducts() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(products);
}
async function getProductBySlug(slug) {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0] ?? null;
}
async function getProductVariants(productId) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(productVariants).where(eq(productVariants.productId, productId));
}
var DATABASE_URL, _db, db_default;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    DATABASE_URL = process.env.DATABASE_URL;
    _db = null;
    db_default = { upsertUser, getUserByOpenId, getUserByEmail, getUserById, getCategories, getProducts, getProductBySlug, getProductVariants, getDb };
  }
});

// server/_core/notification.ts
var notification_exports = {};
__export(notification_exports, {
  notifyOwner: () => notifyOwner
});
async function notifyOwner(payload) {
  const { title, content } = payload;
  console.log(`[Notification] ${title}`);
  console.log(`[Notification] ${content}`);
  return true;
}
var init_notification = __esm({
  "server/_core/notification.ts"() {
    "use strict";
  }
});

// server/_core/env.ts
var APP_ID, COOKIE_SECRET, DATABASE_URL2, JWT_SECRET2, OWNER_EMAIL, IS_PROD, ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    APP_ID = process.env.VITE_APP_ID ?? "supplement-store";
    COOKIE_SECRET = process.env.COOKIE_SECRET ?? process.env.JWT_SECRET ?? "dev-secret-change-in-production-min-32-chars!!";
    DATABASE_URL2 = process.env.DATABASE_URL ?? "";
    JWT_SECRET2 = process.env.JWT_SECRET ?? "dev-secret-change-in-production-min-32-chars!!";
    OWNER_EMAIL = process.env.OWNER_EMAIL ?? "admin@proteinmarket.com";
    IS_PROD = process.env.NODE_ENV === "production";
    ENV = {
      forgeApiUrl: process.env.FORGE_API_URL || "",
      forgeApiKey: process.env.FORGE_API_KEY || ""
    };
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  storageGet: () => storageGet,
  storagePut: () => storagePut
});
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
async function buildDownloadUrl(baseUrl, relKey, apiKey) {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey)
  });
  return (await response.json()).url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}
async function storageGet(relKey) {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey)
  };
}
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_env();
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/_core/oauth.ts
init_db();
import bcrypt from "bcryptjs";

// server/_core/sdk.ts
init_db();
import { SignJWT, jwtVerify } from "jose";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/sdk.ts
var JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production-min-32-chars!!";
function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}
async function createSessionToken(userId, email, role, expiresInMs = 365 * 24 * 60 * 60 * 1e3) {
  const token = await new SignJWT({ userId, email, role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(Date.now() + expiresInMs).sign(getSecretKey());
  return token;
}
async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
  } catch {
    return null;
  }
}
function parseCookies(cookieHeader) {
  const map = /* @__PURE__ */ new Map();
  if (!cookieHeader) return map;
  for (const pair of cookieHeader.split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    if (key) map.set(key.trim(), rest.join("=").trim());
  }
  return map;
}
async function authenticateRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionCookie = cookies.get(COOKIE_NAME);
  const session = await verifySession(sessionCookie);
  if (!session) {
    return null;
  }
  const user = await db_default.getUserById(session.userId);
  if (!user) {
    return null;
  }
  return user;
}
function getSessionCookieOptions(req) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/"
  };
}
var sdk_default = {
  createSessionToken,
  verifySession,
  authenticateRequest,
  getSessionCookieOptions
};

// server/_core/oauth.ts
var ONE_YEAR_MS2 = 365 * 24 * 60 * 60 * 1e3;
function registerAuthRoutes(app) {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "E-posta ve \u015Fifre gereklidir" });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ error: "\u015Eifre en az 6 karakter olmal\u0131d\u0131r" });
        return;
      }
      const existingUser = await db_default.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "Bu e-posta adresi zaten kay\u0131tl\u0131" });
        return;
      }
      const passwordHash = await bcrypt.hash(password, 12);
      await db_default.upsertUser({
        email,
        passwordHash,
        name: name || null,
        loginMethod: "email",
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const user = await db_default.getUserByEmail(email);
      if (!user) {
        res.status(500).json({ error: "Kullan\u0131c\u0131 olu\u015Fturulamad\u0131" });
        return;
      }
      const sessionToken = await sdk_default.createSessionToken(user.id, user.email, user.role);
      const cookieOptions = sdk_default.getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS2 });
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error("[Auth] Register failed:", error);
      res.status(500).json({ error: "Kay\u0131t ba\u015Far\u0131s\u0131z oldu" });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "E-posta ve \u015Fifre gereklidir" });
        return;
      }
      const user = await db_default.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "E-posta veya \u015Fifre hatal\u0131" });
        return;
      }
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: "E-posta veya \u015Fifre hatal\u0131" });
        return;
      }
      await db_default.upsertUser({
        email: user.email,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk_default.createSessionToken(user.id, user.email, user.role);
      const cookieOptions = sdk_default.getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS2 });
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Giri\u015F ba\u015Far\u0131s\u0131z oldu" });
    }
  });
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions2(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/payment.ts
import Iyzipay from "iyzipay";
var IYZICO_API_KEY = process.env.IYZICO_API_KEY || "sandbox-XXXXX";
var IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY || "sandbox-XXXXX";
var IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";
var iyzipay = new Iyzipay({
  apiKey: IYZICO_API_KEY,
  secretKey: IYZICO_SECRET_KEY,
  uri: IYZICO_BASE_URL
});
async function initializePayment(input) {
  return new Promise((resolve, reject) => {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: input.basketId,
      price: input.price,
      paidPrice: input.paidPrice,
      currency: input.currency || Iyzipay.CURRENCY.TRY,
      basketId: input.basketId,
      paymentGroup: input.paymentGroup || Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: input.callbackUrl,
      enabledInstallments: [2, 3, 6, 9],
      buyer: input.buyer,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress,
      basketItems: input.basketItems
    };
    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

// server/_core/systemRouter.ts
init_notification();
import { z } from "zod";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
import { eq as eq3, desc, and, like, sql, asc } from "drizzle-orm";
import { TRPCError as TRPCError2 } from "@trpc/server";
import bcrypt2 from "bcryptjs";

// server/_core/email.ts
init_db();
import nodemailer from "nodemailer";
import { eq as eq2 } from "drizzle-orm";
var transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true" || true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
async function sendOrderConfirmationEmail(order, items) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn("[Email] SMTP configuration missing. Email not sent.");
    return false;
  }
  let ibanHtml = "";
  if (order.paymentMethod === "bank_transfer") {
    const db = await getDb();
    if (db) {
      const { ibans: ibans2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const activeIbans = await db.select().from(ibans2).where(eq2(ibans2.isActive, true));
      if (activeIbans.length > 0) {
        ibanHtml = `
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #1e3a8a; margin-top: 0;">Havale / EFT Bilgileri</h3>
            <p>L\xFCtfen \xF6demenizi a\u015Fa\u011F\u0131daki hesaplardan birine yap\u0131n\u0131z ve a\xE7\u0131klama k\u0131sm\u0131na <strong>#${order.orderNumber}</strong> nolu sipari\u015F numaran\u0131z\u0131 yaz\u0131n\u0131z.</p>
            ${activeIbans.map((iban) => `
              <div style="margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
                <p style="margin: 5px 0;"><strong>Banka:</strong> ${iban.bankName}</p>
                <p style="margin: 5px 0; font-family: monospace;"><strong>IBAN:</strong> ${iban.iban}</p>
                <p style="margin: 5px 0; font-size: 12px;"><strong>Al\u0131c\u0131:</strong> ${iban.accountHolder}</p>
              </div>
            `).join("")}
          </div>
        `;
      } else {
        ibanHtml = `<p style="color: red; margin-top: 20px;">Aktif banka hesab\u0131 bulunamad\u0131. L\xFCtfen bizimle ileti\u015Fime ge\xE7in.</p>`;
      }
    }
  }
  const subject = `Sipari\u015Finiz Al\u0131nd\u0131 - #${order.orderNumber}`;
  const html = `
    <h1>Sipari\u015Finiz Al\u0131nd\u0131!</h1>
    <p>Merhaba ${order.customerName},</p>
    <p>Sipari\u015Finiz ba\u015Far\u0131yla olu\u015Fturuldu. \u0130\u015Fte detaylar:</p>
    
    <h2>Sipari\u015F No: ${order.orderNumber}</h2>
    <p>Tarih: ${(/* @__PURE__ */ new Date()).toLocaleDateString("tr-TR")}</p>
    
    <h3>\xDCr\xFCnler:</h3>
    <ul>
      ${items.map((item) => `
        <li>
          ${item.productName} (${item.variantName}) x ${item.quantity} - ${(item.lineTotal / 100).toFixed(2)} TL
        </li>
      `).join("")}
    </ul>
    
    <p><strong>Ara Toplam:</strong> ${(order.subtotal / 100).toFixed(2)} TL</p>
    <p><strong>Kargo:</strong> ${(order.shippingCost / 100).toFixed(2)} TL</p>
    <p><strong>Genel Toplam:</strong> ${(order.total / 100).toFixed(2)} TL</p>
    
    <p><strong>Adres:</strong> ${order.address} / ${order.city}</p>
    
    ${ibanHtml}
    
    <p>Bizi tercih etti\u011Finiz i\xE7in te\u015Fekk\xFCr ederiz.</p>
  `;
  try {
    await transporter.sendMail({
      from: `"ProteinMarket" <${process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject,
      html
    });
    console.log(`[Email] Order confirmation sent to ${order.customerEmail}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send email:`, error);
    return false;
  }
}

// server/routers.ts
function sanitizeString(str) {
  return str.replace(/<[^>]*>/g, "").replace(/[<>"'&]/g, (c) => {
    const map = { "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "&": "&amp;" };
    return map[c] || c;
  }).trim();
}
function generateOrderNumber() {
  const date = /* @__PURE__ */ new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PM${y}${m}${d}-${rand}`;
}
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError2({ code: "FORBIDDEN", message: "Admin yetkisi gerekli" });
  }
  return next({ ctx });
});
var appRouter = router({
  system: systemRouter,
  // ===== Auth Router =====
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    register: publicProcedure.input(z2.object({
      email: z2.string().email().max(320),
      password: z2.string().min(6).max(100),
      name: z2.string().min(2).max(100).optional()
    })).mutation(async ({ input, ctx }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
      const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const [existing] = await db.select().from(users2).where(eq3(users2.email, input.email)).limit(1);
      if (existing) {
        throw new TRPCError2({ code: "CONFLICT", message: "Bu e-posta adresi zaten kay\u0131tl\u0131." });
      }
      const passwordHash = await bcrypt2.hash(input.password, 10);
      const [user] = await db.insert(users2).values({
        email: input.email,
        passwordHash,
        name: input.name,
        role: "user",
        loginMethod: "email"
      }).returning();
      const token = await createSessionToken(user.id, user.email, user.role);
      const cookieOptions = getSessionCookieOptions2(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
      return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    }),
    login: publicProcedure.input(z2.object({
      email: z2.string().email(),
      password: z2.string()
    })).mutation(async ({ input, ctx }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
      const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const [user] = await db.select().from(users2).where(eq3(users2.email, input.email)).limit(1);
      if (!user || !user.passwordHash) {
        throw new TRPCError2({ code: "UNAUTHORIZED", message: "E-posta veya \u015Fifre hatal\u0131." });
      }
      const isValid = await bcrypt2.compare(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError2({ code: "UNAUTHORIZED", message: "E-posta veya \u015Fifre hatal\u0131." });
      }
      const token = await createSessionToken(user.id, user.email, user.role);
      const cookieOptions = getSessionCookieOptions2(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
      return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions2(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // ===== Products Router (Public) =====
  products: router({
    list: publicProcedure.input(z2.object({
      search: z2.string().optional(),
      categoryId: z2.string().optional(),
      brandId: z2.string().optional(),
      sortBy: z2.enum(["price_asc", "price_desc", "newest", "popular"]).optional(),
      limit: z2.number().min(1).max(100).default(50),
      offset: z2.number().min(0).default(0)
    }).optional()).query(async ({ input }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return { products: [], total: 0 };
      const { products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const conditions = [eq3(products2.isActive, "true")];
      if (input?.search) {
        conditions.push(like(products2.name, `%${input.search}%`));
      }
      if (input?.categoryId) {
        conditions.push(eq3(products2.categoryId, input.categoryId));
      }
      if (input?.brandId) {
        conditions.push(eq3(products2.brandId, input.brandId));
      }
      const whereClause = and(...conditions);
      const [countResult] = await db.select({ count: sql`count(*)` }).from(products2).where(whereClause);
      let orderClause;
      switch (input?.sortBy) {
        case "price_asc":
          orderClause = asc(products2.basePrice);
          break;
        case "price_desc":
          orderClause = desc(products2.basePrice);
          break;
        case "popular":
          orderClause = desc(products2.reviewCount);
          break;
        default:
          orderClause = desc(products2.createdAt);
      }
      const productList = await db.select().from(products2).where(whereClause).orderBy(orderClause).limit(input?.limit ?? 50).offset(input?.offset ?? 0);
      const { productVariants: productVariants2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const productsWithVariants = await Promise.all(
        productList.map(async (product) => {
          const variants = await db.select().from(productVariants2).where(and(eq3(productVariants2.productId, product.id), eq3(productVariants2.isActive, "true"))).orderBy(asc(productVariants2.price));
          return { ...product, variants };
        })
      );
      return { products: productsWithVariants, total: countResult?.count ?? 0 };
    }),
    bySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      const { getProductBySlug: getProductBySlug2, getProductVariants: getProductVariants2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const product = await getProductBySlug2(input.slug);
      if (!product) return null;
      const variants = await getProductVariants2(product.id);
      return { ...product, variants };
    }),
    byCategory: publicProcedure.input(z2.object({ categoryId: z2.string() })).query(async ({ input }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = getDb2();
      if (!db) return [];
      const { products: products2, productVariants: productVariants2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const productList = await db.select().from(products2).where(and(eq3(products2.categoryId, input.categoryId), eq3(products2.isActive, "true"))).orderBy(desc(products2.createdAt));
      const productsWithVariants = await Promise.all(
        productList.map(async (product) => {
          const variants = await db.select().from(productVariants2).where(and(eq3(productVariants2.productId, product.id), eq3(productVariants2.isActive, "true"))).orderBy(asc(productVariants2.price));
          return { ...product, variants };
        })
      );
      return productsWithVariants;
    })
  }),
  // ===== Categories Router (Public) =====
  categories: router({
    list: publicProcedure.query(async () => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = getDb2();
      if (!db) return [];
      const { categories: categories2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      return await db.select().from(categories2);
    })
  }),
  // ===== Site Settings Router (Public read, Admin write) =====
  settings: router({
    get: publicProcedure.input(z2.object({ key: z2.string() })).query(async ({ input }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return null;
      const { siteSettings: siteSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const [setting] = await db.select().from(siteSettings2).where(eq3(siteSettings2.settingKey, input.key)).limit(1);
      return setting || null;
    }),
    getAll: publicProcedure.query(async () => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return [];
      const { siteSettings: siteSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      return await db.select().from(siteSettings2);
    }),
    update: adminProcedure2.input(z2.object({
      key: z2.string().min(1).max(100),
      value: z2.string().max(1e4).nullable(),
      type: z2.enum(["text", "image", "json", "boolean", "number"]).optional(),
      description: z2.string().max(255).optional()
    })).mutation(async ({ input }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
      const { siteSettings: siteSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const [existing] = await db.select().from(siteSettings2).where(eq3(siteSettings2.settingKey, input.key)).limit(1);
      if (existing) {
        await db.update(siteSettings2).set({
          settingValue: input.value,
          ...input.type && { settingType: input.type },
          ...input.description && { description: input.description }
        }).where(eq3(siteSettings2.settingKey, input.key));
      } else {
        await db.insert(siteSettings2).values({
          settingKey: input.key,
          settingValue: input.value,
          settingType: input.type || "text",
          description: input.description || null
        });
      }
      console.log(`[Admin] Setting updated: ${input.key}`);
      return { success: true };
    })
  }),
  // ===== Page SEO Router (Public read, Admin write) =====
  seo: router({
    getByRoute: publicProcedure.input(z2.object({ route: z2.string() })).query(async ({ input }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return null;
      const { pageSeo: pageSeo2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const [seo] = await db.select().from(pageSeo2).where(eq3(pageSeo2.pageRoute, input.route)).limit(1);
      return seo || null;
    }),
    list: adminProcedure2.query(async () => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return [];
      const { pageSeo: pageSeo2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      return await db.select().from(pageSeo2);
    }),
    upsert: adminProcedure2.input(z2.object({
      pageRoute: z2.string().min(1).max(200),
      pageTitle: z2.string().max(200).optional(),
      metaTitle: z2.string().max(200).optional(),
      metaDescription: z2.string().max(500).optional(),
      ogImage: z2.string().max(500).optional(),
      keywords: z2.string().max(500).optional(),
      noIndex: z2.enum(["true", "false"]).optional()
    })).mutation(async ({ input }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
      const { pageSeo: pageSeo2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const [existing] = await db.select().from(pageSeo2).where(eq3(pageSeo2.pageRoute, input.pageRoute)).limit(1);
      if (existing) {
        const { pageRoute, ...updateData } = input;
        const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== void 0));
        if (Object.keys(cleanData).length > 0) {
          await db.update(pageSeo2).set(cleanData).where(eq3(pageSeo2.pageRoute, pageRoute));
        }
      } else {
        await db.insert(pageSeo2).values({
          pageRoute: input.pageRoute,
          pageTitle: input.pageTitle || null,
          metaTitle: input.metaTitle || null,
          metaDescription: input.metaDescription || null,
          ogImage: input.ogImage || null,
          keywords: input.keywords || null,
          noIndex: input.noIndex || "false"
        });
      }
      console.log(`[Admin] SEO updated for: ${input.pageRoute}`);
      return { success: true };
    })
  }),
  // ===== Wizard Router (Public) =====
  wizard: router({
    goals: publicProcedure.query(async () => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return [];
      const { wizardGoals: wizardGoals2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      return await db.select().from(wizardGoals2).where(eq3(wizardGoals2.isActive, "true")).orderBy(asc(wizardGoals2.sortOrder));
    }),
    recommend: publicProcedure.input(z2.object({
      goalId: z2.number(),
      gender: z2.string().optional(),
      ageRange: z2.string().optional(),
      trainingFrequency: z2.string().optional()
    })).query(async ({ input }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return { ingredients: [], products: [] };
      const { goalIngredients: goalIngredients2, wizardIngredients: wizardIngredients2, productIngredients: productIngredients2, products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const goalIngs = await db.select({
        ingredientId: goalIngredients2.ingredientId,
        relevanceScore: goalIngredients2.relevanceScore,
        ingredientName: wizardIngredients2.name,
        ingredientSlug: wizardIngredients2.slug
      }).from(goalIngredients2).innerJoin(wizardIngredients2, eq3(goalIngredients2.ingredientId, wizardIngredients2.id)).where(eq3(goalIngredients2.goalId, input.goalId)).orderBy(desc(goalIngredients2.relevanceScore));
      const ingredientIds = goalIngs.map((g) => g.ingredientId);
      if (ingredientIds.length === 0) return { ingredients: goalIngs, products: [] };
      const matchingProducts = await db.select({
        productId: productIngredients2.productId,
        ingredientId: productIngredients2.ingredientId,
        productName: products2.name,
        productSlug: products2.slug,
        productPrice: products2.basePrice,
        productImage: products2.imageUrl,
        productCategory: products2.categoryId
      }).from(productIngredients2).innerJoin(products2, eq3(productIngredients2.productId, products2.id)).where(and(
        sql`${productIngredients2.ingredientId} IN (${sql.join(ingredientIds.map((id) => sql`${id}`), sql`, `)})`,
        eq3(products2.isActive, "true")
      ));
      return { ingredients: goalIngs, products: matchingProducts };
    }),
    saveSession: publicProcedure.input(z2.object({
      goalId: z2.number(),
      gender: z2.string().optional(),
      ageRange: z2.string().optional(),
      trainingFrequency: z2.string().optional(),
      recommendedProducts: z2.string().optional(),
      addedToCart: z2.enum(["true", "false"]).optional()
    })).mutation(async ({ input, ctx }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return { success: false };
      const { wizardSessions: wizardSessions2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      await db.insert(wizardSessions2).values({
        userId: ctx.user?.id || null,
        goalId: input.goalId,
        gender: input.gender || null,
        ageRange: input.ageRange || null,
        trainingFrequency: input.trainingFrequency || null,
        recommendedProducts: input.recommendedProducts || null,
        addedToCart: input.addedToCart || "false"
      });
      return { success: true };
    })
  }),
  // ===== IBANS Router (Public) =====
  ibans: router({
    list: publicProcedure.query(async () => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return [];
      const { ibans: ibans2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      return await db.select().from(ibans2).where(eq3(ibans2.isActive, true));
    })
  }),
  // ===== Order Router (Public create, Protected history) =====
  order: router({
    create: publicProcedure.input(z2.object({
      customerName: z2.string().min(2).max(200).transform(sanitizeString),
      customerEmail: z2.string().email().max(320),
      customerPhone: z2.string().min(10).max(20).regex(/^[0-9+\-\s()]+$/),
      address: z2.string().min(10).max(1e3).transform(sanitizeString),
      city: z2.string().min(2).max(100).transform(sanitizeString),
      district: z2.string().max(100).optional().transform((v) => v ? sanitizeString(v) : v),
      zipCode: z2.string().max(10).optional(),
      shippingMethod: z2.enum(["standard", "express"]),
      paymentMethod: z2.enum(["cod", "credit_card", "bank_transfer"]),
      notes: z2.string().max(500).optional().transform((v) => v ? sanitizeString(v) : v),
      items: z2.array(z2.object({
        productId: z2.string(),
        variantId: z2.string(),
        productName: z2.string().max(200),
        variantName: z2.string().max(100),
        quantity: z2.number().int().min(1).max(50),
        unitPrice: z2.number().int().min(0)
      })).min(1).max(50),
      acceptedTerms: z2.boolean().refine((v) => v === true, { message: "S\xF6zle\u015Fmeleri kabul etmelisiniz" }),
      acceptedPrivacy: z2.boolean().refine((v) => v === true, { message: "Gizlilik politikas\u0131n\u0131 kabul etmelisiniz" })
    })).mutation(async ({ input, ctx }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "Veritaban\u0131 ba\u011Flant\u0131s\u0131 yok" });
      const { orders: orders2, orderItems: orderItems2, productVariants: productVariants2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      let subtotal = 0;
      for (const item of input.items) {
        const [variant] = await db.select().from(productVariants2).where(eq3(productVariants2.id, item.variantId)).limit(1);
        if (!variant) {
          throw new TRPCError2({ code: "BAD_REQUEST", message: `\xDCr\xFCn varyant\u0131 bulunamad\u0131: ${item.variantId}` });
        }
        if (variant.stock < item.quantity) {
          throw new TRPCError2({ code: "BAD_REQUEST", message: `Yetersiz stok: ${item.productName} (${variant.stock} adet kald\u0131)` });
        }
        subtotal += variant.price * item.quantity;
      }
      const shippingCost = subtotal >= 5e4 ? 0 : input.shippingMethod === "express" ? 4999 : 2999;
      const codFee = input.paymentMethod === "cod" ? 999 : 0;
      const total = subtotal + shippingCost + codFee;
      const orderNumber = generateOrderNumber();
      const [orderResult] = await db.insert(orders2).values({
        orderNumber,
        userId: ctx.user?.id || null,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        address: input.address,
        city: input.city,
        district: input.district || null,
        zipCode: input.zipCode || null,
        subtotal,
        shippingCost,
        codFee,
        total,
        shippingMethod: input.shippingMethod,
        paymentMethod: input.paymentMethod,
        notes: input.notes || null
      }).returning({ id: orders2.id });
      const orderId = orderResult.id;
      for (const item of input.items) {
        const [variant] = await db.select().from(productVariants2).where(eq3(productVariants2.id, item.variantId)).limit(1);
        await db.insert(orderItems2).values({
          orderId,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: variant.price,
          lineTotal: variant.price * item.quantity
        });
        await db.update(productVariants2).set({
          stock: sql`${productVariants2.stock} - ${item.quantity}`
        }).where(eq3(productVariants2.id, item.variantId));
      }
      console.log(`[Order] New order created: ${orderNumber} (Total: ${total} kuru\u015F)`);
      try {
        const { notifyOwner: notifyOwner2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
        await notifyOwner2({
          title: `Yeni Sipari\u015F: ${orderNumber}`,
          content: `${input.customerName} - ${input.items.length} \xFCr\xFCn - \u20BA${(total / 100).toFixed(2)}`
        });
      } catch (e) {
        console.warn("[Order] Owner notification failed:", e);
      }
      try {
        const [fullOrder] = await db.select().from(orders2).where(eq3(orders2.id, orderId)).limit(1);
        const fullItems = await db.select().from(orderItems2).where(eq3(orderItems2.orderId, orderId));
        if (fullOrder && fullItems.length > 0) {
          await sendOrderConfirmationEmail(fullOrder, fullItems);
        }
      } catch (e) {
        console.error("[Order] Email notification failed:", e);
      }
      let paymentHtml = null;
      if (input.paymentMethod === "credit_card") {
        try {
          const buyerName = input.customerName.split(" ").slice(0, -1).join(" ") || input.customerName;
          const buyerSurname = input.customerName.split(" ").slice(-1).join(" ") || "Musteri";
          const paymentRequest = {
            price: (total / 100).toFixed(2),
            paidPrice: (total / 100).toFixed(2),
            basketId: orderNumber,
            callbackUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/api/payment/callback`,
            buyer: {
              id: ctx.user?.id || "guest",
              name: buyerName,
              surname: buyerSurname,
              gsmNumber: input.customerPhone,
              email: input.customerEmail,
              identityNumber: "11111111111",
              // Dummy ID for guest
              lastLoginDate: "2023-01-01 12:00:00",
              registrationDate: "2023-01-01 12:00:00",
              registrationAddress: input.address,
              ip: ctx.req?.ip || "127.0.0.1",
              city: input.city,
              country: "Turkey",
              zipCode: input.zipCode || "34000"
            },
            billingAddress: {
              contactName: input.customerName,
              city: input.city,
              country: "Turkey",
              address: input.address,
              zipCode: input.zipCode || "34000"
            },
            shippingAddress: {
              contactName: input.customerName,
              city: input.city,
              country: "Turkey",
              address: input.address,
              zipCode: input.zipCode || "34000"
            },
            basketItems: input.items.map((item) => ({
              id: item.productId,
              name: item.productName,
              category1: "Supplement",
              itemType: "PHYSICAL",
              price: (item.unitPrice / 100).toFixed(2)
            }))
          };
          const paymentResult = await initializePayment(paymentRequest);
          if (paymentResult.status === "success") {
            paymentHtml = paymentResult.checkoutFormContent;
          } else {
            console.error("[Iyzipay] Init failed:", paymentResult.errorMessage);
          }
        } catch (err) {
          console.error("[Iyzipay] Error:", err);
        }
      }
      return {
        success: true,
        orderNumber,
        total,
        subtotal,
        shippingCost,
        codFee,
        paymentHtml
      };
    }),
    // User order history
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return [];
      const { orders: orders2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      return await db.select().from(orders2).where(eq3(orders2.userId, ctx.user.id)).orderBy(desc(orders2.createdAt));
    }),
    // Track order by number (public)
    track: publicProcedure.input(z2.object({ orderNumber: z2.string().min(1) })).query(async ({ input }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return null;
      const { orders: orders2, orderItems: orderItems2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const [order] = await db.select({
        orderNumber: orders2.orderNumber,
        status: orders2.status,
        trackingNumber: orders2.trackingNumber,
        shippingMethod: orders2.shippingMethod,
        total: orders2.total,
        createdAt: orders2.createdAt
      }).from(orders2).where(eq3(orders2.orderNumber, input.orderNumber)).limit(1);
      if (!order) return null;
      return order;
    })
  }),
  // ===== Newsletter Router (Public) =====
  newsletter: router({
    subscribe: publicProcedure.input(z2.object({
      email: z2.string().email().max(320).transform((s) => s.toLowerCase().trim())
    })).mutation(async ({ input }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
      const { newsletter: newsletter2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      try {
        await db.insert(newsletter2).values({ email: input.email });
      } catch (e) {
        if (e?.code === "23505") {
          return { success: true, message: "Zaten kay\u0131tl\u0131s\u0131n\u0131z!" };
        }
        throw e;
      }
      console.log(`[Newsletter] New subscriber: ${input.email}`);
      return { success: true, message: "Ba\u015Far\u0131yla abone oldunuz!" };
    })
  }),
  // ===== Contact Router (Public) =====
  contact: router({
    send: publicProcedure.input(z2.object({
      name: z2.string().min(2).max(100).transform(sanitizeString),
      email: z2.string().email().max(320),
      subject: z2.string().min(2).max(200).transform(sanitizeString),
      message: z2.string().min(10).max(5e3).transform(sanitizeString)
    })).mutation(async ({ input }) => {
      try {
        const { notifyOwner: notifyOwner2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
        await notifyOwner2({
          title: `\u0130leti\u015Fim: ${input.subject}`,
          content: `${input.name} (${input.email})

${input.message}`
        });
      } catch (e) {
        console.warn("[Contact] Notification failed:", e);
      }
      console.log(`[Contact] Message from: ${input.name} (${input.email})`);
      return { success: true, message: "Mesaj\u0131n\u0131z al\u0131nd\u0131, en k\u0131sa s\xFCrede d\xF6n\xFC\u015F yapaca\u011F\u0131z." };
    })
  }),
  // ===== Stock Alert Router (Public) =====
  stockAlert: router({
    create: publicProcedure.input(z2.object({
      productId: z2.string().min(1),
      variantId: z2.string().optional(),
      email: z2.string().email().max(320)
    })).mutation(async ({ input }) => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
      const { stockAlerts: stockAlerts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      await db.insert(stockAlerts2).values({
        productId: input.productId,
        variantId: input.variantId || null,
        email: input.email
      });
      console.log(`[StockAlert] Alert created for product ${input.productId}`);
      return { success: true, message: "Stok uyar\u0131s\u0131 olu\u015Fturuldu!" };
    })
  }),
  // ===== File Upload Router (Admin) =====
  upload: router({
    image: adminProcedure2.input(z2.object({
      fileName: z2.string().min(1).max(200),
      base64Data: z2.string().min(1),
      contentType: z2.string().default("image/jpeg"),
      folder: z2.string().default("uploads")
    })).mutation(async ({ input }) => {
      const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const buffer = Buffer.from(input.base64Data, "base64");
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `${input.folder}/${randomSuffix}-${input.fileName}`;
      const { url } = await storagePut2(fileKey, buffer, input.contentType);
      console.log(`[Upload] File uploaded: ${fileKey}`);
      return { success: true, url, key: fileKey };
    })
  }),
  // ===== Admin Router (RBAC Protected) =====
  admin: router({
    // Dashboard stats
    dashboard: adminProcedure2.query(async () => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return { orders: 0, revenue: 0, customers: 0, products: 0, recentOrders: [], lowStockProducts: [], todayOrders: 0, todayRevenue: 0 };
      const { orders: orders2, users: users2, products: products2, productVariants: productVariants2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const [orderStats] = await db.select({
        count: sql`count(*)`,
        revenue: sql`COALESCE(sum(${orders2.total}), 0)`
      }).from(orders2);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const [todayStats] = await db.select({
        count: sql`count(*)`,
        revenue: sql`COALESCE(sum(${orders2.total}), 0)`
      }).from(orders2).where(sql`${orders2.createdAt} >= ${today}`);
      const [customerStats] = await db.select({
        count: sql`count(*)`
      }).from(users2);
      const [productStats] = await db.select({
        count: sql`count(*)`
      }).from(products2).where(eq3(products2.isActive, "true"));
      const recentOrders = await db.select().from(orders2).orderBy(desc(orders2.createdAt)).limit(10);
      const lowStockVariants = await db.select({
        variantId: productVariants2.id,
        variantName: productVariants2.name,
        productId: productVariants2.productId,
        stock: productVariants2.stock,
        sku: productVariants2.sku
      }).from(productVariants2).where(and(eq3(productVariants2.isActive, "true"), sql`${productVariants2.stock} <= 10`)).orderBy(productVariants2.stock).limit(20);
      return {
        orders: orderStats?.count ?? 0,
        revenue: orderStats?.revenue ?? 0,
        customers: customerStats?.count ?? 0,
        products: productStats?.count ?? 0,
        recentOrders,
        lowStockProducts: lowStockVariants,
        todayOrders: todayStats?.count ?? 0,
        todayRevenue: todayStats?.revenue ?? 0
      };
    }),
    // Orders management
    orders: router({
      list: adminProcedure2.input(z2.object({
        status: z2.string().optional(),
        search: z2.string().optional(),
        limit: z2.number().min(1).max(100).default(50),
        offset: z2.number().min(0).default(0)
      }).optional()).query(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) return { orders: [], total: 0 };
        const { orders: orders2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const conditions = [];
        if (input?.status) {
          conditions.push(eq3(orders2.status, input.status));
        }
        if (input?.search) {
          conditions.push(
            sql`(${orders2.orderNumber} LIKE ${`%${input.search}%`} OR ${orders2.customerName} LIKE ${`%${input.search}%`} OR ${orders2.customerEmail} LIKE ${`%${input.search}%`})`
          );
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
        const [countResult] = await db.select({ count: sql`count(*)` }).from(orders2).where(whereClause);
        const orderList = await db.select().from(orders2).where(whereClause).orderBy(desc(orders2.createdAt)).limit(input?.limit ?? 50).offset(input?.offset ?? 0);
        return { orders: orderList, total: countResult?.count ?? 0 };
      }),
      updateStatus: adminProcedure2.input(z2.object({
        orderId: z2.number(),
        status: z2.enum(["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"]),
        trackingNumber: z2.string().optional()
      })).mutation(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
        const { orders: orders2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const updateData = { status: input.status };
        if (input.trackingNumber) updateData.trackingNumber = input.trackingNumber;
        await db.update(orders2).set(updateData).where(eq3(orders2.id, input.orderId));
        console.log(`[Admin] Order ${input.orderId} status \u2192 ${input.status}`);
        return { success: true };
      }),
      getDetail: adminProcedure2.input(z2.object({ orderId: z2.number() })).query(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) return null;
        const { orders: orders2, orderItems: orderItems2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const [order] = await db.select().from(orders2).where(eq3(orders2.id, input.orderId)).limit(1);
        if (!order) return null;
        const items = await db.select().from(orderItems2).where(eq3(orderItems2.orderId, input.orderId));
        return { ...order, items };
      })
    }),
    // Products management
    products: router({
      list: adminProcedure2.input(z2.object({
        search: z2.string().optional(),
        categoryId: z2.string().optional(),
        limit: z2.number().min(1).max(100).default(50),
        offset: z2.number().min(0).default(0)
      }).optional()).query(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) return { products: [], total: 0 };
        const { products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        let query = db.select().from(products2);
        const conditions = [];
        if (input?.search) {
          conditions.push(like(products2.name, `%${input.search}%`));
        }
        if (input?.categoryId) {
          conditions.push(eq3(products2.categoryId, input.categoryId));
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
        const [countResult] = await db.select({ count: sql`count(*)` }).from(products2).where(whereClause);
        const productList = await query.where(whereClause).orderBy(desc(products2.createdAt)).limit(input?.limit ?? 50).offset(input?.offset ?? 0);
        return { products: productList, total: countResult?.count ?? 0 };
      }),
      create: adminProcedure2.input(z2.object({
        name: z2.string().min(2).max(200).transform(sanitizeString),
        slug: z2.string().min(2).max(200),
        description: z2.string().max(5e3).optional().transform((v) => v ? sanitizeString(v) : v),
        brandId: z2.string().min(1),
        categoryId: z2.string().min(1),
        basePrice: z2.number().min(0),
        imageUrl: z2.string().max(500).optional(),
        tags: z2.string().optional(),
        nutritionFacts: z2.string().optional(),
        metaTitle: z2.string().max(200).optional(),
        metaDescription: z2.string().max(500).optional(),
        keywords: z2.string().max(500).optional()
      })).mutation(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
        const { products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const id = `prod_${Date.now()}`;
        await db.insert(products2).values({
          id,
          name: input.name,
          slug: input.slug,
          description: input.description || null,
          brandId: input.brandId,
          categoryId: input.categoryId,
          basePrice: input.basePrice,
          imageUrl: input.imageUrl || null,
          tags: input.tags || null,
          nutritionFacts: input.nutritionFacts || null,
          metaTitle: input.metaTitle || null,
          metaDescription: input.metaDescription || null,
          keywords: input.keywords || null
        });
        console.log(`[Admin] Product created: ${input.name} (${id})`);
        return { success: true, id };
      }),
      update: adminProcedure2.input(z2.object({
        id: z2.string(),
        name: z2.string().min(2).max(200).transform(sanitizeString).optional(),
        description: z2.string().max(5e3).optional().transform((v) => v ? sanitizeString(v) : v),
        basePrice: z2.number().min(0).optional(),
        imageUrl: z2.string().max(500).optional(),
        isActive: z2.enum(["true", "false"]).optional(),
        tags: z2.string().optional(),
        nutritionFacts: z2.string().optional(),
        metaTitle: z2.string().max(200).optional(),
        metaDescription: z2.string().max(500).optional(),
        keywords: z2.string().max(500).optional()
      })).mutation(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
        const { products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { id, ...updateData } = input;
        const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== void 0));
        if (Object.keys(cleanData).length > 0) {
          await db.update(products2).set(cleanData).where(eq3(products2.id, id));
        }
        console.log(`[Admin] Product updated: ${id}`);
        return { success: true };
      }),
      delete: adminProcedure2.input(z2.object({ id: z2.string() })).mutation(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
        const { products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        await db.update(products2).set({ isActive: "false" }).where(eq3(products2.id, input.id));
        console.log(`[Admin] Product deactivated: ${input.id}`);
        return { success: true };
      })
    }),
    // Stock management
    stock: router({
      updateVariant: adminProcedure2.input(z2.object({
        variantId: z2.string(),
        stock: z2.number().int().min(0),
        price: z2.number().min(0).optional()
      })).mutation(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
        const { productVariants: productVariants2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const updateData = { stock: input.stock };
        if (input.price !== void 0) updateData.price = input.price;
        await db.update(productVariants2).set(updateData).where(eq3(productVariants2.id, input.variantId));
        console.log(`[Admin] Variant ${input.variantId} stock \u2192 ${input.stock}`);
        return { success: true };
      }),
      getVariants: adminProcedure2.input(z2.object({ productId: z2.string() })).query(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) return [];
        const { productVariants: productVariants2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        return await db.select().from(productVariants2).where(eq3(productVariants2.productId, input.productId));
      })
    }),
    // Customers management
    customers: router({
      list: adminProcedure2.input(z2.object({
        search: z2.string().optional(),
        limit: z2.number().min(1).max(100).default(50),
        offset: z2.number().min(0).default(0)
      }).optional()).query(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) return { customers: [], total: 0 };
        const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const conditions = [];
        if (input?.search) {
          conditions.push(
            sql`(${users2.name} LIKE ${`%${input.search}%`} OR ${users2.email} LIKE ${`%${input.search}%`})`
          );
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
        const [countResult] = await db.select({ count: sql`count(*)` }).from(users2).where(whereClause);
        const customerList = await db.select({
          id: users2.id,
          name: users2.name,
          email: users2.email,
          role: users2.role,
          createdAt: users2.createdAt,
          lastSignedIn: users2.lastSignedIn
        }).from(users2).where(whereClause).orderBy(desc(users2.createdAt)).limit(input?.limit ?? 50).offset(input?.offset ?? 0);
        return { customers: customerList, total: countResult?.count ?? 0 };
      })
    }),
    // Newsletter subscribers
    newsletterList: adminProcedure2.query(async () => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return [];
      const { newsletter: newsletter2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      return await db.select().from(newsletter2).where(eq3(newsletter2.isActive, "true")).orderBy(desc(newsletter2.createdAt));
    }),
    // Stock alerts
    stockAlertsList: adminProcedure2.query(async () => {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) return [];
      const { stockAlerts: stockAlerts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      return await db.select().from(stockAlerts2).orderBy(desc(stockAlerts2.createdAt));
    }),
    // Site settings management
    settings: router({
      list: adminProcedure2.query(async () => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) return [];
        const { siteSettings: siteSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        return await db.select().from(siteSettings2);
      }),
      update: adminProcedure2.input(z2.object({
        key: z2.string().min(1).max(100),
        value: z2.string().max(1e4).nullable()
      })).mutation(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
        const { siteSettings: siteSettings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        await db.update(siteSettings2).set({ settingValue: input.value }).where(eq3(siteSettings2.settingKey, input.key));
        console.log(`[Admin] Setting updated: ${input.key}`);
        return { success: true };
      })
    }),
    // SEO management
    seo: router({
      list: adminProcedure2.query(async () => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) return [];
        const { pageSeo: pageSeo2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        return await db.select().from(pageSeo2);
      }),
      upsert: adminProcedure2.input(z2.object({
        pageRoute: z2.string().min(1).max(200),
        pageTitle: z2.string().max(200).optional(),
        metaTitle: z2.string().max(200).optional(),
        metaDescription: z2.string().max(500).optional(),
        ogImage: z2.string().max(500).optional(),
        keywords: z2.string().max(500).optional(),
        noIndex: z2.enum(["true", "false"]).optional()
      })).mutation(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
        const { pageSeo: pageSeo2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const [existing] = await db.select().from(pageSeo2).where(eq3(pageSeo2.pageRoute, input.pageRoute)).limit(1);
        if (existing) {
          const { pageRoute, ...updateData } = input;
          const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== void 0));
          if (Object.keys(cleanData).length > 0) {
            await db.update(pageSeo2).set(cleanData).where(eq3(pageSeo2.pageRoute, pageRoute));
          }
        } else {
          await db.insert(pageSeo2).values({
            pageRoute: input.pageRoute,
            pageTitle: input.pageTitle || null,
            metaTitle: input.metaTitle || null,
            metaDescription: input.metaDescription || null,
            ogImage: input.ogImage || null,
            keywords: input.keywords || null,
            noIndex: input.noIndex || "false"
          });
        }
        console.log(`[Admin] SEO updated for: ${input.pageRoute}`);
        return { success: true };
      })
    }),
    // Wizard management
    wizard: router({
      goals: adminProcedure2.query(async () => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) return [];
        const { wizardGoals: wizardGoals2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        return await db.select().from(wizardGoals2).orderBy(asc(wizardGoals2.sortOrder));
      }),
      sessions: adminProcedure2.input(z2.object({ limit: z2.number().min(1).max(100).default(50) }).optional()).query(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) return [];
        const { wizardSessions: wizardSessions2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        return await db.select().from(wizardSessions2).orderBy(desc(wizardSessions2.createdAt)).limit(input?.limit ?? 50);
      })
    }),
    // IBAN Management
    ibans: router({
      list: adminProcedure2.query(async () => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) return [];
        const { ibans: ibans2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        return await db.select().from(ibans2).orderBy(desc(ibans2.createdAt));
      }),
      create: adminProcedure2.input(z2.object({
        bankName: z2.string().min(2).max(100),
        iban: z2.string().min(15).max(50),
        accountHolder: z2.string().min(2).max(200)
      })).mutation(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
        const { ibans: ibans2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        await db.insert(ibans2).values({
          bankName: input.bankName,
          iban: input.iban,
          accountHolder: input.accountHolder
        });
        return { success: true };
      }),
      toggle: adminProcedure2.input(z2.object({
        id: z2.number(),
        isActive: z2.boolean()
      })).mutation(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
        const { ibans: ibans2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        await db.update(ibans2).set({ isActive: input.isActive }).where(eq3(ibans2.id, input.id));
        return { success: true };
      }),
      delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "DB ba\u011Flant\u0131s\u0131 yok" });
        const { ibans: ibans2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        await db.delete(ibans2).where(eq3(ibans2.id, input.id));
        return { success: true };
      })
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1"
    ]
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
import cors from "cors";
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  const corsOptions = {
    origin: process.env.NODE_ENV === "production" ? [process.env.FRONTEND_URL].filter((url) => typeof url === "string") : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  };
  app.use(cors(corsOptions));
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app.get("/api/status", (req, res) => {
    res.status(200).json({
      status: "running",
      version: "1.0.0",
      endpoints: {
        health: "/api/health",
        trpc: "/api/trpc",
        auth: {
          register: "/api/auth/register",
          login: "/api/auth/login"
        }
      }
    });
  });
  registerAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
