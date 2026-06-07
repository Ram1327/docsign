import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000").transform(Number),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 chars"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  UPLOAD_DIR: z.string().default("uploads"),
  MAX_FILE_SIZE_MB: z.string().default("10").transform(Number),

  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  SIGNING_LINK_EXPIRES_DAYS: z.string().default("7").transform(Number),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
