import mongoose from "mongoose";
import { env } from "./env";

const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 5;

export async function connectDB(retries = MAX_RETRIES): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.info("✅ MongoDB connected");
  } catch (error) {
    if (retries > 0) {
      console.warn(
        `⚠️  MongoDB connection failed. Retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} attempts left)`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retries - 1);
    }
    console.error("❌ MongoDB connection failed after all retries:", error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.info("MongoDB disconnected");
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDB();
  process.exit(0);
});
