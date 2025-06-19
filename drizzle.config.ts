import { defineConfig } from "drizzle-kit";
import { env } from "./shared/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "server/database/schemas/*",
  out: "server/database/migrations",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
