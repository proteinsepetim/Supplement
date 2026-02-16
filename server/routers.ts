import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { eq, desc, and, like, sql, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ===== Helpers =====
function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, (c) => {
    const map: Record<string, string> = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' };
    return map[c] || c;
  }).trim();
}

function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PM${y}${m}${d}-${rand}`;
}

// Admin middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin yetkisi gerekli' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  // ===== Auth Router =====
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ===== Products Router (Public) =====
  products: router({
    list: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        categoryId: z.string().optional(),
        brandId: z.string().optional(),
        sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) return { products: [], total: 0 };

        const { products } = await import('../drizzle/schema');
        const conditions = [eq(products.isActive, 'true')];

        if (input?.search) {
          conditions.push(like(products.name, `%${input.search}%`));
        }
        if (input?.categoryId) {
          conditions.push(eq(products.categoryId, input.categoryId));
        }
        if (input?.brandId) {
          conditions.push(eq(products.brandId, input.brandId));
        }

        const whereClause = and(...conditions);
        const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(products).where(whereClause);

        let orderClause;
        switch (input?.sortBy) {
          case 'price_asc': orderClause = asc(products.basePrice); break;
          case 'price_desc': orderClause = desc(products.basePrice); break;
          case 'popular': orderClause = desc(products.reviewCount); break;
          default: orderClause = desc(products.createdAt);
        }

        const productList = await db.select().from(products).where(whereClause).orderBy(orderClause).limit(input?.limit ?? 50).offset(input?.offset ?? 0);
        return { products: productList, total: countResult?.count ?? 0 };
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const { getProductBySlug, getProductVariants } = await import('./db');
        const product = await getProductBySlug(input.slug);
        if (!product) return null;
        const variants = await getProductVariants(product.id);
        return { ...product, variants };
      }),

    byCategory: publicProcedure
      .input(z.object({ categoryId: z.string() }))
      .query(async ({ input }) => {
        const { getProductsByCategory } = await import('./db');
        return await getProductsByCategory(input.categoryId);
      }),
  }),

  // ===== Categories Router (Public) =====
  categories: router({
    list: publicProcedure.query(async () => {
      const { getAllCategories } = await import('./db');
      return await getAllCategories();
    }),
  }),

  // ===== Site Settings Router (Public read, Admin write) =====
  settings: router({
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) return null;

        const { siteSettings } = await import('../drizzle/schema');
        const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, input.key)).limit(1);
        return setting || null;
      }),

    getAll: publicProcedure.query(async () => {
      const { getDb } = await import('./db');
      const db = await getDb();
      if (!db) return [];

      const { siteSettings } = await import('../drizzle/schema');
      return await db.select().from(siteSettings);
    }),

    update: adminProcedure
      .input(z.object({
        key: z.string().min(1).max(100),
        value: z.string().max(10000).nullable(),
        type: z.enum(['text', 'image', 'json', 'boolean', 'number']).optional(),
        description: z.string().max(255).optional(),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB bağlantısı yok' });

        const { siteSettings } = await import('../drizzle/schema');
        const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, input.key)).limit(1);

        if (existing) {
          await db.update(siteSettings).set({
            settingValue: input.value,
            ...(input.type && { settingType: input.type }),
            ...(input.description && { description: input.description }),
          }).where(eq(siteSettings.settingKey, input.key));
        } else {
          await db.insert(siteSettings).values({
            settingKey: input.key,
            settingValue: input.value,
            settingType: input.type || 'text',
            description: input.description || null,
          });
        }

        console.log(`[Admin] Setting updated: ${input.key}`);
        return { success: true };
      }),
  }),

  // ===== Page SEO Router (Public read, Admin write) =====
  seo: router({
    getByRoute: publicProcedure
      .input(z.object({ route: z.string() }))
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) return null;

        const { pageSeo } = await import('../drizzle/schema');
        const [seo] = await db.select().from(pageSeo).where(eq(pageSeo.pageRoute, input.route)).limit(1);
        return seo || null;
      }),

    list: adminProcedure.query(async () => {
      const { getDb } = await import('./db');
      const db = await getDb();
      if (!db) return [];

      const { pageSeo } = await import('../drizzle/schema');
      return await db.select().from(pageSeo);
    }),

    upsert: adminProcedure
      .input(z.object({
        pageRoute: z.string().min(1).max(200),
        pageTitle: z.string().max(200).optional(),
        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().max(500).optional(),
        ogImage: z.string().max(500).optional(),
        keywords: z.string().max(500).optional(),
        noIndex: z.enum(['true', 'false']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB bağlantısı yok' });

        const { pageSeo } = await import('../drizzle/schema');
        const [existing] = await db.select().from(pageSeo).where(eq(pageSeo.pageRoute, input.pageRoute)).limit(1);

        if (existing) {
          const { pageRoute, ...updateData } = input;
          const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));
          if (Object.keys(cleanData).length > 0) {
            await db.update(pageSeo).set(cleanData).where(eq(pageSeo.pageRoute, pageRoute));
          }
        } else {
          await db.insert(pageSeo).values({
            pageRoute: input.pageRoute,
            pageTitle: input.pageTitle || null,
            metaTitle: input.metaTitle || null,
            metaDescription: input.metaDescription || null,
            ogImage: input.ogImage || null,
            keywords: input.keywords || null,
            noIndex: input.noIndex || 'false',
          });
        }

        console.log(`[Admin] SEO updated for: ${input.pageRoute}`);
        return { success: true };
      }),
  }),

  // ===== Wizard Router (Public) =====
  wizard: router({
    goals: publicProcedure.query(async () => {
      const { getDb } = await import('./db');
      const db = await getDb();
      if (!db) return [];

      const { wizardGoals } = await import('../drizzle/schema');
      return await db.select().from(wizardGoals).where(eq(wizardGoals.isActive, 'true')).orderBy(asc(wizardGoals.sortOrder));
    }),

    recommend: publicProcedure
      .input(z.object({
        goalId: z.number(),
        gender: z.string().optional(),
        ageRange: z.string().optional(),
        trainingFrequency: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) return { ingredients: [], products: [] };

        const { goalIngredients, wizardIngredients, productIngredients, products } = await import('../drizzle/schema');

        // Get ingredients for this goal, sorted by relevance
        const goalIngs = await db.select({
          ingredientId: goalIngredients.ingredientId,
          relevanceScore: goalIngredients.relevanceScore,
          ingredientName: wizardIngredients.name,
          ingredientSlug: wizardIngredients.slug,
        })
          .from(goalIngredients)
          .innerJoin(wizardIngredients, eq(goalIngredients.ingredientId, wizardIngredients.id))
          .where(eq(goalIngredients.goalId, input.goalId))
          .orderBy(desc(goalIngredients.relevanceScore));

        // Get products that contain these ingredients
        const ingredientIds = goalIngs.map(g => g.ingredientId);
        if (ingredientIds.length === 0) return { ingredients: goalIngs, products: [] };

        const matchingProducts = await db.select({
          productId: productIngredients.productId,
          ingredientId: productIngredients.ingredientId,
          productName: products.name,
          productSlug: products.slug,
          productPrice: products.basePrice,
          productImage: products.imageUrl,
          productCategory: products.categoryId,
        })
          .from(productIngredients)
          .innerJoin(products, eq(productIngredients.productId, products.id))
          .where(and(
            sql`${productIngredients.ingredientId} IN (${sql.join(ingredientIds.map(id => sql`${id}`), sql`, `)})`,
            eq(products.isActive, 'true')
          ));

        return { ingredients: goalIngs, products: matchingProducts };
      }),

    saveSession: publicProcedure
      .input(z.object({
        goalId: z.number(),
        gender: z.string().optional(),
        ageRange: z.string().optional(),
        trainingFrequency: z.string().optional(),
        recommendedProducts: z.string().optional(),
        addedToCart: z.enum(['true', 'false']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) return { success: false };

        const { wizardSessions } = await import('../drizzle/schema');
        await db.insert(wizardSessions).values({
          userId: ctx.user?.id || null,
          goalId: input.goalId,
          gender: input.gender || null,
          ageRange: input.ageRange || null,
          trainingFrequency: input.trainingFrequency || null,
          recommendedProducts: input.recommendedProducts || null,
          addedToCart: input.addedToCart || 'false',
        });

        return { success: true };
      }),
  }),

  // ===== Order Router (Public create, Protected history) =====
  order: router({
    create: publicProcedure
      .input(z.object({
        customerName: z.string().min(2).max(200).transform(sanitizeString),
        customerEmail: z.string().email().max(320),
        customerPhone: z.string().min(10).max(20).regex(/^[0-9+\-\s()]+$/),
        address: z.string().min(10).max(1000).transform(sanitizeString),
        city: z.string().min(2).max(100).transform(sanitizeString),
        district: z.string().max(100).optional().transform(v => v ? sanitizeString(v) : v),
        zipCode: z.string().max(10).optional(),
        shippingMethod: z.enum(['standard', 'express']),
        paymentMethod: z.enum(['cod', 'credit_card', 'bank_transfer']),
        notes: z.string().max(500).optional().transform(v => v ? sanitizeString(v) : v),
        items: z.array(z.object({
          productId: z.string(),
          variantId: z.string(),
          productName: z.string().max(200),
          variantName: z.string().max(100),
          quantity: z.number().int().min(1).max(50),
          unitPrice: z.number().int().min(0),
        })).min(1).max(50),
        acceptedTerms: z.boolean().refine(v => v === true, { message: 'Sözleşmeleri kabul etmelisiniz' }),
        acceptedPrivacy: z.boolean().refine(v => v === true, { message: 'Gizlilik politikasını kabul etmelisiniz' }),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Veritabanı bağlantısı yok' });

        const { orders, orderItems, productVariants } = await import('../drizzle/schema');

        // Backend price calculation - verify prices from DB
        let subtotal = 0;
        for (const item of input.items) {
          const [variant] = await db.select().from(productVariants)
            .where(eq(productVariants.id, item.variantId)).limit(1);

          if (!variant) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: `Ürün varyantı bulunamadı: ${item.variantId}` });
          }
          if (variant.stock < item.quantity) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: `Yetersiz stok: ${item.productName} (${variant.stock} adet kaldı)` });
          }

          // Use DB price, not client price (security)
          subtotal += variant.price * item.quantity;
        }

        const shippingCost = subtotal >= 50000 ? 0 : (input.shippingMethod === 'express' ? 4999 : 2999);
        const codFee = input.paymentMethod === 'cod' ? 999 : 0;
        const total = subtotal + shippingCost + codFee;

        const orderNumber = generateOrderNumber();

        // Create order
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
          subtotal,
          shippingCost,
          codFee,
          total,
          shippingMethod: input.shippingMethod,
          paymentMethod: input.paymentMethod,
          notes: input.notes || null,
        }).$returningId();

        const orderId = orderResult.id;

        // Create order items and update stock
        for (const item of input.items) {
          const [variant] = await db.select().from(productVariants)
            .where(eq(productVariants.id, item.variantId)).limit(1);

          await db.insert(orderItems).values({
            orderId,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPrice: variant!.price,
            lineTotal: variant!.price * item.quantity,
          });

          // Decrease stock
          await db.update(productVariants).set({
            stock: sql`${productVariants.stock} - ${item.quantity}`,
          }).where(eq(productVariants.id, item.variantId));
        }

        console.log(`[Order] New order created: ${orderNumber} (Total: ${total} kuruş)`);

        // Notify owner
        try {
          const { notifyOwner } = await import('./_core/notification');
          await notifyOwner({
            title: `Yeni Sipariş: ${orderNumber}`,
            content: `${input.customerName} - ${input.items.length} ürün - ₺${(total / 100).toFixed(2)}`,
          });
        } catch (e) {
          console.warn('[Order] Owner notification failed:', e);
        }

        return {
          success: true,
          orderNumber,
          total,
          subtotal,
          shippingCost,
          codFee,
        };
      }),

    // User order history
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const { getDb } = await import('./db');
      const db = await getDb();
      if (!db) return [];

      const { orders } = await import('../drizzle/schema');
      return await db.select().from(orders).where(eq(orders.userId, ctx.user.id)).orderBy(desc(orders.createdAt));
    }),

    // Track order by number (public)
    track: publicProcedure
      .input(z.object({ orderNumber: z.string().min(1) }))
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) return null;

        const { orders, orderItems } = await import('../drizzle/schema');
        const [order] = await db.select({
          orderNumber: orders.orderNumber,
          status: orders.status,
          trackingNumber: orders.trackingNumber,
          shippingMethod: orders.shippingMethod,
          total: orders.total,
          createdAt: orders.createdAt,
        }).from(orders).where(eq(orders.orderNumber, input.orderNumber)).limit(1);

        if (!order) return null;
        return order;
      }),
  }),

  // ===== Newsletter Router (Public) =====
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email().max(320).transform(s => s.toLowerCase().trim()),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB bağlantısı yok' });

        const { newsletter } = await import('../drizzle/schema');
        try {
          await db.insert(newsletter).values({ email: input.email });
        } catch (e: any) {
          if (e?.code === 'ER_DUP_ENTRY') {
            return { success: true, message: 'Zaten kayıtlısınız!' };
          }
          throw e;
        }
        console.log(`[Newsletter] New subscriber: ${input.email}`);
        return { success: true, message: 'Başarıyla abone oldunuz!' };
      }),
  }),

  // ===== Contact Router (Public) =====
  contact: router({
    send: publicProcedure
      .input(z.object({
        name: z.string().min(2).max(100).transform(sanitizeString),
        email: z.string().email().max(320),
        subject: z.string().min(2).max(200).transform(sanitizeString),
        message: z.string().min(10).max(5000).transform(sanitizeString),
      }))
      .mutation(async ({ input }) => {
        try {
          const { notifyOwner } = await import('./_core/notification');
          await notifyOwner({
            title: `İletişim: ${input.subject}`,
            content: `${input.name} (${input.email})\n\n${input.message}`,
          });
        } catch (e) {
          console.warn('[Contact] Notification failed:', e);
        }
        console.log(`[Contact] Message from: ${input.name} (${input.email})`);
        return { success: true, message: 'Mesajınız alındı, en kısa sürede dönüş yapacağız.' };
      }),
  }),

  // ===== Stock Alert Router (Public) =====
  stockAlert: router({
    create: publicProcedure
      .input(z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        email: z.string().email().max(320),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB bağlantısı yok' });

        const { stockAlerts } = await import('../drizzle/schema');
        await db.insert(stockAlerts).values({
          productId: input.productId,
          variantId: input.variantId || null,
          email: input.email,
        });
        console.log(`[StockAlert] Alert created for product ${input.productId}`);
        return { success: true, message: 'Stok uyarısı oluşturuldu!' };
      }),
  }),

  // ===== File Upload Router (Admin) =====
  upload: router({
    image: adminProcedure
      .input(z.object({
        fileName: z.string().min(1).max(200),
        base64Data: z.string().min(1),
        contentType: z.string().default('image/jpeg'),
        folder: z.string().default('uploads'),
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import('./storage');
        const buffer = Buffer.from(input.base64Data, 'base64');
        const randomSuffix = Math.random().toString(36).substring(2, 10);
        const fileKey = `${input.folder}/${randomSuffix}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        console.log(`[Upload] File uploaded: ${fileKey}`);
        return { success: true, url, key: fileKey };
      }),
  }),

  // ===== Admin Router (RBAC Protected) =====
  admin: router({
    // Dashboard stats
    dashboard: adminProcedure.query(async () => {
      const { getDb } = await import('./db');
      const db = await getDb();
      if (!db) return { orders: 0, revenue: 0, customers: 0, products: 0, recentOrders: [], lowStockProducts: [], todayOrders: 0, todayRevenue: 0 };

      const { orders, users, products, productVariants } = await import('../drizzle/schema');

      const [orderStats] = await db.select({
        count: sql<number>`count(*)`,
        revenue: sql<number>`COALESCE(sum(${orders.total}), 0)`,
      }).from(orders);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [todayStats] = await db.select({
        count: sql<number>`count(*)`,
        revenue: sql<number>`COALESCE(sum(${orders.total}), 0)`,
      }).from(orders).where(sql`${orders.createdAt} >= ${today}`);

      const [customerStats] = await db.select({
        count: sql<number>`count(*)`,
      }).from(users);

      const [productStats] = await db.select({
        count: sql<number>`count(*)`,
      }).from(products).where(eq(products.isActive, 'true'));

      const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10);

      const lowStockVariants = await db.select({
        variantId: productVariants.id,
        variantName: productVariants.name,
        productId: productVariants.productId,
        stock: productVariants.stock,
        sku: productVariants.sku,
      }).from(productVariants)
        .where(and(eq(productVariants.isActive, 'true'), sql`${productVariants.stock} <= 10`))
        .orderBy(productVariants.stock)
        .limit(20);

      return {
        orders: orderStats?.count ?? 0,
        revenue: orderStats?.revenue ?? 0,
        customers: customerStats?.count ?? 0,
        products: productStats?.count ?? 0,
        recentOrders,
        lowStockProducts: lowStockVariants,
        todayOrders: todayStats?.count ?? 0,
        todayRevenue: todayStats?.revenue ?? 0,
      };
    }),

    // Orders management
    orders: router({
      list: adminProcedure
        .input(z.object({
          status: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        }).optional())
        .query(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) return { orders: [], total: 0 };

          const { orders } = await import('../drizzle/schema');
          const conditions: any[] = [];
          if (input?.status) {
            conditions.push(eq(orders.status, input.status as any));
          }
          if (input?.search) {
            conditions.push(
              sql`(${orders.orderNumber} LIKE ${`%${input.search}%`} OR ${orders.customerName} LIKE ${`%${input.search}%`} OR ${orders.customerEmail} LIKE ${`%${input.search}%`})`
            );
          }

          const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
          const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(whereClause);
          const orderList = await db.select().from(orders).where(whereClause).orderBy(desc(orders.createdAt)).limit(input?.limit ?? 50).offset(input?.offset ?? 0);

          return { orders: orderList, total: countResult?.count ?? 0 };
        }),

      updateStatus: adminProcedure
        .input(z.object({
          orderId: z.number(),
          status: z.enum(['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']),
          trackingNumber: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB bağlantısı yok' });

          const { orders } = await import('../drizzle/schema');
          const updateData: any = { status: input.status };
          if (input.trackingNumber) updateData.trackingNumber = input.trackingNumber;

          await db.update(orders).set(updateData).where(eq(orders.id, input.orderId));
          console.log(`[Admin] Order ${input.orderId} status → ${input.status}`);
          return { success: true };
        }),

      getDetail: adminProcedure
        .input(z.object({ orderId: z.number() }))
        .query(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) return null;

          const { orders, orderItems } = await import('../drizzle/schema');
          const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
          if (!order) return null;

          const items = await db.select().from(orderItems).where(eq(orderItems.orderId, input.orderId));
          return { ...order, items };
        }),
    }),

    // Products management
    products: router({
      list: adminProcedure
        .input(z.object({
          search: z.string().optional(),
          categoryId: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        }).optional())
        .query(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) return { products: [], total: 0 };

          const { products } = await import('../drizzle/schema');
          const conditions: any[] = [];
          if (input?.search) {
            conditions.push(like(products.name, `%${input.search}%`));
          }
          if (input?.categoryId) {
            conditions.push(eq(products.categoryId, input.categoryId));
          }

          const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
          const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(products).where(whereClause);
          const productList = await db.select().from(products).where(whereClause).orderBy(desc(products.createdAt)).limit(input?.limit ?? 50).offset(input?.offset ?? 0);

          return { products: productList, total: countResult?.count ?? 0 };
        }),

      create: adminProcedure
        .input(z.object({
          name: z.string().min(2).max(200).transform(sanitizeString),
          slug: z.string().min(2).max(200),
          description: z.string().max(5000).optional().transform(v => v ? sanitizeString(v) : v),
          brandId: z.string().min(1),
          categoryId: z.string().min(1),
          basePrice: z.number().min(0),
          imageUrl: z.string().max(500).optional(),
          tags: z.string().optional(),
          nutritionFacts: z.string().optional(),
          metaTitle: z.string().max(200).optional(),
          metaDescription: z.string().max(500).optional(),
          keywords: z.string().max(500).optional(),
        }))
        .mutation(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB bağlantısı yok' });

          const { products } = await import('../drizzle/schema');
          const id = `prod_${Date.now()}`;
          await db.insert(products).values({
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
            keywords: input.keywords || null,
          });

          console.log(`[Admin] Product created: ${input.name} (${id})`);
          return { success: true, id };
        }),

      update: adminProcedure
        .input(z.object({
          id: z.string(),
          name: z.string().min(2).max(200).transform(sanitizeString).optional(),
          description: z.string().max(5000).optional().transform(v => v ? sanitizeString(v) : v),
          basePrice: z.number().min(0).optional(),
          imageUrl: z.string().max(500).optional(),
          isActive: z.enum(['true', 'false']).optional(),
          tags: z.string().optional(),
          nutritionFacts: z.string().optional(),
          metaTitle: z.string().max(200).optional(),
          metaDescription: z.string().max(500).optional(),
          keywords: z.string().max(500).optional(),
        }))
        .mutation(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB bağlantısı yok' });

          const { products } = await import('../drizzle/schema');
          const { id, ...updateData } = input;
          const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));

          if (Object.keys(cleanData).length > 0) {
            await db.update(products).set(cleanData).where(eq(products.id, id));
          }

          console.log(`[Admin] Product updated: ${id}`);
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB bağlantısı yok' });

          const { products } = await import('../drizzle/schema');
          await db.update(products).set({ isActive: 'false' }).where(eq(products.id, input.id));
          console.log(`[Admin] Product deactivated: ${input.id}`);
          return { success: true };
        }),
    }),

    // Stock management
    stock: router({
      updateVariant: adminProcedure
        .input(z.object({
          variantId: z.string(),
          stock: z.number().int().min(0),
          price: z.number().min(0).optional(),
        }))
        .mutation(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB bağlantısı yok' });

          const { productVariants } = await import('../drizzle/schema');
          const updateData: any = { stock: input.stock };
          if (input.price !== undefined) updateData.price = input.price;

          await db.update(productVariants).set(updateData).where(eq(productVariants.id, input.variantId));
          console.log(`[Admin] Variant ${input.variantId} stock → ${input.stock}`);
          return { success: true };
        }),

      getVariants: adminProcedure
        .input(z.object({ productId: z.string() }))
        .query(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) return [];

          const { productVariants } = await import('../drizzle/schema');
          return await db.select().from(productVariants).where(eq(productVariants.productId, input.productId));
        }),
    }),

    // Customers management
    customers: router({
      list: adminProcedure
        .input(z.object({
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        }).optional())
        .query(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) return { customers: [], total: 0 };

          const { users } = await import('../drizzle/schema');
          const conditions: any[] = [];
          if (input?.search) {
            conditions.push(
              sql`(${users.name} LIKE ${`%${input.search}%`} OR ${users.email} LIKE ${`%${input.search}%`})`
            );
          }

          const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
          const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(whereClause);
          const customerList = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            lastSignedIn: users.lastSignedIn,
          }).from(users).where(whereClause).orderBy(desc(users.createdAt)).limit(input?.limit ?? 50).offset(input?.offset ?? 0);

          return { customers: customerList, total: countResult?.count ?? 0 };
        }),
    }),

    // Newsletter subscribers
    newsletterList: adminProcedure.query(async () => {
      const { getDb } = await import('./db');
      const db = await getDb();
      if (!db) return [];

      const { newsletter } = await import('../drizzle/schema');
      return await db.select().from(newsletter).where(eq(newsletter.isActive, 'true')).orderBy(desc(newsletter.createdAt));
    }),

    // Stock alerts
    stockAlertsList: adminProcedure.query(async () => {
      const { getDb } = await import('./db');
      const db = await getDb();
      if (!db) return [];

      const { stockAlerts } = await import('../drizzle/schema');
      return await db.select().from(stockAlerts).orderBy(desc(stockAlerts.createdAt));
    }),

    // Site settings management
    settings: router({
      list: adminProcedure.query(async () => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) return [];

        const { siteSettings } = await import('../drizzle/schema');
        return await db.select().from(siteSettings);
      }),

      update: adminProcedure
        .input(z.object({
          key: z.string().min(1).max(100),
          value: z.string().max(10000).nullable(),
        }))
        .mutation(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB bağlantısı yok' });

          const { siteSettings } = await import('../drizzle/schema');
          await db.update(siteSettings).set({ settingValue: input.value }).where(eq(siteSettings.settingKey, input.key));
          console.log(`[Admin] Setting updated: ${input.key}`);
          return { success: true };
        }),
    }),

    // SEO management
    seo: router({
      list: adminProcedure.query(async () => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) return [];

        const { pageSeo } = await import('../drizzle/schema');
        return await db.select().from(pageSeo);
      }),

      upsert: adminProcedure
        .input(z.object({
          pageRoute: z.string().min(1).max(200),
          pageTitle: z.string().max(200).optional(),
          metaTitle: z.string().max(200).optional(),
          metaDescription: z.string().max(500).optional(),
          ogImage: z.string().max(500).optional(),
          keywords: z.string().max(500).optional(),
          noIndex: z.enum(['true', 'false']).optional(),
        }))
        .mutation(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB bağlantısı yok' });

          const { pageSeo } = await import('../drizzle/schema');
          const [existing] = await db.select().from(pageSeo).where(eq(pageSeo.pageRoute, input.pageRoute)).limit(1);

          if (existing) {
            const { pageRoute, ...updateData } = input;
            const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));
            if (Object.keys(cleanData).length > 0) {
              await db.update(pageSeo).set(cleanData).where(eq(pageSeo.pageRoute, pageRoute));
            }
          } else {
            await db.insert(pageSeo).values({
              pageRoute: input.pageRoute,
              pageTitle: input.pageTitle || null,
              metaTitle: input.metaTitle || null,
              metaDescription: input.metaDescription || null,
              ogImage: input.ogImage || null,
              keywords: input.keywords || null,
              noIndex: input.noIndex || 'false',
            });
          }

          console.log(`[Admin] SEO updated for: ${input.pageRoute}`);
          return { success: true };
        }),
    }),

    // Wizard management
    wizard: router({
      goals: adminProcedure.query(async () => {
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) return [];

        const { wizardGoals } = await import('../drizzle/schema');
        return await db.select().from(wizardGoals).orderBy(asc(wizardGoals.sortOrder));
      }),

      sessions: adminProcedure
        .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
        .query(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) return [];

          const { wizardSessions } = await import('../drizzle/schema');
          return await db.select().from(wizardSessions).orderBy(desc(wizardSessions.createdAt)).limit(input?.limit ?? 50);
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
