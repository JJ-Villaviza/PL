import { z } from "zod";

const envSchema = z.object({
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_PORT: z.coerce.number(),
  DATABASE_URL: z.string().url(),
  SESSION_COOKIE: z.string().default("_session"),
  NODE_ENV: z.string().default("development"),
});

export const env = envSchema.parse(process.env);
