import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, like, desc, asc, sql, or } from "drizzle-orm";
import { getDb } from "./db";
import {
  users, categories, brands, products, productVariants,
  orders, orderItems, newsletter, stockAlerts,
  siteSettings, pageSeo, ibans, legalPages,
  contactMessages, turkeyProvinces, turkeyDistricts,
  quizQuestions, quizOptions, campaigns, siteAnalytics,
} from "../drizzle/schema";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";

// ==================== HELPERS ====================
function sanitizeString(str: string) {
  return str.replace(/<[^>]*>/g, "").replace(/[<>"'&]/g, (c) => {
    const map: Record<string, string> = { "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "&": "&amp;" };
    return map[c] || c;
  }).trim();
}

function generateOrderNumber() {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PM${y}${m}${d}-${rand}`;
}

export const appRouter = router({
  system: systemRouter,

  // ==================== AUTH ====================
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== PRODUCTS (Public) ====================
  products: router({
    list: publicProcedure.input(z.object({
      search: z.string().optional(),
      categoryId: z.number().optional(),
      brandId: z.number().optional(),
      sortBy: z.enum(["price_asc", "price_desc", "newest", "popular"]).optional(),
      limit: z.number().min(1).max(100).default(24),
      offset: z.number().min(0).default(0),
      featured: z.boolean().optional(),
    }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { products: [], total: 0 };
      const conditions = [eq(products.isActive, true)];
      if (input?.search) conditions.push(like(products.name, `%${input.search}%`));
      if (input?.categoryId) conditions.push(eq(products.categoryId, input.categoryId));
      if (input?.brandId) conditions.push(eq(products.brandId, input.brandId));
      if (input?.featured) conditions.push(eq(products.isFeatured, true));
      const whereClause = and(...conditions);
      const [countResult] = await db.select({ count: sql`count(*)` }).from(products).where(whereClause);
      let orderClause;
      switch (input?.sortBy) {
        case "price_asc": orderClause = asc(products.basePrice); break;
        case "price_desc": orderClause = desc(products.basePrice); break;
        case "popular": orderClause = desc(products.reviewCount); break;
        default: orderClause = desc(products.createdAt);
      }
      const productList = await db.select().from(products).where(whereClause).orderBy(orderClause).limit(input?.limit ?? 24).offset(input?.offset ?? 0);
      const productsWithVariants = await Promise.all(
        productList.map(async (product) => {
          const variants = await db.select().from(productVariants)
            .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
            .orderBy(asc(productVariants.price));
          return { ...product, variants };
        })
      );
      return { products: productsWithVariants, total: Number(countResult?.count ?? 0) };
    }),

    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [product] = await db.select().from(products).where(eq(products.slug, input.slug)).limit(1);
      if (!product) return null;
      const variants = await db.select().from(productVariants)
        .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
        .orderBy(asc(productVariants.price));
      const brand = await db.select().from(brands).where(eq(brands.id, product.brandId)).limit(1);
      const category = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);
      return { ...product, variants, brand: brand[0], category: category[0] };
    }),

    byCategory: publicProcedure.input(z.object({ categorySlug: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { products: [], category: null };
      const [cat] = await db.select().from(categories).where(eq(categories.slug, input.categorySlug)).limit(1);
      if (!cat) return { products: [], category: null };
      const productList = await db.select().from(products)
        .where(and(eq(products.categoryId, cat.id), eq(products.isActive, true)))
        .orderBy(desc(products.createdAt));
      const productsWithVariants = await Promise.all(
        productList.map(async (product) => {
          const variants = await db.select().from(productVariants)
            .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
            .orderBy(asc(productVariants.price));
          return { ...product, variants };
        })
      );
      return { products: productsWithVariants, category: cat };
    }),

    byBrand: publicProcedure.input(z.object({ brandSlug: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { products: [], brand: null };
      const [br] = await db.select().from(brands).where(eq(brands.slug, input.brandSlug)).limit(1);
      if (!br) return { products: [], brand: null };
      const productList = await db.select().from(products)
        .where(and(eq(products.brandId, br.id), eq(products.isActive, true)))
        .orderBy(desc(products.createdAt));
      const productsWithVariants = await Promise.all(
        productList.map(async (product) => {
          const variants = await db.select().from(productVariants)
            .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
            .orderBy(asc(productVariants.price));
          return { ...product, variants };
        })
      );
      return { products: productsWithVariants, brand: br };
    }),
  }),

  // ==================== CATEGORIES (Public) ====================
  categories: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));
    }),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [cat] = await db.select().from(categories).where(eq(categories.slug, input.slug)).limit(1);
      return cat || null;
    }),
  }),

  // ==================== BRANDS (Public) ====================
  brands: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(brands).where(eq(brands.isActive, true)).orderBy(asc(brands.sortOrder));
    }),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [br] = await db.select().from(brands).where(eq(brands.slug, input.slug)).limit(1);
      return br || null;
    }),
  }),

  // ==================== SITE SETTINGS (Public read) ====================
  settings: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(siteSettings);
    }),
    byKey: publicProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, input.key)).limit(1);
      return setting || null;
    }),
  }),

  // ==================== SEO (Public) ====================
  seo: router({
    byRoute: publicProcedure.input(z.object({ route: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [seo] = await db.select().from(pageSeo).where(eq(pageSeo.pageRoute, input.route)).limit(1);
      return seo || null;
    }),
  }),

  // ==================== IBAN (Public) ====================
  iban: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(ibans).where(eq(ibans.isActive, true));
    }),
  }),

  // ==================== LEGAL PAGES (Public) ====================
  legal: router({
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [page] = await db.select().from(legalPages).where(and(eq(legalPages.slug, input.slug), eq(legalPages.isActive, true))).limit(1);
      return page || null;
    }),
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ slug: legalPages.slug, title: legalPages.title }).from(legalPages).where(eq(legalPages.isActive, true));
    }),
  }),

  // ==================== LOCATIONS (Public) ====================
  locations: router({
    provinces: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(turkeyProvinces).orderBy(asc(turkeyProvinces.name));
    }),
    districts: publicProcedure.input(z.object({ provinceId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(turkeyDistricts).where(eq(turkeyDistricts.provinceId, input.provinceId)).orderBy(asc(turkeyDistricts.name));
    }),
  }),

  // ==================== ORDER (Public create, Protected history) ====================
  order: router({
    create: publicProcedure.input(z.object({
      customerName: z.string().min(2).max(200).transform(sanitizeString),
      customerEmail: z.string().email().max(320),
      customerPhone: z.string().min(10).max(20),
      address: z.string().min(10).max(1000).transform(sanitizeString),
      city: z.string().min(2).max(100).transform(sanitizeString),
      district: z.string().max(100).optional(),
      zipCode: z.string().max(10).optional(),
      shippingMethod: z.enum(["standard", "express"]),
      paymentMethod: z.enum(["cod", "credit_card", "bank_transfer"]),
      notes: z.string().max(500).optional(),
      items: z.array(z.object({
        productId: z.number(),
        variantId: z.number(),
        productName: z.string().max(200),
        variantName: z.string().max(100),
        quantity: z.number().int().min(1).max(50),
        unitPrice: z.number().int().min(0),
      })).min(1).max(50),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Veritabanı bağlantısı yok" });

      // Server-side price/stock verification
      let subtotal = 0;
      for (const item of input.items) {
        const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, item.variantId)).limit(1);
        if (!variant) throw new TRPCError({ code: "BAD_REQUEST", message: `Ürün varyantı bulunamadı: ${item.variantId}` });
        if (variant.stock < item.quantity) throw new TRPCError({ code: "BAD_REQUEST", message: `Yetersiz stok: ${item.productName} (${variant.stock} adet kaldı)` });
        subtotal += variant.price * item.quantity;
      }

      const shippingCost = subtotal >= 50000 ? 0 : input.shippingMethod === "express" ? 4999 : 2999;
      const codFee = input.paymentMethod === "cod" ? 999 : 0;
      const total = subtotal + shippingCost + codFee;
      const orderNumber = generateOrderNumber();

      const [orderResult] = await db.insert(orders).values({
        orderNumber,
        userId: ctx.user?.id || null,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        address: input.address,
        city: input.city,
        district: input.district || null,
        zipCode: input.zipCode || null,
        subtotal, shippingCost, codFee, total,
        shippingMethod: input.shippingMethod,
        paymentMethod: input.paymentMethod,
        notes: input.notes || null,
      }).$returningId();

      const orderId = orderResult.id;

      for (const item of input.items) {
        const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, item.variantId)).limit(1);
        await db.insert(orderItems).values({
          orderId, productId: item.productId, variantId: item.variantId,
          productName: item.productName, variantName: item.variantName,
          quantity: item.quantity, unitPrice: variant!.price,
          lineTotal: variant!.price * item.quantity,
        });
        await db.update(productVariants).set({
          stock: sql`${productVariants.stock} - ${item.quantity}`,
        }).where(eq(productVariants.id, item.variantId));
      }

      try {
        await notifyOwner({ title: `Yeni Sipariş: ${orderNumber}`, content: `${input.customerName} - ${input.items.length} ürün - ₺${(total / 100).toFixed(2)}` });
      } catch (e) { console.warn("[Order] Notification failed:", e); }

      return { success: true, orderNumber, total, subtotal, shippingCost, codFee };
    }),

    track: publicProcedure.input(z.object({ orderNumber: z.string().min(1) })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [order] = await db.select({
        orderNumber: orders.orderNumber, status: orders.status,
        trackingNumber: orders.trackingNumber, trackingUrl: orders.trackingUrl,
        shippingMethod: orders.shippingMethod, total: orders.total, createdAt: orders.createdAt,
      }).from(orders).where(eq(orders.orderNumber, input.orderNumber)).limit(1);
      return order || null;
    }),

    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(orders).where(eq(orders.userId, ctx.user.id)).orderBy(desc(orders.createdAt));
    }),
  }),

  // ==================== NEWSLETTER (Public) ====================
  newsletter: router({
    subscribe: publicProcedure.input(z.object({
      email: z.string().email().max(320),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
      try {
        await db.insert(newsletter).values({ email: input.email.toLowerCase().trim() });
      } catch (e: any) {
        if (e?.code === "ER_DUP_ENTRY") return { success: true, message: "Zaten kayıtlısınız!" };
        throw e;
      }
      return { success: true, message: "Başarıyla abone oldunuz!" };
    }),
  }),

  // ==================== CONTACT (Public) ====================
  contact: router({
    send: publicProcedure.input(z.object({
      name: z.string().min(2).max(100).transform(sanitizeString),
      email: z.string().email().max(320),
      subject: z.string().min(2).max(200).transform(sanitizeString),
      message: z.string().min(10).max(5000).transform(sanitizeString),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
      await db.insert(contactMessages).values(input);
      try {
        await notifyOwner({ title: `İletişim: ${input.subject}`, content: `${input.name} (${input.email})\n\n${input.message}` });
      } catch (e) { console.warn("[Contact] Notification failed:", e); }
      return { success: true, message: "Mesajınız alındı, en kısa sürede dönüş yapacağız." };
    }),
  }),

  // ==================== QUIZ (Public) ====================
  quiz: router({
    questions: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const questions = await db.select().from(quizQuestions)
        .where(eq(quizQuestions.isActive, true))
        .orderBy(asc(quizQuestions.sortOrder));
      const questionsWithOptions = await Promise.all(
        questions.map(async (q) => {
          const options = await db.select().from(quizOptions)
            .where(eq(quizOptions.questionId, q.id))
            .orderBy(asc(quizOptions.sortOrder));
          return { ...q, options };
        })
      );
      return questionsWithOptions;
    }),
    getRecommendations: publicProcedure.input(z.object({
      answers: z.array(z.object({
        questionId: z.number(),
        optionIds: z.array(z.number()),
      })),
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      // Collect all category IDs and tags from selected options
      const allCategoryIds = new Set<number>();
      const allTags = new Set<string>();
      for (const answer of input.answers) {
        for (const optionId of answer.optionIds) {
          const [option] = await db.select().from(quizOptions).where(eq(quizOptions.id, optionId)).limit(1);
          if (option) {
            const catIds = option.categoryIds as number[] | null;
            if (catIds && Array.isArray(catIds)) catIds.forEach(id => allCategoryIds.add(id));
            const tags = option.tagFilters as string[] | null;
            if (tags && Array.isArray(tags)) tags.forEach(t => allTags.add(t));
          }
        }
      }
      // Find products matching categories
      const conditions = [eq(products.isActive, true)];
      if (allCategoryIds.size > 0) {
        conditions.push(sql`${products.categoryId} IN (${sql.join(Array.from(allCategoryIds).map(id => sql`${id}`), sql`, `)})`);
      }
      const productList = await db.select().from(products)
        .where(and(...conditions))
        .orderBy(desc(products.isFeatured), desc(products.reviewCount))
        .limit(12);
      const productsWithVariants = await Promise.all(
        productList.map(async (product) => {
          const variants = await db.select().from(productVariants)
            .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
            .orderBy(asc(productVariants.price));
          return { ...product, variants };
        })
      );
      return productsWithVariants;
    }),
  }),

  // ==================== CAMPAIGNS (Public) ====================
  campaigns: router({
    active: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const now = new Date();
      return db.select().from(campaigns)
        .where(and(
          eq(campaigns.isActive, true),
          or(
            sql`${campaigns.startsAt} IS NULL`,
            sql`${campaigns.startsAt} <= ${now}`
          ),
          or(
            sql`${campaigns.endsAt} IS NULL`,
            sql`${campaigns.endsAt} >= ${now}`
          )
        ))
        .orderBy(desc(campaigns.priority));
    }),
    // Calculate applicable campaigns for a cart
    calculate: publicProcedure.input(z.object({
      items: z.array(z.object({
        productId: z.number(),
        variantId: z.number(),
        categoryId: z.number(),
        quantity: z.number(),
        unitPrice: z.number(),
      })),
      subtotal: z.number(),
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { appliedCampaigns: [], totalDiscount: 0, gifts: [] };
      const now = new Date();
      const activeCampaigns = await db.select().from(campaigns)
        .where(and(
          eq(campaigns.isActive, true),
          or(sql`${campaigns.startsAt} IS NULL`, sql`${campaigns.startsAt} <= ${now}`),
          or(sql`${campaigns.endsAt} IS NULL`, sql`${campaigns.endsAt} >= ${now}`)
        ))
        .orderBy(desc(campaigns.priority));

      const appliedCampaigns: { id: number; name: string; description: string | null; ruleType: string; discount: number; gift?: string; giftImage?: string }[] = [];
      let totalDiscount = 0;
      const gifts: { name: string; image: string | null }[] = [];

      for (const campaign of activeCampaigns) {
        switch (campaign.ruleType) {
          case "min_cart_gift": {
            if (campaign.minCartAmount && input.subtotal >= campaign.minCartAmount) {
              appliedCampaigns.push({ id: campaign.id, name: campaign.name, description: campaign.description, ruleType: campaign.ruleType, discount: 0, gift: campaign.giftProductName || undefined, giftImage: campaign.giftProductImage || undefined });
              if (campaign.giftProductName) gifts.push({ name: campaign.giftProductName, image: campaign.giftProductImage });
            }
            break;
          }
          case "buy_x_get_y": {
            if (campaign.requiredCategoryId && campaign.requiredProductCount) {
              const categoryItems = input.items.filter(i => i.categoryId === campaign.requiredCategoryId);
              const totalQty = categoryItems.reduce((sum, i) => sum + i.quantity, 0);
              if (totalQty >= campaign.requiredProductCount) {
                // Cheapest item free
                const cheapest = categoryItems.reduce((min, i) => i.unitPrice < min.unitPrice ? i : min, categoryItems[0]);
                if (cheapest) {
                  totalDiscount += cheapest.unitPrice;
                  appliedCampaigns.push({ id: campaign.id, name: campaign.name, description: campaign.description, ruleType: campaign.ruleType, discount: cheapest.unitPrice });
                }
              }
            }
            break;
          }
          case "cart_discount_percent": {
            if (campaign.discountPercent && (!campaign.minCartAmount || input.subtotal >= campaign.minCartAmount)) {
              const disc = Math.floor(input.subtotal * campaign.discountPercent / 100);
              totalDiscount += disc;
              appliedCampaigns.push({ id: campaign.id, name: campaign.name, description: campaign.description, ruleType: campaign.ruleType, discount: disc });
            }
            break;
          }
          case "cart_discount_amount": {
            if (campaign.discountAmount && (!campaign.minCartAmount || input.subtotal >= campaign.minCartAmount)) {
              totalDiscount += campaign.discountAmount;
              appliedCampaigns.push({ id: campaign.id, name: campaign.name, description: campaign.description, ruleType: campaign.ruleType, discount: campaign.discountAmount });
            }
            break;
          }
          case "free_shipping": {
            if (!campaign.minCartAmount || input.subtotal >= campaign.minCartAmount) {
              appliedCampaigns.push({ id: campaign.id, name: campaign.name, description: campaign.description, ruleType: campaign.ruleType, discount: 0 });
            }
            break;
          }
        }
      }
      return { appliedCampaigns, totalDiscount, gifts };
    }),
  }),

  // ==================== ANALYTICS (Public track) ====================
  analytics: router({
    track: publicProcedure.input(z.object({
      eventType: z.enum(["page_view", "add_to_cart", "checkout_start", "order_complete"]),
      sessionId: z.string().max(100).optional(),
      metadata: z.any().optional(),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: true };
      await db.insert(siteAnalytics).values({
        eventType: input.eventType,
        sessionId: input.sessionId || null,
        userId: ctx.user?.id || null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      });
      return { success: true };
    }),
  }),

  // ==================== STOCK ALERT (Public) ====================
  stockAlert: router({
    create: publicProcedure.input(z.object({
      productId: z.number(),
      variantId: z.number().optional(),
      email: z.string().email().max(320),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
      await db.insert(stockAlerts).values({
        productId: input.productId, variantId: input.variantId || null, email: input.email,
      });
      return { success: true, message: "Stok uyarısı oluşturuldu!" };
    }),
  }),

  // ==================== FILE UPLOAD (Admin) ====================
  upload: router({
    image: adminProcedure.input(z.object({
      fileName: z.string().min(1).max(200),
      base64Data: z.string().min(1),
      contentType: z.string().default("image/jpeg"),
      folder: z.string().default("uploads"),
    })).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64Data, "base64");
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `${input.folder}/${randomSuffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.contentType);
      return { success: true, url, key: fileKey };
    }),
  }),

  // ==================== ADMIN ====================
  admin: router({
    // Dashboard
    dashboard: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { orders: 0, revenue: 0, customers: 0, products: 0, recentOrders: [], lowStockProducts: [], todayOrders: 0, todayRevenue: 0 };
      const [orderStats] = await db.select({ count: sql`count(*)`, revenue: sql`COALESCE(sum(${orders.total}), 0)` }).from(orders);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const [todayStats] = await db.select({ count: sql`count(*)`, revenue: sql`COALESCE(sum(${orders.total}), 0)` }).from(orders).where(sql`${orders.createdAt} >= ${today}`);
      const [customerStats] = await db.select({ count: sql`count(*)` }).from(users);
      const [productStats] = await db.select({ count: sql`count(*)` }).from(products).where(eq(products.isActive, true));
      const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10);
      const lowStockVariants = await db.select({
        variantId: productVariants.id, variantName: productVariants.name,
        productId: productVariants.productId, stock: productVariants.stock, sku: productVariants.sku,
      }).from(productVariants).where(and(eq(productVariants.isActive, true), sql`${productVariants.stock} <= 10`)).orderBy(asc(productVariants.stock)).limit(20);
      return {
        orders: Number(orderStats?.count ?? 0), revenue: Number(orderStats?.revenue ?? 0),
        customers: Number(customerStats?.count ?? 0), products: Number(productStats?.count ?? 0),
        recentOrders, lowStockProducts: lowStockVariants,
        todayOrders: Number(todayStats?.count ?? 0), todayRevenue: Number(todayStats?.revenue ?? 0),
      };
    }),

    // Orders management
    orders: router({
      list: adminProcedure.input(z.object({
        status: z.string().optional(), search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50), offset: z.number().min(0).default(0),
      }).optional()).query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { orders: [], total: 0 };
        const conditions: any[] = [];
        if (input?.status) conditions.push(eq(orders.status, input.status as any));
        if (input?.search) conditions.push(or(like(orders.orderNumber, `%${input.search}%`), like(orders.customerName, `%${input.search}%`)));
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const [countResult] = await db.select({ count: sql`count(*)` }).from(orders).where(whereClause);
        const orderList = await db.select().from(orders).where(whereClause).orderBy(desc(orders.createdAt)).limit(input?.limit ?? 50).offset(input?.offset ?? 0);
        return { orders: orderList, total: Number(countResult?.count ?? 0) };
      }),
      updateStatus: adminProcedure.input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "paid", "confirmed", "preparing", "shipped", "delivered", "cancelled", "refunded"]),
        trackingNumber: z.string().optional(),
        trackingUrl: z.string().optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const updateData: any = { status: input.status };
        if (input.trackingNumber) updateData.trackingNumber = input.trackingNumber;
        if (input.trackingUrl) updateData.trackingUrl = input.trackingUrl;
        await db.update(orders).set(updateData).where(eq(orders.id, input.orderId));
        return { success: true };
      }),
      getDetail: adminProcedure.input(z.object({ orderId: z.number() })).query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
        if (!order) return null;
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, input.orderId));
        return { ...order, items };
      }),
    }),

    // Products management
    products: router({
      list: adminProcedure.input(z.object({
        search: z.string().optional(), categoryId: z.number().optional(),
        limit: z.number().min(1).max(100).default(50), offset: z.number().min(0).default(0),
      }).optional()).query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { products: [], total: 0 };
        const conditions: any[] = [];
        if (input?.search) conditions.push(like(products.name, `%${input.search}%`));
        if (input?.categoryId) conditions.push(eq(products.categoryId, input.categoryId));
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const [countResult] = await db.select({ count: sql`count(*)` }).from(products).where(whereClause);
        const productList = await db.select().from(products).where(whereClause).orderBy(desc(products.createdAt)).limit(input?.limit ?? 50).offset(input?.offset ?? 0);
        return { products: productList, total: Number(countResult?.count ?? 0) };
      }),
      create: adminProcedure.input(z.object({
        name: z.string().min(2).max(200),
        slug: z.string().min(2).max(200),
        description: z.string().optional(),
        shortDescription: z.string().max(500).optional(),
        brandId: z.number(),
        categoryId: z.number(),
        basePrice: z.number().min(0),
        imageUrl: z.string().max(500).optional(),
        images: z.any().optional(),
        tags: z.any().optional(),
        nutritionFacts: z.any().optional(),
        servingSize: z.string().optional(),
        servingsPerContainer: z.number().optional(),
        servingsCount: z.number().optional(),
        ratingScore: z.number().min(0).max(100).optional(),
        usageInstructions: z.string().optional(),
        isFeatured: z.boolean().optional(),
        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().optional(),
        keywords: z.string().max(500).optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const [result] = await db.insert(products).values({
          ...input,
          images: input.images ? JSON.stringify(input.images) : null,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          nutritionFacts: input.nutritionFacts ? JSON.stringify(input.nutritionFacts) : null,
        } as any).$returningId();
        return { success: true, id: result.id };
      }),
      update: adminProcedure.input(z.object({
        id: z.number(),
        name: z.string().min(2).max(200).optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().max(500).optional(),
        brandId: z.number().optional(),
        categoryId: z.number().optional(),
        basePrice: z.number().min(0).optional(),
        imageUrl: z.string().max(500).optional(),
        images: z.any().optional(),
        tags: z.any().optional(),
        nutritionFacts: z.any().optional(),
        servingsCount: z.number().optional(),
        ratingScore: z.number().min(0).max(100).optional(),
        isFeatured: z.boolean().optional(),
        isActive: z.boolean().optional(),
        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().optional(),
        keywords: z.string().max(500).optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const { id, ...updateData } = input;
        const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));
        if (cleanData.images) cleanData.images = JSON.stringify(cleanData.images);
        if (cleanData.tags) cleanData.tags = JSON.stringify(cleanData.tags);
        if (cleanData.nutritionFacts) cleanData.nutritionFacts = JSON.stringify(cleanData.nutritionFacts);
        if (Object.keys(cleanData).length > 0) {
          await db.update(products).set(cleanData).where(eq(products.id, id));
        }
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        await db.update(products).set({ isActive: false }).where(eq(products.id, input.id));
        return { success: true };
      }),
    }),

    // Variants management
    variants: router({
      list: adminProcedure.input(z.object({ productId: z.number() })).query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(productVariants).where(eq(productVariants.productId, input.productId)).orderBy(asc(productVariants.price));
      }),
      create: adminProcedure.input(z.object({
        productId: z.number(), sku: z.string().min(1).max(100),
        name: z.string().min(1).max(100), flavor: z.string().optional(),
        size: z.string().optional(), attributes: z.any().optional(),
        price: z.number().min(0), compareAtPrice: z.number().optional(),
        stock: z.number().int().min(0).default(0), imageUrl: z.string().optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const [result] = await db.insert(productVariants).values({
          ...input,
          attributes: input.attributes ? JSON.stringify(input.attributes) : null,
        } as any).$returningId();
        return { success: true, id: result.id };
      }),
      update: adminProcedure.input(z.object({
        id: z.number(), name: z.string().optional(), flavor: z.string().optional(),
        size: z.string().optional(), price: z.number().optional(),
        compareAtPrice: z.number().nullable().optional(),
        stock: z.number().int().min(0).optional(), isActive: z.boolean().optional(),
        imageUrl: z.string().optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const { id, ...updateData } = input;
        const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));
        if (Object.keys(cleanData).length > 0) {
          await db.update(productVariants).set(cleanData).where(eq(productVariants.id, id));
        }
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        await db.update(productVariants).set({ isActive: false }).where(eq(productVariants.id, input.id));
        return { success: true };
      }),
    }),

    // Categories management
    categories: router({
      list: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(categories).orderBy(asc(categories.sortOrder));
      }),
      create: adminProcedure.input(z.object({
        name: z.string().min(2).max(100), slug: z.string().min(2).max(100),
        description: z.string().optional(), icon: z.string().optional(),
        imageUrl: z.string().optional(), parentId: z.number().optional(),
        sortOrder: z.number().default(0),
        metaTitle: z.string().optional(), metaDescription: z.string().optional(),
        keywords: z.string().optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const [result] = await db.insert(categories).values(input as any).$returningId();
        return { success: true, id: result.id };
      }),
      update: adminProcedure.input(z.object({
        id: z.number(), name: z.string().optional(), slug: z.string().optional(),
        description: z.string().optional(), icon: z.string().optional(),
        imageUrl: z.string().optional(), sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
        metaTitle: z.string().optional(), metaDescription: z.string().optional(),
        keywords: z.string().optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const { id, ...updateData } = input;
        const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));
        if (Object.keys(cleanData).length > 0) {
          await db.update(categories).set(cleanData).where(eq(categories.id, id));
        }
        return { success: true };
      }),
    }),

    // Brands management
    brands: router({
      list: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(brands).orderBy(asc(brands.sortOrder));
      }),
      create: adminProcedure.input(z.object({
        name: z.string().min(2).max(100), slug: z.string().min(2).max(100),
        description: z.string().optional(), logoUrl: z.string().optional(),
        sortOrder: z.number().default(0),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const [result] = await db.insert(brands).values(input as any).$returningId();
        return { success: true, id: result.id };
      }),
      update: adminProcedure.input(z.object({
        id: z.number(), name: z.string().optional(), slug: z.string().optional(),
        description: z.string().optional(), logoUrl: z.string().optional(),
        sortOrder: z.number().optional(), isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const { id, ...updateData } = input;
        const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));
        if (Object.keys(cleanData).length > 0) {
          await db.update(brands).set(cleanData).where(eq(brands.id, id));
        }
        return { success: true };
      }),
    }),

    // Customers
    customers: router({
      list: adminProcedure.input(z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50), offset: z.number().min(0).default(0),
      }).optional()).query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { customers: [], total: 0 };
        const conditions: any[] = [];
        if (input?.search) conditions.push(or(like(users.name, `%${input.search}%`), like(users.email, `%${input.search}%`)));
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const [countResult] = await db.select({ count: sql`count(*)` }).from(users).where(whereClause);
        const customerList = await db.select({
          id: users.id, name: users.name, email: users.email,
          role: users.role, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn,
        }).from(users).where(whereClause).orderBy(desc(users.createdAt)).limit(input?.limit ?? 50).offset(input?.offset ?? 0);
        return { customers: customerList, total: Number(countResult?.count ?? 0) };
      }),
    }),

    // Newsletter
    newsletterList: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(newsletter).where(eq(newsletter.isActive, true)).orderBy(desc(newsletter.createdAt));
    }),

    // Stock alerts
    stockAlertsList: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(stockAlerts).orderBy(desc(stockAlerts.createdAt));
    }),

    // Contact messages
    contactMessages: router({
      list: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
      }),
      markRead: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        await db.update(contactMessages).set({ isRead: true }).where(eq(contactMessages.id, input.id));
        return { success: true };
      }),
    }),

    // Site settings
    settings: router({
      list: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(siteSettings);
      }),
      upsert: adminProcedure.input(z.object({
        key: z.string().min(1).max(100),
        value: z.string().max(10000).nullable(),
        type: z.enum(["text", "image", "json", "boolean", "number", "color"]).default("text"),
        description: z.string().max(255).optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, input.key)).limit(1);
        if (existing) {
          await db.update(siteSettings).set({ settingValue: input.value, settingType: input.type }).where(eq(siteSettings.settingKey, input.key));
        } else {
          await db.insert(siteSettings).values({
            settingKey: input.key, settingValue: input.value,
            settingType: input.type, description: input.description || null,
          });
        }
        return { success: true };
      }),
    }),

    // SEO management
    seo: router({
      list: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(pageSeo);
      }),
      upsert: adminProcedure.input(z.object({
        pageRoute: z.string().min(1).max(200),
        pageTitle: z.string().max(200).optional(),
        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().optional(),
        ogImage: z.string().max(500).optional(),
        keywords: z.string().max(500).optional(),
        noIndex: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const [existing] = await db.select().from(pageSeo).where(eq(pageSeo.pageRoute, input.pageRoute)).limit(1);
        if (existing) {
          const { pageRoute, ...updateData } = input;
          const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));
          if (Object.keys(cleanData).length > 0) {
            await db.update(pageSeo).set(cleanData).where(eq(pageSeo.pageRoute, pageRoute));
          }
        } else {
          await db.insert(pageSeo).values(input as any);
        }
        return { success: true };
      }),
    }),

    // IBAN management
    ibans: router({
      list: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(ibans).orderBy(desc(ibans.createdAt));
      }),
      create: adminProcedure.input(z.object({
        bankName: z.string().min(2).max(100),
        iban: z.string().min(15).max(50),
        accountHolder: z.string().min(2).max(200),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        await db.insert(ibans).values(input);
        return { success: true };
      }),
      toggle: adminProcedure.input(z.object({ id: z.number(), isActive: z.boolean() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        await db.update(ibans).set({ isActive: input.isActive }).where(eq(ibans.id, input.id));
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        await db.delete(ibans).where(eq(ibans.id, input.id));
        return { success: true };
      }),
    }),

    // Quiz management
    quiz: router({
      questions: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        const questions = await db.select().from(quizQuestions).orderBy(asc(quizQuestions.sortOrder));
        const questionsWithOptions = await Promise.all(
          questions.map(async (q) => {
            const options = await db.select().from(quizOptions)
              .where(eq(quizOptions.questionId, q.id))
              .orderBy(asc(quizOptions.sortOrder));
            return { ...q, options };
          })
        );
        return questionsWithOptions;
      }),
      createQuestion: adminProcedure.input(z.object({
        questionText: z.string().min(2).max(500),
        questionType: z.enum(["single", "multiple"]).default("single"),
        sortOrder: z.number().default(0),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const [result] = await db.insert(quizQuestions).values(input as any).$returningId();
        return { success: true, id: result.id };
      }),
      updateQuestion: adminProcedure.input(z.object({
        id: z.number(),
        questionText: z.string().optional(),
        questionType: z.enum(["single", "multiple"]).optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const { id, ...updateData } = input;
        const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));
        if (Object.keys(cleanData).length > 0) {
          await db.update(quizQuestions).set(cleanData).where(eq(quizQuestions.id, id));
        }
        return { success: true };
      }),
      deleteQuestion: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        await db.delete(quizOptions).where(eq(quizOptions.questionId, input.id));
        await db.delete(quizQuestions).where(eq(quizQuestions.id, input.id));
        return { success: true };
      }),
      createOption: adminProcedure.input(z.object({
        questionId: z.number(),
        optionText: z.string().min(1).max(200),
        optionIcon: z.string().optional(),
        categoryIds: z.array(z.number()).optional(),
        tagFilters: z.array(z.string()).optional(),
        sortOrder: z.number().default(0),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const [result] = await db.insert(quizOptions).values({
          ...input,
          categoryIds: input.categoryIds ? JSON.stringify(input.categoryIds) : null,
          tagFilters: input.tagFilters ? JSON.stringify(input.tagFilters) : null,
        } as any).$returningId();
        return { success: true, id: result.id };
      }),
      updateOption: adminProcedure.input(z.object({
        id: z.number(),
        optionText: z.string().optional(),
        optionIcon: z.string().optional(),
        categoryIds: z.array(z.number()).optional(),
        tagFilters: z.array(z.string()).optional(),
        sortOrder: z.number().optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const { id, ...updateData } = input;
        const cleanData: any = {};
        for (const [k, v] of Object.entries(updateData)) {
          if (v !== undefined) {
            cleanData[k] = (k === "categoryIds" || k === "tagFilters") ? JSON.stringify(v) : v;
          }
        }
        if (Object.keys(cleanData).length > 0) {
          await db.update(quizOptions).set(cleanData).where(eq(quizOptions.id, id));
        }
        return { success: true };
      }),
      deleteOption: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        await db.delete(quizOptions).where(eq(quizOptions.id, input.id));
        return { success: true };
      }),
    }),

    // Campaign management
    campaigns: router({
      list: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(campaigns).orderBy(desc(campaigns.priority));
      }),
      create: adminProcedure.input(z.object({
        name: z.string().min(2).max(200),
        description: z.string().optional(),
        ruleType: z.enum(["min_cart_gift", "buy_x_get_y", "cart_discount_percent", "cart_discount_amount", "free_shipping"]),
        minCartAmount: z.number().optional(),
        requiredCategoryId: z.number().optional(),
        requiredProductCount: z.number().optional(),
        discountPercent: z.number().optional(),
        discountAmount: z.number().optional(),
        giftProductName: z.string().optional(),
        giftProductImage: z.string().optional(),
        priority: z.number().default(0),
        startsAt: z.string().optional(),
        endsAt: z.string().optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const [result] = await db.insert(campaigns).values({
          ...input,
          startsAt: input.startsAt ? new Date(input.startsAt) : null,
          endsAt: input.endsAt ? new Date(input.endsAt) : null,
        } as any).$returningId();
        return { success: true, id: result.id };
      }),
      update: adminProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        ruleType: z.enum(["min_cart_gift", "buy_x_get_y", "cart_discount_percent", "cart_discount_amount", "free_shipping"]).optional(),
        minCartAmount: z.number().nullable().optional(),
        requiredCategoryId: z.number().nullable().optional(),
        requiredProductCount: z.number().nullable().optional(),
        discountPercent: z.number().nullable().optional(),
        discountAmount: z.number().nullable().optional(),
        giftProductName: z.string().nullable().optional(),
        giftProductImage: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
        priority: z.number().optional(),
        startsAt: z.string().nullable().optional(),
        endsAt: z.string().nullable().optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const { id, ...updateData } = input;
        const cleanData: any = {};
        for (const [k, v] of Object.entries(updateData)) {
          if (v !== undefined) {
            if ((k === "startsAt" || k === "endsAt") && v) cleanData[k] = new Date(v as string);
            else cleanData[k] = v;
          }
        }
        if (Object.keys(cleanData).length > 0) {
          await db.update(campaigns).set(cleanData).where(eq(campaigns.id, id));
        }
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        await db.delete(campaigns).where(eq(campaigns.id, input.id));
        return { success: true };
      }),
    }),

    // Analytics / Sales Funnel
    analytics: router({
      funnel: adminProcedure.input(z.object({
        days: z.number().min(1).max(90).default(30),
      }).optional()).query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { pageViews: 0, addToCart: 0, checkoutStart: 0, orderComplete: 0, dailyStats: [] };
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - (input?.days ?? 30));
        const [pageViews] = await db.select({ count: sql`count(*)` }).from(siteAnalytics).where(and(eq(siteAnalytics.eventType, "page_view"), sql`${siteAnalytics.createdAt} >= ${daysAgo}`));
        const [addToCart] = await db.select({ count: sql`count(*)` }).from(siteAnalytics).where(and(eq(siteAnalytics.eventType, "add_to_cart"), sql`${siteAnalytics.createdAt} >= ${daysAgo}`));
        const [checkoutStart] = await db.select({ count: sql`count(*)` }).from(siteAnalytics).where(and(eq(siteAnalytics.eventType, "checkout_start"), sql`${siteAnalytics.createdAt} >= ${daysAgo}`));
        const [orderComplete] = await db.select({ count: sql`count(*)` }).from(siteAnalytics).where(and(eq(siteAnalytics.eventType, "order_complete"), sql`${siteAnalytics.createdAt} >= ${daysAgo}`));
        // Daily breakdown
        const dailyStats = await db.execute(sql`
          SELECT DATE(createdAt) as date, eventType, COUNT(*) as count
          FROM site_analytics
          WHERE createdAt >= ${daysAgo}
          GROUP BY DATE(createdAt), eventType
          ORDER BY DATE(createdAt)
        `);
        return {
          pageViews: Number(pageViews?.count ?? 0),
          addToCart: Number(addToCart?.count ?? 0),
          checkoutStart: Number(checkoutStart?.count ?? 0),
          orderComplete: Number(orderComplete?.count ?? 0),
          dailyStats,
        };
      }),
    }),

    // Legal pages management
    legalPages: router({
      list: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(legalPages);
      }),
      upsert: adminProcedure.input(z.object({
        slug: z.string().min(1).max(100),
        title: z.string().min(1).max(200),
        content: z.string().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB bağlantısı yok" });
        const [existing] = await db.select().from(legalPages).where(eq(legalPages.slug, input.slug)).limit(1);
        if (existing) {
          const { slug, ...updateData } = input;
          await db.update(legalPages).set(updateData).where(eq(legalPages.slug, slug));
        } else {
          await db.insert(legalPages).values(input as any);
        }
        return { success: true };
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
