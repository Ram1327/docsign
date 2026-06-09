import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { generalLimiter } from "./middleware/rateLimiter.middleware";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.middleware";
import authRoutes from "./routes/auth.routes";
import documentRoutes from "./routes/document.routes";
import signatureRoutes from "./routes/signature.routes";
import auditRoutes from "./routes/audit.routes";

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(generalLimiter);

if (env.NODE_ENV === "development") {
  app.use("/uploads", express.static(path.join(process.cwd(), env.UPLOAD_DIR)));
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", environment: env.NODE_ENV, timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/signatures", signatureRoutes);
app.use("/api/audit", auditRoutes);
// app.use("/api/signing-links", signingLinkRoutes); // Day 9

app.use(notFoundHandler);
app.use(errorHandler);

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
