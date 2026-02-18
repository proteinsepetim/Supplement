import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@test.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@test.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Public API endpoints", () => {
  it("auth.me returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("auth.me returns user for authenticated users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Regular User");
    expect(result?.role).toBe("user");
  });

  it("products.list returns product list structure", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.products.list({});
    expect(result).toHaveProperty("products");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.products)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("products.list with search returns results", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.products.list({ search: "protein", limit: 5 });
    expect(result).toHaveProperty("products");
    expect(result).toHaveProperty("total");
  });

  it("categories.list returns array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("brands.list returns array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.brands.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("settings.list returns array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.settings.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("iban.list returns array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.iban.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("newsletter.subscribe requires valid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.newsletter.subscribe({ email: "invalid" })).rejects.toThrow();
  });
});

describe("Protected API endpoints", () => {
  it("order.myOrders requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.order.myOrders()).rejects.toThrow();
  });

  it("order.myOrders returns array for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.order.myOrders();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Admin API endpoints", () => {
  it("admin.dashboard requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.dashboard()).rejects.toThrow();
  });

  it("admin.dashboard returns stats for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.dashboard();
    expect(result).toHaveProperty("orders");
    expect(result).toHaveProperty("revenue");
    expect(result).toHaveProperty("products");
    expect(result).toHaveProperty("customers");
  });

  it("admin.products.list returns paginated products for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.products.list({});
    expect(result).toHaveProperty("products");
    expect(result).toHaveProperty("total");
  });

  it("admin.orders.list returns paginated orders for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.orders.list({});
    expect(result).toHaveProperty("orders");
    expect(result).toHaveProperty("total");
  });

  it("admin.categories.list returns categories for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin.brands.list returns brands for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.brands.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin.customers.list returns customers for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.customers.list({});
    expect(result).toHaveProperty("customers");
    expect(result).toHaveProperty("total");
  });
});

describe("Quiz API endpoints", () => {
  it("quiz.questions returns array for public", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.quiz.questions();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin.quiz.questions returns quiz questions for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.quiz.questions();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin.quiz.questions requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.quiz.questions()).rejects.toThrow();
  });
});

describe("Campaign API endpoints", () => {
  it("campaigns.active returns array for public", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.campaigns.active();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin.campaigns.list returns campaigns for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.campaigns.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin.campaigns.list requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.campaigns.list()).rejects.toThrow();
  });
});

describe("Analytics API endpoints", () => {
  it("admin.analytics.funnel returns funnel data for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.analytics.funnel({ days: 30 });
    expect(result).toHaveProperty("pageViews");
    expect(result).toHaveProperty("addToCart");
    expect(result).toHaveProperty("checkoutStart");
    expect(result).toHaveProperty("orderComplete");
  });

  it("admin.analytics.funnel requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.analytics.funnel({ days: 30 })).rejects.toThrow();
  });

  it("analytics.track accepts events", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.analytics.track({ eventType: "page_view" });
    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });
});

describe("Utility functions", () => {
  it("formatPrice formats correctly", async () => {
    const { formatPrice } = await import("../shared/utils");
    const result = formatPrice(15990);
    expect(result).toContain("159");
    expect(result).toContain("90");
  });

  it("slugify handles Turkish characters", async () => {
    const { slugify } = await import("../shared/utils");
    expect(slugify("Protein Tozu")).toBe("protein-tozu");
    expect(slugify("Çikolata Aromalı")).toBe("cikolata-aromali");
    expect(slugify("Şeker İçermeyen")).toBe("seker-icermeyen");
  });

  it("getOrderStatusLabel returns Turkish labels", async () => {
    const { getOrderStatusLabel } = await import("../shared/utils");
    expect(getOrderStatusLabel("pending")).toBe("Beklemede");
    expect(getOrderStatusLabel("shipped")).toBe("Kargoya Verildi");
    expect(getOrderStatusLabel("delivered")).toBe("Teslim Edildi");
  });

  it("getPaymentMethodLabel returns Turkish labels", async () => {
    const { getPaymentMethodLabel } = await import("../shared/utils");
    expect(getPaymentMethodLabel("credit_card")).toBe("Kredi Kartı");
    expect(getPaymentMethodLabel("bank_transfer")).toBe("Havale/EFT");
  });
});
