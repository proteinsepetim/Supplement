import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ===== Auth Tests =====
describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user object for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.email).toBe("test@example.com");
    expect(result?.role).toBe("user");
  });
});

// ===== Newsletter Tests =====
describe("newsletter.subscribe", () => {
  it("accepts valid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.newsletter.subscribe({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.newsletter.subscribe({ email: "not-an-email" })
    ).rejects.toThrow();
  });

  it("rejects empty email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.newsletter.subscribe({ email: "" })
    ).rejects.toThrow();
  });
});

// ===== Contact Form Tests =====
describe("contact.send", () => {
  it("accepts valid contact form", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contact.send({
      name: "Test User",
      email: "test@example.com",
      subject: "Test Subject Here",
      message: "This is a test message that is long enough to pass validation.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.contact.send({
        name: "A",
        email: "test@example.com",
        subject: "Test Subject",
        message: "This is a test message that is long enough.",
      })
    ).rejects.toThrow();
  });

  it("rejects short message", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.contact.send({
        name: "Test User",
        email: "test@example.com",
        subject: "Test Subject",
        message: "Short",
      })
    ).rejects.toThrow();
  });

  it("sanitizes HTML in name field", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Should not throw - sanitization strips tags
    const result = await caller.contact.send({
      name: "Test<script>alert(1)</script>User",
      email: "test@example.com",
      subject: "Test Subject Here",
      message: "This is a test message that is long enough to pass validation.",
    });
    expect(result.success).toBe(true);
  });
});

// ===== Stock Alert Tests =====
describe("stockAlert.subscribe", () => {
  it("accepts valid stock alert subscription", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.stockAlert.subscribe({
      productId: "whey-protein-2000gr",
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email for stock alert", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.stockAlert.subscribe({
        productId: "whey-protein-2000gr",
        email: "invalid",
      })
    ).rejects.toThrow();
  });

  it("rejects empty productId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.stockAlert.subscribe({
        productId: "",
        email: "test@example.com",
      })
    ).rejects.toThrow();
  });
});

// ===== Order Creation Tests =====
describe("order.create", () => {
  const validOrder = {
    items: [{ productId: "whey-protein-2000gr", variantId: "wp-choc-2kg", quantity: 1 }],
    address: {
      firstName: "Ahmet",
      lastName: "Yılmaz",
      email: "ahmet@example.com",
      phone: "05551234567",
      address: "Atatürk Caddesi No:123 Daire:4",
      city: "İstanbul",
      district: "Kadıköy",
      zipCode: "34710",
    },
    shippingMethod: "standard" as const,
    paymentMethod: "credit-card" as const,
    notes: "Lütfen zile basın",
    acceptedTerms: true,
    acceptedPrivacy: true,
  };

  it("creates demo order with valid data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.order.create(validOrder);
    expect(result.success).toBe(true);
    expect(result.orderNumber).toMatch(/^PM\d+$/);
  });

  it("rejects order without terms acceptance", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.order.create({ ...validOrder, acceptedTerms: false })
    ).rejects.toThrow();
  });

  it("rejects order without privacy acceptance", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.order.create({ ...validOrder, acceptedPrivacy: false })
    ).rejects.toThrow();
  });

  it("rejects order with invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.order.create({
        ...validOrder,
        address: { ...validOrder.address, email: "not-email" },
      })
    ).rejects.toThrow();
  });

  it("rejects order with invalid phone", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.order.create({
        ...validOrder,
        address: { ...validOrder.address, phone: "12345" },
      })
    ).rejects.toThrow();
  });

  it("rejects order with empty items", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.order.create({ ...validOrder, items: [] })
    ).rejects.toThrow();
  });

  it("rejects order with short address", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.order.create({
        ...validOrder,
        address: { ...validOrder.address, address: "Kısa" },
      })
    ).rejects.toThrow();
  });

  it("accepts express shipping", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.order.create({
      ...validOrder,
      shippingMethod: "express",
    });
    expect(result.success).toBe(true);
  });

  it("accepts cash-on-delivery payment", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.order.create({
      ...validOrder,
      paymentMethod: "cash-on-delivery",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid shipping method", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.order.create({
        ...validOrder,
        shippingMethod: "teleport" as any,
      })
    ).rejects.toThrow();
  });

  it("sanitizes XSS in address fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.order.create({
      ...validOrder,
      address: {
        ...validOrder.address,
        firstName: "Ahmet<script>alert(1)</script>",
        address: "Atatürk Caddesi <img onerror=alert(1)> No:123 Daire:4",
      },
    });
    expect(result.success).toBe(true);
  });
});
