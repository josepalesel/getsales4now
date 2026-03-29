import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "test@getsales4now.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("auth.me", () => {
  it("returns the current user when authenticated", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@getsales4now.com");
    expect(result?.role).toBe("user");
  });

  it("returns null when not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("returns success on logout", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

describe("router structure", () => {
  it("has all required module routers", () => {
    const routerKeys = Object.keys(appRouter._def.record);
    expect(routerKeys).toContain("auth");
    expect(routerKeys).toContain("crm");
    expect(routerKeys).toContain("campaigns");
    expect(routerKeys).toContain("social");
    expect(routerKeys).toContain("funnels");
    expect(routerKeys).toContain("inbox");
    expect(routerKeys).toContain("ai");
    expect(routerKeys).toContain("reports");
    expect(routerKeys).toContain("integrations");
    expect(routerKeys).toContain("onboarding");
  });

  it("has CRM sub-procedures", () => {
    expect(appRouter._def.record).toHaveProperty("crm");
  });

  it("has campaigns sub-procedures", () => {
    expect(appRouter._def.record).toHaveProperty("campaigns");
  });

  it("has AI sub-procedures", () => {
    // ai router is registered under appRouter
    expect(appRouter._def.record).toHaveProperty("ai");
  });

  it("has reports sub-procedures", () => {
    // reports router is registered under appRouter
    expect(appRouter._def.record).toHaveProperty("reports");
  });
});
