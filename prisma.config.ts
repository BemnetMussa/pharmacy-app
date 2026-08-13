import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // For migrate deploy against Supabase, prefer DIRECT_URL in the shell
    // (session pooler). Prisma 7 config does not support directUrl here.
    url: env("DATABASE_URL"),
  },
});
