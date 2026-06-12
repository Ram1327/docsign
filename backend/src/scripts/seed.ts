/**
 * DocSign Database Seed Script
 *
 * Creates a demo user so portfolio reviewers can log in immediately.
 *
 * Usage:
 *   cd backend
 *   npx tsx src/scripts/seed.ts
 *
 * Demo credentials created:
 *   Email:    demo@docsign.app
 *   Password: Demo1234
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set in .env");
  process.exit(1);
}

const DEMO_USER = {
  name: "Demo User",
  email: "demo@docsign.app",
  password: "Demo1234",
};

async function seed() {
  console.info("🌱 Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!);
  console.info("✅ Connected");

  // Dynamically import models after connection
  const { User } = await import("../models/User.model");

  // Check if demo user already exists
  const existing = await User.findOne({ email: DEMO_USER.email });
  if (existing) {
    console.info(`ℹ️  Demo user already exists: ${DEMO_USER.email}`);
    await mongoose.disconnect();
    return;
  }

  // Create demo user — bcrypt hook fires automatically
  await User.create(DEMO_USER);

  console.info("✅ Seed complete!");
  console.info("─────────────────────────────────");
  console.info(`   Email:    ${DEMO_USER.email}`);
  console.info(`   Password: ${DEMO_USER.password}`);
  console.info("─────────────────────────────────");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
