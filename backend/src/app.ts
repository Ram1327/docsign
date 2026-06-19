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
import signingLinkRoutes from "./routes/signingLink.routes";

const app = express();

app.use(helmet());
const allowedOrigins = [
  env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith(".vercel.app") ||
                      origin.match(/^https:\/\/docsign-frontend-.*-3921s-projects\.vercel\.app$/);
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
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
app.use("/api/signing-links", signingLinkRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
  app.listen(env.PORT, () => {
    console.info(`🚀 Server running on http://localhost:${env.PORT}`);
    console.info(`📁 Environment: ${env.NODE_ENV}`);
  });

  connectDB().catch((err) => {
    console.error("Fatal database connection error:", err);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

export default app;
