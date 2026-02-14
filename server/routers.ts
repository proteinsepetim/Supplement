import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";

// ===== Input Sanitization Helpers =====
function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip JS protocol
    .replace(/on\w+=/gi, '') // Strip event handlers
    .trim();
}

// ===== Zod Schemas for Validation =====
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

// ===== Price Calculation (Server-side, tamper-proof) =====
// In a real app, prices would come from database. Here we import from shared data.
// This ensures client cannot manipulate prices.
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
    if (!product) {
      throw new Error(`Ürün bulunamadı: ${item.productId}/${item.variantId}`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Yetersiz stok: ${item.variantId}`);
    }
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
    // Calculate price server-side (tamper-proof)
    calculatePrice: publicProcedure
      .input(z.object({
        items: z.array(orderItemSchema).min(1),
        shippingMethod: shippingMethodSchema,
        paymentMethod: paymentMethodSchema,
      }))
      .query(({ input }) => {
        // Dynamic import of data to avoid bundling issues
        // In production, this would be a database query
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

    // Create order (demo mode - no real payment)
    create: publicProcedure
      .input(createOrderSchema)
      .mutation(async ({ input }) => {
        // Validate terms acceptance
        if (!input.acceptedTerms || !input.acceptedPrivacy) {
          throw new Error('Yasal sözleşmelerin kabul edilmesi zorunludur');
        }

        // Generate order number
        const orderNumber = `PM${Date.now().toString().slice(-8)}`;

        // Log order (in production, save to database)
        console.log(`[Order] Demo order created: ${orderNumber}`, {
          items: input.items.length,
          shippingMethod: input.shippingMethod,
          paymentMethod: input.paymentMethod,
          // SECURITY: Never log card details, PAN, CVV
          address: {
            city: input.address.city,
            district: input.address.district,
          },
        });

        return {
          success: true,
          orderNumber,
          isDemo: true,
          message: 'Demo sipariş oluşturuldu. Gerçek ödeme entegrasyonu aktif olduğunda siparişler işleme alınacaktır.',
        };
      }),
  }),

  // ===== Newsletter Router =====
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email('Geçerli bir e-posta adresi girin'),
      }))
      .mutation(async ({ input }) => {
        // In production, save to database/mailing list
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
        console.log(`[StockAlert] Subscription: ${input.email} for product ${input.productId}`);
        return { success: true };
      }),
  }),

  // ===== Products Router (Database-backed) =====
  products: router({
    list: publicProcedure
      .query(async () => {
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

  // ===== Categories Router (Database-backed) =====
  categories: router({
    list: publicProcedure
      .query(async () => {
        const { getAllCategories } = await import('./db');
        return await getAllCategories();
      }),
  }),
});

export type AppRouter = typeof appRouter;
