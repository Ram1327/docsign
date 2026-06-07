import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { generalLimiter } from "./middleware/rateLimiter.middleware";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.middleware";

const app = express();

// ─── Security middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Rate limiting ────────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Static files (dev only — in prod use S3/CDN) ─────────────────────────
if (env.NODE_ENV === "development") {
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), env.UPLOAD_DIR))
  );
}

// ─── Health check ─────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────────
import authRoutes from "./routes/auth.routes";
import documentRoutes from "./routes/document.routes";
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
// app.use("/api/signatures", signatureRoutes); // Day 5
// app.use("/api/signing-links", signingLinkRoutes); // Day 9
// app.use("/api/audit", auditRoutes);          // Day 10

// ─── 404 handler ─────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global error handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.info(`🚀 Server running on http://localhost:${env.PORT}`);
    console.info(`📁 Environment: ${env.NODE_ENV}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

export default app;
