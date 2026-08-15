import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Invite-only: only seed/admin scripts create accounts.
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "PHARMACIST",
        input: false,
      },
    },
  },
  // Vercel sits behind a reverse proxy — needed for IP-based rate limits.
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 40,
    storage: "database",
    customRules: {
      "/sign-in/email": {
        window: 60 * 15,
        max: 8,
      },
      "/sign-up/email": {
        window: 60 * 15,
        max: 3,
      },
    },
  },
  plugins: [nextCookies()],
});
