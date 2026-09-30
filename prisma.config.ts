import path from "node:path";

import { defineConfig } from "prisma/config";

// A Prisma config file disables automatic .env loading, so load it here
// (no-op on Vercel, where env vars are already set)
try {
  process.loadEnvFile();
} catch {}

// Prisma 6 no longer finds prisma/migrations on its own when the schema
// is split across files in prisma/schema, so point to it explicitly
export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
});
