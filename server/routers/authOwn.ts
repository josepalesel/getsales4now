/**
 * GetSales4Now — Own Authentication Router
 * Handles email/password registration, login, and password reset
 * independent of Manus OAuth.
 */
import { z } from "zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { eq, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, subscriptions } from "../../drizzle/schema";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME } from "../../shared/const";
import { ENV } from "../_core/env";
import { sdk } from "../_core/sdk";

const SALT_ROUNDS = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function createSessionToken(openId: string, name: string): Promise<string> {
  // Use sdk.signSession so the token is compatible with sdk.authenticateRequest()
  return sdk.signSession(
    { openId, appId: ENV.appId, name },
    { expiresInMs: 30 * 24 * 60 * 60 * 1000 }
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const authOwnRouter = router({
  /**
   * Register a new user with email/password and selected plan.
   * Creates the user, hashes the password, and returns a session cookie.
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        plan: z.enum(["starter", "business"]),
      }).refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if email already exists
      const existing = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
      }

      const passwordHash = await hashPassword(input.password);
      const openId = `own_${nanoid(24)}`; // unique identifier for own-auth users
      const trialStart = new Date();
      const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

      // Insert new user
      await db.insert(users).values({
        openId,
        name: input.name,
        email: input.email,
        loginMethod: "email",
        passwordHash,
        emailVerified: false,
        selectedPlan: input.plan,
        trialStartedAt: trialStart,
        trialEndsAt: trialEnd,
        role: "user",
        lastSignedIn: new Date(),
      });

      // Fetch the created user
      const [newUser] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (!newUser) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });

      // Create subscription record (trial state, awaiting Stripe)
      const planLimits = { starter: { contacts: 5000, users: 3 }, business: { contacts: -1, users: 10 } };
      const limits = planLimits[input.plan];
      await db.insert(subscriptions).values({
        userId: newUser.id,
        plan: input.plan,
        status: "trialing",
        contactsLimit: limits.contacts,
        usersLimit: limits.users,
        ghlStatus: "pending",
      });

      // Issue session cookie — use sdk.signSession so authenticateRequest() can verify it
      const token = await createSessionToken(openId, input.name);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

      return {
        success: true,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        plan: input.plan,
        trialEndsAt: trialEnd.toISOString(),
        needsCheckout: true, // redirect to Stripe checkout
      };
    }),

  /**
   * Login with email and password.
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      }

      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      }

      // Update last signed in
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

      // Issue session cookie — use sdk.signSession so authenticateRequest() can verify it
      const token = await createSessionToken(user.openId, user.name ?? user.email ?? "");
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

      // Get subscription status
      const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id)).limit(1);

      return {
        success: true,
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: sub?.plan ?? "free",
        ghlOnboardingCompleted: user.ghlOnboardingCompleted,
        trialEndsAt: user.trialEndsAt?.toISOString() ?? null,
        needsGhlOnboarding: !user.ghlOnboardingCompleted && (sub?.plan !== "free"),
        needsCheckout: sub?.status === "trialing" && !sub?.stripeSubscriptionId,
      };
    }),

  /**
   * Request a password reset link.
   */
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [user] = await db.select({ id: users.id, email: users.email })
        .from(users).where(eq(users.email, input.email)).limit(1);

      // Always return success to prevent email enumeration
      if (!user) return { success: true };

      const token = nanoid(48);
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.update(users).set({
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      }).where(eq(users.id, user.id));

      // In production, send email with reset link
      // For now, log the token (replace with email service)
      console.log(`[Auth] Password reset token for ${input.email}: ${token}`);

      return { success: true };
    }),

  /**
   * Reset password with token.
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8),
        confirmPassword: z.string(),
      }).refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [user] = await db.select()
        .from(users)
        .where(eq(users.resetPasswordToken, input.token))
        .limit(1);

      if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset token." });
      }

      const passwordHash = await hashPassword(input.password);
      await db.update(users).set({
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      }).where(eq(users.id, user.id));

      return { success: true };
    }),

  /**
   * Get current trial status for authenticated user.
   */
  getTrialStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const [user] = await db.select({
      trialStartedAt: users.trialStartedAt,
      trialEndsAt: users.trialEndsAt,
      selectedPlan: users.selectedPlan,
      ghlOnboardingCompleted: users.ghlOnboardingCompleted,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);

    if (!user?.trialEndsAt) return null;

    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isActive = user.trialEndsAt > now;

    return {
      isActive,
      daysLeft,
      trialEndsAt: user.trialEndsAt.toISOString(),
      selectedPlan: user.selectedPlan,
      ghlOnboardingCompleted: user.ghlOnboardingCompleted,
    };
  }),

  /**
   * Complete GHL sub-account onboarding step.
   */
  updateGhlOnboarding: protectedProcedure
    .input(z.object({
      step: z.number(),
      data: z.object({
        companyName: z.string().optional(),
        companyPhone: z.string().optional(),
        companyWebsite: z.string().optional(),
        country: z.string().optional(),
        businessType: z.string().optional(),
        ghlToken: z.string().optional(),
        ghlCompanyId: z.string().optional(),
      }),
      completed: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const updateData: Record<string, unknown> = {
        ghlOnboardingStep: input.step,
      };

      if (input.data.companyName) updateData.businessName = input.data.companyName;
      if (input.data.companyPhone) updateData.companyPhone = input.data.companyPhone;
      if (input.data.companyWebsite) updateData.companyWebsite = input.data.companyWebsite;
      if (input.data.country) updateData.country = input.data.country;
      if (input.data.businessType) updateData.businessType = input.data.businessType;
      if (input.completed) updateData.ghlOnboardingCompleted = true;

      await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));

      return { success: true, step: input.step };
    }),
});
