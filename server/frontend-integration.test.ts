/**
 * Frontend-Database Integration Tests
 * Tests for products API with variants join and adapter functions
 */
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { adaptDbProductToFrontend } from "../shared/productTypes";

// ===== Helper: Create mock context =====
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ===== Products API Tests =====
describe("products.list with variants", () => {
  it("returns products with variants array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.list({ limit: 10 });
    
    expect(result).toBeDefined();
    expect(result.products).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThan(0);
    
    // Check first product has variants
    if (result.products.length > 0) {
      const firstProduct = result.products[0];
      expect(firstProduct).toHaveProperty('variants');
      expect(firstProduct.variants).toBeInstanceOf(Array);
    }
  });

  it("each product has required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.list({ limit: 5 });
    
    result.products.forEach(product => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('slug');
      expect(product).toHaveProperty('brandId');
      expect(product).toHaveProperty('categoryId');
      expect(product).toHaveProperty('basePrice');
      expect(product).toHaveProperty('variants');
    });
  });

  it("variants have required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.list({ limit: 5 });
    
    result.products.forEach(product => {
      product.variants.forEach(variant => {
        expect(variant).toHaveProperty('id');
        expect(variant).toHaveProperty('sku');
        expect(variant).toHaveProperty('name');
        expect(variant).toHaveProperty('price');
        expect(variant).toHaveProperty('stock');
      });
    });
  });
});

describe("products.bySlug with variants", () => {
  it("returns product with variants by slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.bySlug({ slug: "whey-protein-2000gr" });
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('variants');
    expect(result!.variants).toBeInstanceOf(Array);
    expect(result!.variants.length).toBeGreaterThan(0);
  });

  it("returns null for non-existent slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.bySlug({ slug: "non-existent-product" });
    
    expect(result).toBeNull();
  });
});

// ===== Adapter Function Tests =====
describe("adaptDbProductToFrontend", () => {
  it("converts database product to frontend format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const dbResult = await caller.products.list({ limit: 1 });
    
    if (dbResult.products.length > 0) {
      const dbProduct = dbResult.products[0];
      const frontendProduct = adaptDbProductToFrontend(dbProduct as any);
      
      // Check frontend-specific fields
      expect(frontendProduct).toHaveProperty('image');
      expect(frontendProduct).toHaveProperty('images');
      expect(frontendProduct).toHaveProperty('nutrition');
      expect(frontendProduct).toHaveProperty('isBestseller');
      expect(frontendProduct).toHaveProperty('isNew');
      expect(frontendProduct).toHaveProperty('skt');
      expect(frontendProduct).toHaveProperty('freeFrom');
      expect(frontendProduct).toHaveProperty('crossSellIds');
      
      // Check variants are adapted
      expect(frontendProduct.variants).toBeInstanceOf(Array);
      if (frontendProduct.variants.length > 0) {
        const variant = frontendProduct.variants[0];
        expect(variant).toHaveProperty('flavor');
        expect(variant).toHaveProperty('weight');
        expect(variant).toHaveProperty('servings');
      }
    }
  });

  it("handles products with high ratings as bestsellers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const dbResult = await caller.products.list({ limit: 10 });
    
    dbResult.products.forEach(dbProduct => {
      const frontendProduct = adaptDbProductToFrontend(dbProduct as any);
      
      if (dbProduct.rating && dbProduct.rating >= 45) {
        expect(frontendProduct.isBestseller).toBe(true);
      }
    });
  });
});

// ===== Categories API Tests =====
describe("categories.list", () => {
  it("returns categories array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categories.list();
    
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it("each category has required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categories.list();
    
    result.forEach(category => {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('slug');
    });
  });
});
