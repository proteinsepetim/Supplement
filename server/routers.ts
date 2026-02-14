import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { eq, desc, sql, and, like } from "drizzle-orm";

// ===== Input Sanitization Helpers =====
function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// ===== Zod Schemas =====
const addressSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır').max(50).transform(sanitizeString),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır').max(50).transform(sanitizeString),
  email: z.string().email('Geçerli bir e-posta adresi girin').max(320),
  phone: z.string().regex(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir telefon numarası girin'),
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır').max(500).transform(sanitizeString),
  city: z.string().min(2, 'İl zorunludur').max(50).transform(sanitizeString),
  district: z.string().max(50).optional().transform(v => v ? sanitizeString(v) : v),
  zipCode: z.string().max(10).optional(),
});

const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(100),
});

const shippingMethodSchema = z.enum(['standard', 'express']);
const paymentMethodSchema = z.enum(['credit-card', 'bank-transfer', 'cash-on-delivery']);

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Sepet boş olamaz').max(50),
  address: addressSchema,
  shippingMethod: shippingMethodSchema,
  paymentMethod: paymentMethodSchema,
  notes: z.string().max(500).optional().transform(v => v ? sanitizeString(v) : v),
  acceptedTerms: z.boolean().refine(v => v === true, 'Mesafeli Satış Sözleşmesi kabul edilmelidir'),
  acceptedPrivacy: z.boolean().refine(v => v === true, 'Ön Bilgilendirme Formu kabul edilmelidir'),
});

// ===== Price Calculation =====
const FREE_SHIPPING_THRESHOLD = 300;
const STANDARD_SHIPPING_COST = 29.90;
const EXPRESS_SHIPPING_COST = 49.90;
const COD_FEE = 15;

interface PriceCalculation {
  subtotal: number;
  shippingCost: number;
  codFee: number;
  total: number;
  itemDetails: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

function calculateOrderPrice(
  items: Array<{ productId: string; variantId: string; quantity: number }>,
  shippingMethod: string,
  paymentMethod: string,
  productLookup: (productId: string, variantId: string) => { price: number; stock: number } | null
): PriceCalculation {
  const itemDetails = items.map(item => {
    const product = productLookup(item.productId, item.variantId);
    if (!product) throw new Error(`Ürün bulunamadı: ${item.productId}/${item.variantId}`);
    if (product.stock < item.quantity) throw new Error(`Yetersiz stok: ${item.variantId}`);
    return {
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal: Math.round(product.price * item.quantity * 100) / 100,
    };
  });

  const subtotal = Math.round(itemDetails.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;
  let shippingCost: number;
  if (shippingMethod === 'express') {
    shippingCost = EXPRESS_SHIPPING_COST;
  } else {
    shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  }
  const codFee = paymentMethod === 'cash-on-delivery' ? COD_FEE : 0;
  const total = Math.round((subtotal + shippingCost + codFee) * 100) / 100;

  return { subtotal, shippingCost, codFee, total, itemDetails };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ===== Order Router =====
  order: router({
    calculatePrice: publicProcedure
      .input(z.object({
        items: z.array(orderItemSchema).min(1),
        shippingMethod: shippingMethodSchema,
        paymentMethod: paymentMethodSchema,
      }))
      .query(({ input }) => {
        const { getProductById } = require('../client/src/lib/data');
        const lookup = (productId: string, variantId: string) => {
          const product = getProductById(productId);
          if (!product) return null;
          const variant = product.variants.find((v: any) => v.id === variantId);
          if (!variant) return null;
          return { price: variant.price, stock: variant.stock };
        };
        return calculateOrderPrice(input.items, input.shippingMethod, input.paymentMethod, lookup);
      }),

    create: publicProcedure
      .input(createOrderSchema)
      .mutation(async ({ input }) => {
        if (!input.acceptedTerms || !input.acceptedPrivacy) {
          throw new Error('Yasal sözleşmelerin kabul edilmesi zorunludur');
        }

        const orderNumber = `PM${Date.now().toString().slice(-8)}`;

        // Save to database
        try {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (db) {
            const { orders, orderItems } = await import('../drizzle/schema');
            const [orderResult] = await db.insert(orders).values({
              orderNumber,
              status: 'pending',
              customerName: `${input.address.firstName} ${input.address.lastName}`,
              customerEmail: input.address.email,
              customerPhone: input.address.phone,
              address: input.address.address,
              city: input.address.city,
              district: input.address.district || null,
              zipCode: input.address.zipCode || null,
              subtotal: 0,
              shippingCost: 0,
              codFee: 0,
              total: 0,
              shippingMethod: input.shippingMethod,
              paymentMethod: input.paymentMethod,
              notes: input.notes || null,
            });

            const orderId = (orderResult as any).insertId;

            for (const item of input.items) {
              await db.insert(orderItems).values({
                orderId,
                productId: item.productId,
                variantId: item.variantId,
                productName: item.productId,
                variantName: item.variantId,
                quantity: item.quantity,
                unitPrice: 0,
                lineTotal: 0,
              });
            }

            console.log(`[Order] Order saved to DB: ${orderNumber} (ID: ${orderId})`);
          }
        } catch (err) {
          console.error('[Order] DB save failed, continuing with demo:', err);
        }

        console.log(`[Order] Order created: ${orderNumber}`, {
          items: input.items.length,
          shippingMethod: input.shippingMethod,
          paymentMethod: input.paymentMethod,
          address: { city: input.address.city, district: input.address.district },
        });

        return { success: true, orderNumber, message: 'Siparişiniz başarıyla oluşturuldu.' };
      }),
  }),

  // ===== Newsletter Router =====
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email('Geçerli bir e-posta adresi girin') }))
      .mutation(async ({ input }) => {
        try {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (db) {
            const { newsletter } = await import('../drizzle/schema');
            await db.insert(newsletter).values({ email: input.email }).onDuplicateKeyUpdate({ set: { isActive: 'true' } });
          }
        } catch (err) {
          console.error('[Newsletter] DB save failed:', err);
        }
        console.log(`[Newsletter] New subscription: ${input.email}`);
        return { success: true };
      }),
  }),

  // ===== Contact Router =====
  contact: router({
    send: publicProcedure
      .input(z.object({
        name: z.string().min(2).max(100).transform(sanitizeString),
        email: z.string().email(),
        subject: z.string().min(5).max(200).transform(sanitizeString),
        message: z.string().min(10).max(2000).transform(sanitizeString),
      }))
      .mutation(async ({ input }) => {
        console.log(`[Contact] New message from ${input.name}: ${input.subject}`);
        return { success: true };
      }),
  }),

  // ===== Stock Alert Router =====
  stockAlert: router({
    subscribe: publicProcedure
      .input(z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).optional(),
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (db) {
            const { stockAlerts } = await import('../drizzle/schema');
            await db.insert(stockAlerts).values({
              productId: input.productId,
              variantId: input.variantId || null,
              email: input.email,
            });
          }
        } catch (err) {
          console.error('[StockAlert] DB save failed:', err);
        }
        console.log(`[StockAlert] Subscription: ${input.email} for product ${input.productId}`);
        return { success: true };
      }),
  }),

  // ===== Products Router (Public) =====
  products: router({
    list: publicProcedure.query(async () => {
      const { getAllProducts } = await import('./db');
      return await getAllProducts();
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

  // ===== Admin Router (RBAC Protected) =====
  admin: router({
    // Dashboard stats
    dashboard: adminProcedure.query(async () => {
      const { getDb } = await import('./db');
      const db = await getDb();
      if (!db) return { orders: 0, revenue: 0, customers: 0, products: 0, recentOrders: [], lowStockProducts: [] };

      const { orders, users, products, productVariants } = await import('../drizzle/schema');

      const [orderStats] = await db.select({
        count: sql<number>`count(*)`,
        revenue: sql<number>`COALESCE(sum(${orders.total}), 0)`,
      }).from(orders);

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
          let query = db.select().from(orders);

          const conditions = [];
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
          if (!db) throw new Error('Veritabanı bağlantısı yok');

          const { orders } = await import('../drizzle/schema');
          const updateData: any = { status: input.status };
          if (input.trackingNumber) updateData.trackingNumber = input.trackingNumber;

          await db.update(orders).set(updateData).where(eq(orders.id, input.orderId));
          console.log(`[Admin] Order ${input.orderId} status updated to ${input.status}`);
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
          const conditions = [];
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
        }))
        .mutation(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) throw new Error('Veritabanı bağlantısı yok');

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
        }))
        .mutation(async ({ input }) => {
          const { getDb } = await import('./db');
          const db = await getDb();
          if (!db) throw new Error('Veritabanı bağlantısı yok');

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
          if (!db) throw new Error('Veritabanı bağlantısı yok');

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
          if (!db) throw new Error('Veritabanı bağlantısı yok');

          const { productVariants } = await import('../drizzle/schema');
          const updateData: any = { stock: input.stock };
          if (input.price !== undefined) updateData.price = input.price;

          await db.update(productVariants).set(updateData).where(eq(productVariants.id, input.variantId));
          console.log(`[Admin] Variant ${input.variantId} stock updated to ${input.stock}`);
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
          const conditions = [];
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
  }),
});

export type AppRouter = typeof appRouter;
